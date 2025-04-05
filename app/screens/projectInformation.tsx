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
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '@/constants/CustomText';
import MyButton from '@/components/MyButton';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import styles from '@/styles/projectInformation';

// Định nghĩa kiểu dữ liệu từ Supabase
type UserRow = Database['public']['Tables']['users']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface TeamMember {
    id: string;
    full_name: string;
    avatar: string | null;
}

const ProjectInformation = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const projectId = params.id as string;
    const initialTitle = params.title as string;
    const initialDescription = params.description as string;
    const initialDueDate = params.due_date as string;
    const initialTeamMember = params.teamMember ? parseInt(params.teamMember as string, 10) : 0;
    const initialType = params.type as string;
    const initialPermission = params.permission as string || 'No editing allowed';

    const [title, setTitle] = useState(initialTitle || '');
    const [description, setDescription] = useState(initialDescription || '');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [dueDate, setDueDate] = useState(initialDueDate ? new Date(initialDueDate) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [permission, setPermission] = useState(initialPermission);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<UserRow[]>([]);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjectAndUsers = async () => {
            if (!projectId) {
                console.error('Project ID is undefined. Cannot fetch project information.');
                alert('Không tìm thấy dự án. Vui lòng thử lại.');
                router.back();
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('Lỗi khi lấy thông tin người dùng hiện tại:', userError?.message);
                return;
            }
            setCurrentUserId(user.id);

            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single()
                .returns<ProjectRow>();

            if (projectError) {
                console.error('Lỗi khi lấy thông tin dự án:', projectError.message);
                alert('Không thể tải thông tin dự án. Vui lòng thử lại.');
                return;
            }

            setTitle(project.title || initialTitle);
            setDescription(project.description || initialDescription || '');
            setDueDate(new Date(project.due_date || initialDueDate));
            setPermission(project.permission || initialPermission);

            const { data: teamData, error: teamError } = await supabase
                .from('project_task_team')
                .select('user_id, users (id, full_name, avatar)')
                .eq('project_id', projectId);

            if (teamError) {
                console.error('Lỗi khi lấy thành viên nhóm:', teamError.message);
                return;
            }

            const members = teamData.map((entry: any) => ({
                id: entry.user_id,
                full_name: entry.users.full_name || 'Không rõ',
                avatar: entry.users.avatar,
            }));
            setTeamMembers(members);

            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, full_name, avatar')
                .returns<UserRow[]>();

            if (usersError) {
                console.error('Lỗi khi lấy danh sách người dùng:', usersError.message);
                return;
            }
            setAvailableUsers(users || []);
        };

        fetchProjectAndUsers();
    }, [projectId, initialTitle, initialDescription, initialDueDate, initialPermission]);

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

    const handleUpdateProject = async () => {
        if (!title.trim()) {
            alert('Tiêu đề dự án không được để trống!');
            return;
        }

        try {
            const { error: projectError } = await supabase
                .from('projects')
                .update({
                    title,
                    description,
                    due_date: dueDate.toISOString(),
                    permission,
                })
                .eq('id', projectId);

            if (projectError) {
                throw projectError;
            }

            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select('id')
                .eq('project_id', projectId)
                .single();

            if (taskError) {
                throw taskError;
            }

            const taskId = task.id;

            const { error: deleteTeamError } = await supabase
                .from('project_task_team')
                .delete()
                .eq('project_id', projectId);

            if (deleteTeamError) {
                throw deleteTeamError;
            }

            const teamEntries = [
                { project_id: projectId, task_id: taskId, user_id: currentUserId!, role: 'lead' },
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

            console.log('✅ Dự án được cập nhật thành công');
            router.back();
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật dự án:', error);
            alert('Không thể cập nhật dự án. Vui lòng thử lại.');
        }
    };

    const handleDeleteProject = async () => {
        try {
            await supabase
                .from('project_task_team')
                .delete()
                .eq('project_id', projectId);

            await supabase
                .from('tasks')
                .delete()
                .eq('project_id', projectId);

            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) {
                throw error;
            }

            console.log('✅ Dự án đã được xóa');
            router.back();
        } catch (error) {
            console.error('❌ Lỗi khi xóa dự án:', error);
            alert('Không thể xóa dự án. Vui lòng thử lại.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/back.png' }}
                        style={{ width: 24, height: 24, tintColor: '#FFFFFF' }}
                    />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>Project Information</CustomText>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <CustomText style={styles.title1}>Project Title</CustomText>
                <TextInput
                    style={styles.input1}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter project title"
                    placeholderTextColor="#B0BEC5"
                />

                <CustomText style={styles.title2}>Project Details</CustomText>
                <TextInput
                    style={styles.input2}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter project details"
                    placeholderTextColor="#B0BEC5"
                    multiline
                />

                <CustomText style={styles.title2}>Add team members</CustomText>
                <View style={styles.box1}>
                    <FlatList
                        style={styles.temMember}
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
                                    style={{ width: 41, height: 41, borderRadius: 20.5 }}
                                />
                                <CustomText style={{ color: '#FFFFFF', marginLeft: 5, fontSize: 14 }}>
                                    {item.full_name}
                                </CustomText>
                                <TouchableOpacity onPress={() => handleRemoveMember(item.id)} style={{ marginLeft: 5 }}>
                                    <Image
                                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/delete-sign.png' }}
                                        style={{ width: 20, height: 20, tintColor: '#FFFFFF' }}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListFooterComponent={
                            <TouchableOpacity onPress={() => setShowAddMemberModal(true)} style={styles.addTeamMember}>
                                <Image
                                    source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/plus.png' }}
                                    style={{ width: 20, height: 20, tintColor: '#000000' }}
                                />
                            </TouchableOpacity>
                        }
                    />
                </View>

                <CustomText style={styles.title2}>Time & Date</CustomText>
                <View style={styles.box2}>
                    <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.Time}>
                        <View style={styles.timeIcon}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/clock.png' }}
                                style={{ width: 20, height: 20, tintColor: '#000000' }}
                            />
                        </View>
                        <View style={styles.timeView}>
                            <CustomText style={{ color: '#FFFFFF', fontSize: 16 }}>
                                {dueDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </CustomText>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.Date}>
                        <View style={styles.dateIcon}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/calendar.png' }}
                                style={{ width: 20, height: 20, tintColor: '#000000' }}
                            />
                        </View>
                        <View style={styles.dateView}>
                            <CustomText style={{ color: '#FFFFFF', fontSize: 16 }}>
                                {dueDate.toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                })}
                            </CustomText>
                        </View>
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

                <CustomText style={styles.title2}>Permission</CustomText>
                <TouchableOpacity
                    onPress={() => setShowPermissionModal(true)}
                    style={[styles.input1, { flexDirection: 'row', alignItems: 'center' }]}
                >
                    <CustomText style={{ color: '#FFFFFF', flex: 1, fontSize: 16 }}>
                        {permission}
                    </CustomText>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/expand-arrow.png' }}
                        style={{ width: 20, height: 20, tintColor: '#FED36A' }}
                    />
                </TouchableOpacity>

                <View style={styles.deleteChange}>
                    <MyButton
                        onPress={handleDeleteProject}
                        title={<CustomText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>DELETE</CustomText>}
                        style={styles.Delete}
                    />
                    <MyButton
                        onPress={handleUpdateProject}
                        title={<CustomText style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>CHANGE</CustomText>}
                        style={styles.Change}
                    />
                </View>
            </ScrollView>

            <Modal visible={showAddMemberModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20 }}>
                        <CustomText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Add Team Member
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
                                    <CustomText style={{ fontSize: 16 }}>{item.full_name || 'Không rõ'}</CustomText>
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
                            <CustomText style={{ color: '#000000', fontSize: 16 }}>Close</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showPermissionModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20 }}>
                        <CustomText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            Select Permission
                        </CustomText>
                        {['No editing allowed', 'Allow editing'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => {
                                    setPermission(option);
                                    setShowPermissionModal(false);
                                }}
                                style={{ padding: 10 }}
                            >
                                <CustomText style={{ fontSize: 16 }}>{option}</CustomText>
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
                            <CustomText style={{ color: '#000000', fontSize: 16 }}>Close</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ProjectInformation;