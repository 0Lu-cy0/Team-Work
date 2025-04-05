import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    Modal,
    ScrollView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '@/constants/CustomText';
import MyButton from '@/components/MyButton';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thêm AsyncStorage

// Định nghĩa kiểu dữ liệu từ Supabase
type UserRow = Database['public']['Tables']['users']['Row'];

// Định nghĩa kiểu dữ liệu cho thành viên
interface TeamMember {
    id: string;
    full_name: string;
    avatar: string | null;
}

// Định nghĩa kiểu dữ liệu cho state được lưu
interface ProjectFormState {
    title: string;
    description: string;
    teamMembers: TeamMember[];
    dueDate: string; // Lưu dưới dạng chuỗi ISO
    permission: string;
}

const AddProject = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [permission, setPermission] = useState('No editing allowed');
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<UserRow[]>([]);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Hàm lưu state vào AsyncStorage
    const saveFormState = async (state: ProjectFormState) => {
        try {
            await AsyncStorage.setItem('addProjectFormState', JSON.stringify(state));
        } catch (error) {
            console.error('Lỗi khi lưu state:', error);
        }
    };

    // Hàm khôi phục state từ AsyncStorage
    const loadFormState = async () => {
        try {
            const savedState = await AsyncStorage.getItem('addProjectFormState');
            if (savedState) {
                const parsedState: ProjectFormState = JSON.parse(savedState);
                setTitle(parsedState.title);
                setDescription(parsedState.description);
                setTeamMembers(parsedState.teamMembers);
                setDueDate(new Date(parsedState.dueDate));
                setPermission(parsedState.permission);
            }
        } catch (error) {
            console.error('Lỗi khi khôi phục state:', error);
        }
    };

    // Lấy danh sách người dùng và khôi phục state
    useEffect(() => {
        const fetchUsersAndCurrentUser = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('Lỗi khi lấy thông tin người dùng hiện tại:', userError?.message);
                return;
            }
            setCurrentUserId(user.id);

            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, avatar')
                .returns<UserRow[]>();

            if (error) {
                console.error('Lỗi khi lấy danh sách người dùng:', error.message);
                return;
            }
            setAvailableUsers(data || []);
        };

        // Khôi phục state khi component mount
        loadFormState().then(() => fetchUsersAndCurrentUser());
    }, []);

    // Lưu state mỗi khi có thay đổi
    useEffect(() => {
        saveFormState({
            title,
            description,
            teamMembers,
            dueDate: dueDate.toISOString(),
            permission,
        });
    }, [title, description, teamMembers, dueDate, permission]);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    const onChangeTime = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setDueDate((prev) => {
                const newDate = new Date(prev);
                newDate.setHours(selectedTime.getHours());
                newDate.setMinutes(selectedTime.getMinutes());
                return newDate;
            });
        }
    };

    const handleAddMember = (user: UserRow) => {
        if (!teamMembers.find((member) => member.id === user.id)) {
            setTeamMembers([...teamMembers, { id: user.id, full_name: user.full_name || 'Không rõ', avatar: user.avatar }]);
        }
        setShowAddMemberModal(false);
    };

    const handleRemoveMember = (memberId: string) => {
        setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    };

    const handleCreateProject = async () => {
        if (!title.trim()) {
            alert('Tiêu đề dự án không được để trống!');
            return;
        }

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error('Người dùng chưa được xác thực');
            }

            const { data: project, error: projectError } = await supabase
                .from('projects')
                .insert({
                    title,
                    description,
                    due_date: dueDate.toISOString(),
                    status: 'ongoing',
                    created_by: user.id,
                    permission,
                })
                .select()
                .single();

            if (projectError) {
                throw projectError;
            }

            const projectId = project.id;

            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .insert({
                    project_id: projectId,
                    title: 'Task 1',
                    description: 'Task 1',
                    due_date: dueDate.toISOString(),
                    start_time: new Date().toISOString(),
                    end_time: dueDate.toISOString(),
                    created_by: user.id,
                    status: false,
                })
                .select()
                .single();

            if (taskError) {
                throw taskError;
            }

            const taskId = task.id;

            const teamEntries = [
                { project_id: projectId, task_id: taskId, user_id: user.id, role: 'lead' },
                ...teamMembers.map((member) => ({
                    project_id: projectId,
                    task_id: taskId,
                    user_id: member.id,
                    role: 'member',
                })),
            ];

            const { error: teamError } = await supabase
                .from('project_task_team')
                .insert(teamEntries);

            if (teamError) {
                throw teamError;
            }

            console.log('✅ Dự án được tạo thành công:', project);
            // Reset state sau khi tạo thành công
            setTitle('');
            setDescription('');
            setTeamMembers([]);
            setDueDate(new Date());
            setPermission('No editing allowed');
            await AsyncStorage.removeItem('addProjectFormState'); // Xóa state đã lưu
            router.back();
        } catch (error) {
            console.error('❌ Lỗi khi tạo dự án:', error);
            alert('Không thể tạo dự án. Vui lòng thử lại.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#212832', padding: 20 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/back.png' }}
                        style={{ width: 24, height: 24, tintColor: '#FFFFFF' }}
                    />
                </TouchableOpacity>
                <CustomText style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>
                    TẠO DỰ ÁN MỚI
                </CustomText>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Project Title */}
                <CustomText style={{ color: '#FFFFFF', marginBottom: 10 }}>TIÊU ĐỀ DỰ ÁN</CustomText>
                <TextInput
                    style={{
                        backgroundColor: '#455A64',
                        color: '#FFFFFF',
                        padding: 10,
                        borderRadius: 5,
                        marginBottom: 20,
                    }}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Nhập tiêu đề dự án"
                    placeholderTextColor="#B0BEC5"
                />

                {/* Project Details */}
                <CustomText style={{ color: '#FFFFFF', marginBottom: 10 }}>CHI TIẾT DỰ ÁN</CustomText>
                <TextInput
                    style={{
                        backgroundColor: '#455A64',
                        color: '#FFFFFF',
                        padding: 10,
                        borderRadius: 5,
                        marginBottom: 20,
                        height: 100,
                        textAlignVertical: 'top',
                    }}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Nhập chi tiết dự án"
                    placeholderTextColor="#B0BEC5"
                    multiline
                />

                {/* Add Team Members */}
                <CustomText style={{ color: '#FFFFFF', marginBottom: 10 }}>Thêm thành viên nhóm</CustomText>
                <View style={{ flexDirection: 'row', marginBottom: 20, alignItems: 'center' }}>
                    <FlatList
                        data={teamMembers}
                        horizontal
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                                <Image
                                    source={
                                        item.avatar
                                            ? { uri: item.avatar }
                                            : { uri: 'https://via.placeholder.com/40' }
                                    }
                                    style={{ width: 40, height: 40, borderRadius: 20 }}
                                />
                                <CustomText style={{ color: '#FFFFFF', marginLeft: 5 }}>{item.full_name}</CustomText>
                                <TouchableOpacity
                                    onPress={() => handleRemoveMember(item.id)}
                                    style={{ marginLeft: 5 }}
                                >
                                    <Image
                                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/delete-sign.png' }}
                                        style={{ width: 20, height: 20, tintColor: '#FFFFFF' }}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListFooterComponent={
                            <TouchableOpacity
                                onPress={() => setShowAddMemberModal(true)}
                                style={{
                                    backgroundColor: '#FED36A',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Image
                                    source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/plus.png' }}
                                    style={{ width: 20, height: 20, tintColor: '#000000' }}
                                />
                            </TouchableOpacity>
                        }
                    />
                </View>

                {/* Time & Date */}
                <CustomText style={{ color: '#FFFFFF', marginBottom: 10 }}>Thời gian & Ngày</CustomText>
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => setShowTimePicker(true)}
                        style={{
                            flexDirection: 'row',
                            backgroundColor: '#455A64',
                            padding: 10,
                            borderRadius: 5,
                            marginRight: 10,
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/clock.png' }}
                            style={{ width: 20, height: 20, tintColor: '#FED36A', marginRight: 5 }}
                        />
                        <CustomText style={{ color: '#FFFFFF' }}>
                            {dueDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={{
                            flexDirection: 'row',
                            backgroundColor: '#455A64',
                            padding: 10,
                            borderRadius: 5,
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/calendar.png' }}
                            style={{ width: 20, height: 20, tintColor: '#FED36A', marginRight: 5 }}
                        />
                        <CustomText style={{ color: '#FFFFFF' }}>
                            {dueDate.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            })}
                        </CustomText>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeDate}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={dueDate}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeTime}
                    />
                )}

                {/* Permission */}
                <CustomText style={{ color: '#FFFFFF', marginBottom: 10 }}>Quyền</CustomText>
                <TouchableOpacity
                    onPress={() => setShowPermissionModal(true)}
                    style={{
                        flexDirection: 'row',
                        backgroundColor: '#455A64',
                        padding: 10,
                        borderRadius: 5,
                        marginBottom: 20,
                        alignItems: 'center',
                    }}
                >
                    <CustomText style={{ color: '#FFFFFF', flex: 1 }}>{permission}</CustomText>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/expand-arrow.png' }}
                        style={{ width: 20, height: 20, tintColor: '#FED36A' }}
                    />
                </TouchableOpacity>

                {/* Create Button */}
                <MyButton
                    onPress={handleCreateProject}
                    title={<CustomText style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>TẠO</CustomText>}
                    style={{
                        backgroundColor: '#FED36A',
                        padding: 15,
                        borderRadius: 5,
                        alignItems: 'center',
                    }}
                />
            </ScrollView>

            {/* Modal chọn thành viên */}
            <Modal visible={showAddMemberModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20 }}>
                        <CustomText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Chọn Thành Viên Nhóm
                        </CustomText>
                        <FlatList
                            data={availableUsers.filter(
                                (user) => user.id !== currentUserId && !teamMembers.find((member) => member.id === user.id)
                            )}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleAddMember(item)}
                                    style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
                                >
                                    <Image
                                        source={
                                            item.avatar
                                                ? { uri: item.avatar }
                                                : { uri: 'https://via.placeholder.com/40' }
                                        }
                                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                                    />
                                    <CustomText>{item.full_name || 'Không rõ'}</CustomText>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            onPress={() => setShowAddMemberModal(false)}
                            style={{
                                backgroundColor: '#FED36A',
                                padding: 10,
                                borderRadius: 5,
                                alignItems: 'center',
                                marginTop: 10,
                            }}
                        >
                            <CustomText style={{ color: '#000000' }}>Đóng</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal chọn permission */}
            <Modal visible={showPermissionModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20 }}>
                        <CustomText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Chọn Quyền
                        </CustomText>
                        {['No editing allowed', 'Editing allowed'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => {
                                    setPermission(option);
                                    setShowPermissionModal(false);
                                }}
                                style={{ padding: 10 }}
                            >
                                <CustomText>{option}</CustomText>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setShowPermissionModal(false)}
                            style={{
                                backgroundColor: '#FED36A',
                                padding: 10,
                                borderRadius: 5,
                                alignItems: 'center',
                                marginTop: 10,
                            }}
                        >
                            <CustomText style={{ color: '#000000' }}>Đóng</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AddProject;