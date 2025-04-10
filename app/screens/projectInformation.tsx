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

type UserRow = Database['public']['Tables']['users']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface TeamMember {
    id: string;
    full_name: string;
    avatar: string | null;
    role?: string;
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
    const initialPermission = params.permission === 'true';
    const initialMembers = params.members ? JSON.parse(params.members as string) : [];

    const [title, setTitle] = useState(initialTitle || '');
    const [description, setDescription] = useState(initialDescription || '');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialMembers);
    const [dueDate, setDueDate] = useState(initialDueDate ? new Date(initialDueDate) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [permission, setPermission] = useState<boolean>(initialPermission);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<UserRow[]>([]);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [canEdit, setCanEdit] = useState<boolean>(false);

    useEffect(() => {
        const fetchProjectAndUsers = async () => {
            try {
                if (!projectId) {
                    alert('Không tìm thấy dự án. Vui lòng thử lại.');
                    router.back();
                    return;
                }

                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user || !user.id) {
                    throw new Error('Không thể xác thực người dùng');
                }
                setCurrentUserId(user.id);

                const { data: project, error: projectError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single()
                    .returns<ProjectRow>();

                if (projectError) {
                    throw new Error('Không thể tải thông tin dự án');
                }

                setTitle(project.title || initialTitle);
                setDescription(project.description || initialDescription || '');
                setDueDate(new Date(project.due_date || initialDueDate));
                setPermission(project.permission ?? initialPermission);
                console.log('[PERMISSION_SET] Initial permission set', {
                    permission: project.permission ?? initialPermission,
                    projectId
                });

                const { data: teamData, error: teamError } = await supabase
                    .from('project_task_team')
                    .select('user_id, users (id, full_name, avatar), role')
                    .eq('project_id', projectId);

                if (teamError) {
                    throw new Error('Không thể tải danh sách thành viên');
                }

                const uniqueMembers = Array.from(
                    new Map(
                        teamData.map((entry: any) => [
                            entry.user_id,
                            {
                                id: entry.user_id,
                                full_name: entry.users.full_name || 'Không rõ',
                                avatar: entry.users.avatar,
                                role: entry.role
                            }
                        ])
                    ).values()
                );
                setTeamMembers(uniqueMembers);

                const currentUserRole = uniqueMembers.find(member => member.id === user.id)?.role;
                setCanEdit(currentUserRole === 'lead');

                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id, full_name, avatar')
                    .returns<UserRow[]>();

                if (usersError) {
                    throw new Error('Không thể tải danh sách người dùng');
                }
                setAvailableUsers(users || []);

            } catch (error: any) {
                alert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
            }
        };

        fetchProjectAndUsers();

        // Lắng nghe thay đổi real-time từ bảng projects
        const projectChannel = supabase
            .channel(`projects-${projectId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
                (payload) => {
                    const updatedProject = payload.new as ProjectRow;
                    setTitle(updatedProject.title || '');
                    setDescription(updatedProject.description || '');
                    setDueDate(new Date(updatedProject.due_date));
                    setPermission(updatedProject.permission ?? false);
                    console.log('[PERMISSION_UPDATED] Real-time project update', {
                        projectId,
                        newPermission: updatedProject.permission
                    });
                }
            )
            .subscribe();

        // Lắng nghe thay đổi real-time từ bảng project_task_team
        const teamChannel = supabase
            .channel(`project_task_team-${projectId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'project_task_team', filter: `project_id=eq.${projectId}` },
                async (payload) => {
                    const { data: teamData, error: teamError } = await supabase
                        .from('project_task_team')
                        .select('user_id, users (id, full_name, avatar), role')
                        .eq('project_id', projectId);

                    if (teamError) {
                        console.error('Error fetching updated team data:', teamError);
                        return;
                    }

                    const uniqueMembers = Array.from(
                        new Map(
                            teamData.map((entry: any) => [
                                entry.user_id,
                                {
                                    id: entry.user_id,
                                    full_name: entry.users.full_name || 'Không rõ',
                                    avatar: entry.users.avatar,
                                    role: entry.role
                                }
                            ])
                        ).values()
                    );
                    setTeamMembers(uniqueMembers);

                    const currentUserRole = uniqueMembers.find(member => member.id === currentUserId)?.role;
                    setCanEdit(currentUserRole === 'lead');
                }
            )
            .subscribe();

        // Hủy đăng ký khi component unmount
        return () => {
            supabase.removeChannel(projectChannel);
            supabase.removeChannel(teamChannel);
        };
    }, [projectId, initialTitle, initialDescription, initialDueDate, initialPermission, currentUserId]);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        if (!canEdit) return;
        setShowDatePicker(false);
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    const onChangeTime = (event: any, selectedTime?: Date) => {
        if (!canEdit) return;
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
        if (!canEdit) return;
        if (!teamMembers.find((member) => member.id === user.id)) {
            setTeamMembers([...teamMembers, { id: user.id, full_name: user.full_name || 'Không rõ', avatar: user.avatar }]);
        }
        setShowAddMemberModal(false);
    };

    const handleRemoveMember = (memberId: string) => {
        if (!canEdit) return;
        setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    };

    const handleUpdateProject = async () => {
        if (!canEdit) return;
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
            console.log('[PERMISSION_UPDATED] Project permission updated in database', {
                projectId,
                newPermission: permission
            });

            const { data: tasks, error: taskError } = await supabase
                .from('tasks')
                .select('id')
                .eq('project_id', projectId);

            if (taskError || !tasks || tasks.length === 0) {
                throw taskError || new Error('Không tìm thấy task nào');
            }
            const taskIds = tasks.map(task => task.id);

            const { error: deleteTeamError } = await supabase
                .from('project_task_team')
                .delete()
                .eq('project_id', projectId);

            if (deleteTeamError) {
                throw deleteTeamError;
            }

            const teamEntries = taskIds.flatMap(taskId => [
                { project_id: projectId, task_id: taskId, user_id: currentUserId!, role: 'lead' },
                ...teamMembers.map((member) => ({
                    project_id: projectId,
                    task_id: taskId,
                    user_id: member.id,
                    role: 'member',
                })),
            ]);

            const { error: teamError } = await supabase
                .from('project_task_team')
                .insert(teamEntries);

            if (teamError) {
                throw teamError;
            }

            router.back();

        } catch (error: any) {
            alert('Không thể cập nhật dự án. Vui lòng thử lại.');
        }
    };

    const handleDeleteProject = async () => {
        if (!canEdit) return;
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

            router.push('/screens/home');

        } catch (error: any) {
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
                    editable={canEdit}
                />

                <CustomText style={styles.title2}>Project Details</CustomText>
                <TextInput
                    style={styles.input2}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter project details"
                    placeholderTextColor="#B0BEC5"
                    multiline
                    editable={canEdit}
                />

                <CustomText style={styles.title2}>Add team members</CustomText>
                <View style={styles.box1}>
                    <FlatList
                        style={styles.temMember}
                        data={teamMembers}
                        horizontal
                        keyExtractor={(item, index) => `${item.id}-${index}`}
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
                                {canEdit && (
                                    <TouchableOpacity onPress={() => handleRemoveMember(item.id)} style={{ marginLeft: 5 }}>
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/delete-sign.png' }}
                                            style={{ width: 20, height: 20, tintColor: '#FFFFFF' }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        ListFooterComponent={
                            canEdit ? (
                                <TouchableOpacity onPress={() => setShowAddMemberModal(true)} style={styles.addTeamMember}>
                                    <Image
                                        source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/plus.png' }}
                                        style={{ width: 20, height: 20, tintColor: '#000000' }}
                                    />
                                </TouchableOpacity>
                            ) : null
                        }
                    />
                </View>

                <CustomText style={styles.title2}>Time & Date</CustomText>
                <View style={styles.box2}>
                    <TouchableOpacity
                        onPress={() => canEdit && setShowTimePicker(true)}
                        style={styles.Time}
                        disabled={!canEdit}
                    >
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
                    <TouchableOpacity
                        onPress={() => canEdit && setShowDatePicker(true)}
                        style={styles.Date}
                        disabled={!canEdit}
                    >
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

                {showDatePicker && canEdit && (
                    <DateTimePicker
                        value={dueDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeDate}
                    />
                )}
                {showTimePicker && canEdit && (
                    <DateTimePicker
                        value={dueDate}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeTime}
                    />
                )}

                <CustomText style={styles.title2}>Permission</CustomText>
                <TouchableOpacity
                    onPress={() => {
                        if (canEdit) {
                            setShowPermissionModal(true);
                            console.log('[PERMISSION_MODAL_OPEN] Permission modal opened', { currentPermission: permission });
                        }
                    }}
                    style={[styles.input1, { flexDirection: 'row', alignItems: 'center', opacity: canEdit ? 1 : 0.6 }]}
                    disabled={!canEdit}
                >
                    <CustomText style={{ color: '#FFFFFF', flex: 1, fontSize: 16 }}>
                        {permission ? 'Allow editing' : 'No editing allowed'}
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
                        style={[styles.Delete, { opacity: canEdit ? 1 : 0.6 }]}
                        disabled={!canEdit}
                    />
                    <MyButton
                        onPress={handleUpdateProject}
                        title={<CustomText style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>CHANGE</CustomText>}
                        style={[styles.Change, { opacity: canEdit ? 1 : 0.6 }]}
                        disabled={!canEdit}
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
                                    disabled={!canEdit}
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
                        {[
                            { label: 'No editing allowed', value: false },
                            { label: 'Allow editing', value: true },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.label}
                                onPress={() => {
                                    if (canEdit) {
                                        console.log('[PERMISSION_CHANGE] Permission changed', {
                                            oldPermission: permission,
                                            newPermission: option.value,
                                            projectId
                                        });
                                        setPermission(option.value);
                                        setShowPermissionModal(false);
                                    }
                                }}
                                style={{ padding: 10 }}
                            >
                                <CustomText style={{ fontSize: 16 }}>{option.label}</CustomText>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => {
                                console.log('[PERMISSION_MODAL_CLOSE] Permission modal closed without change', { currentPermission: permission });
                                setShowPermissionModal(false);
                            }}
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