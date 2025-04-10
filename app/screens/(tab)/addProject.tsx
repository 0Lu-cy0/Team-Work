import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    ScrollView,
    Platform,
    RefreshControl,
    Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '@/constants/CustomText';
import MyButton from '@/components/MyButton';
import TaskMembersModal from '@/components/TaskMembersModal'; // Import TaskMembersModal
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRow = Database['public']['Tables']['users']['Row'];
interface TeamMember {
    id: string;
    full_name: string;
    avatar: string | null;
}
interface AvailableUser {
    id: string;
    full_name: string;
    avatar: string | null;
}
interface ProjectFormState {
    title: string;
    description: string;
    teamMembers: TeamMember[];
    dueDate: string;
    permission: boolean;
}

const AddProject = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [permission, setPermission] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showTaskMembersModal, setShowTaskMembersModal] = useState(false); // Thay thế showAddMemberModal
    const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const saveFormState = async (state: ProjectFormState) => {
        try {
            await AsyncStorage.setItem('addProjectFormState', JSON.stringify(state));
        } catch (error) {
            console.error('Lỗi khi lưu state:', error);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            saveFormState({
                title,
                description,
                teamMembers,
                dueDate: dueDate.toISOString(),
                permission,
            });
        }, 500);
        return () => clearTimeout(timeout);
    }, [title, description, teamMembers, dueDate, permission]);

    const loadFormState = async () => {
        try {
            const savedState = await AsyncStorage.getItem('addProjectFormState');
            if (savedState) {
                const parsedState: ProjectFormState = JSON.parse(savedState);
                setTitle(parsedState.title || '');
                setDescription(parsedState.description || '');
                setTeamMembers(parsedState.teamMembers || []);
                setDueDate(new Date(parsedState.dueDate || Date.now()));
                setPermission(parsedState.permission ?? false);
            }
        } catch (error) {
            console.error('Lỗi khi khôi phục state:', error);
        }
    };

    useEffect(() => {
        const fetchUsersAndCurrentUser = async () => {
            setIsLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user || !user.id) {
                console.error('Lỗi khi lấy thông tin người dùng:', userError?.message);
                setIsLoading(false);
                return;
            }
            setCurrentUserId(user.id);

            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, avatar')
                .neq('id', user.id)
                .limit(50);

            if (error) {
                console.error('Lỗi khi lấy danh sách người dùng:', error.message);
            } else {
                setAvailableUsers(data || []);
            }
            setIsLoading(false);
        };

        loadFormState().then(fetchUsersAndCurrentUser);
    }, []);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDueDate(selectedDate);
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

    const handleSaveMembers = (selectedMemberIds: string[]) => {
        const newTeamMembers = availableUsers
            .filter(user => selectedMemberIds.includes(user.id))
            .map(user => ({
                id: user.id,
                full_name: user.full_name || 'Không rõ',
                avatar: user.avatar,
            }));
        setTeamMembers(newTeamMembers);
        setShowTaskMembersModal(false);
    };

    const handleRemoveMember = (memberId: string) => {
        setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    };

    const createProject = async (userId: string) => {
        const { data, error } = await supabase
            .from('projects')
            .insert({
                title,
                description,
                due_date: dueDate.toISOString(),
                status: 'ongoing',
                created_by: userId,
                permission,
            })
            .select()
            .single();
        if (error) {
            console.error('Lỗi khi tạo project:', error);
            throw error;
        }
        return data;
    };

    const createInitialTask = async (projectId: string, userId: string) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                project_id: projectId,
                title: 'Task 1',
                description: 'Task 1',
                due_date: dueDate.toISOString(),
                start_time: new Date().toISOString(),
                end_time: dueDate.toISOString(),
                created_by: userId,
                status: false,
            })
            .select()
            .single();
        if (error) {
            console.error('Lỗi khi tạo task:', error);
            throw error;
        }
        return data;
    };

    const assignTeamMembers = async (projectId: string, taskId: string, userId: string) => {
        const teamEntries = [
            { project_id: projectId, task_id: taskId, user_id: userId, role: 'lead' },
            ...teamMembers.map((member) => ({
                project_id: projectId,
                task_id: taskId,
                user_id: member.id,
                role: 'member',
            })),
        ];
        const { error } = await supabase.from('project_task_team').insert(teamEntries);
        if (error) {
            console.error('Lỗi khi gán thành viên:', error);
            throw error;
        }
    };

    const handleCreateProject = async () => {
        if (isLoading) return;
        if (!title.trim()) {
            alert('Tiêu đề dự án không được để trống!');
            return;
        }
        if (dueDate < new Date()) {
            alert('Ngày hết hạn phải lớn hơn hiện tại!');
            return;
        }
        if (teamMembers.length === 0) {
            alert('Phải có ít nhất một thành viên trong nhóm!');
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.id) throw new Error('Người dùng chưa được xác thực');

            const project = await createProject(user.id);
            if (!project || !project.id) throw new Error('Không thể lấy ID dự án');

            const task = await createInitialTask(project.id, user.id);
            if (!task || !task.id) throw new Error('Không thể tạo task ban đầu');

            await assignTeamMembers(project.id, task.id, user.id);

            setTitle('');
            setDescription('');
            setTeamMembers([]);
            setDueDate(new Date());
            setPermission(false);
            await AsyncStorage.removeItem('addProjectFormState');
            router.back();
        } catch (error: any) {
            console.error('❌ Lỗi khi tạo dự án:', error);
            alert(`Không thể tạo dự án: ${error.message || 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
        setRefreshing(true);
        await loadFormState();
        setRefreshing(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#212832', padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/back.png' }}
                        style={{ width: 24, height: 24, tintColor: '#FFFFFF' }}
                    />
                </TouchableOpacity>
                <CustomText style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>
                    TẠO DỰ ÁN MỚI
                </CustomText>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
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
                    editable={!isLoading}
                />

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
                    editable={!isLoading}
                />

                <CustomText style={{ color: '#FFFFFF', marginBottom: 10 }}>Thêm thành viên nhóm</CustomText>
                <View style={{ flexDirection: 'row', marginBottom: 20, alignItems: 'center' }}>
                    <FlatList
                        data={teamMembers}
                        horizontal
                        keyExtractor={(item) => item.id}
                        initialNumToRender={5}
                        maxToRenderPerBatch={10}
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
                                    disabled={isLoading}
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
                                onPress={() => setShowTaskMembersModal(true)}
                                style={{
                                    backgroundColor: '#FED36A',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                disabled={isLoading}
                            >
                                <Image
                                    source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/plus.png' }}
                                    style={{ width: 20, height: 20, tintColor: '#000000' }}
                                />
                            </TouchableOpacity>
                        }
                    />
                </View>

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
                        disabled={isLoading}
                    >
                        <Image
                            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/clock.png' }}
                            style={{ width: 20, height: 20, tintColor: '#FED36A', marginRight: 5 }}
                        />
                        <CustomText style={{ color: '#FFFFFF' }}>
                            {dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                        disabled={isLoading}
                    >
                        <Image
                            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/calendar.png' }}
                            style={{ width: 20, height: 20, tintColor: '#FED36A', marginRight: 5 }}
                        />
                        <CustomText style={{ color: '#FFFFFF' }}>
                            {dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                    disabled={isLoading}
                >
                    <CustomText style={{ color: '#FFFFFF', flex: 1 }}>
                        {permission ? 'Allow editing' : 'No editing allowed'}
                    </CustomText>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/expand-arrow.png' }}
                        style={{ width: 20, height: 20, tintColor: '#FED36A' }}
                    />
                </TouchableOpacity>

                <MyButton
                    onPress={handleCreateProject}
                    title={<CustomText style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>TẠO</CustomText>}
                    disabled={isLoading}
                    style={{
                        backgroundColor: isLoading ? '#B0BEC5' : '#FED36A',
                        padding: 15,
                        borderRadius: 5,
                        alignItems: 'center',
                    }}
                />
            </ScrollView>

            {/* Sử dụng TaskMembersModal thay cho modal cũ */}
            <TaskMembersModal
                visible={showTaskMembersModal}
                onClose={() => setShowTaskMembersModal(false)}
                members={availableUsers
                    .filter(user => user.id !== currentUserId && !teamMembers.find(member => member.id === user.id))
                    .map(user => ({
                        user_id: user.id,
                        name: user.full_name || 'Không rõ',
                        avatar: user.avatar,
                    }))}
                selectedMembers={teamMembers.map(member => member.id)}
                onSave={handleSaveMembers}
            />

            <Modal visible={showPermissionModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20 }}>
                        <CustomText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Chọn Quyền
                        </CustomText>
                        {[
                            { label: 'No editing allowed', value: false },
                            { label: 'Allow editing', value: true },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.label}
                                onPress={() => {
                                    setPermission(option.value);
                                    setShowPermissionModal(false);
                                }}
                                style={{ padding: 10 }}
                                disabled={isLoading}
                            >
                                <CustomText>{option.label}</CustomText>
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
                            disabled={isLoading}
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