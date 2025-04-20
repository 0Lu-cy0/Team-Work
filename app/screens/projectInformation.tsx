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
import Head from '@/components/Head';
import { useThemeContext } from '@/context/ThemeContext';
import MyInputField from '@/components/MyInputField';
import Icon from '@/components/Icon';
import AddTeamMemberModal from '@/components/AddTeamMemberModal';
import TeamMembersList from '@/components/TeamMembersList'; // Import mới

type UserRow = Database['public']['Tables']['users']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectTeamInsert = Database['public']['Tables']['project_team']['Insert'];

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
    const { colors } = useThemeContext();

    useEffect(() => {
        const fetchProjectAndUsers = async () => {
            try {
                if (!projectId) {
                    console.error('[FETCH_PROJECT_ERROR] No projectId provided');
                    alert('Không tìm thấy dự án. Vui lòng thử lại.');
                    router.back();
                    return;
                }

                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user || !user.id) {
                    console.error('[FETCH_USER_ERROR] Cannot authenticate user:', userError?.message);
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
                    console.error('[FETCH_PROJECT_ERROR] Cannot load project:', projectError.message);
                    throw new Error('Không thể tải thông tin dự án');
                }

                setTitle(project.title || initialTitle);
                setDescription(project.description || initialDescription || '');
                setDueDate(new Date(project.due_date || initialDueDate));
                setPermission(project.permission ?? initialPermission);

                console.log('[PROJECT_DATA_SET]', {
                    projectId,
                    title: project.title || initialTitle,
                    description: project.description || initialDescription,
                    dueDate: project.due_date || initialDueDate,
                    permission: project.permission ?? initialPermission,
                });

                const { data: teamData, error: teamError } = await supabase
                    .from('project_team')
                    .select('user_id, users (id, full_name, avatar), role')
                    .eq('project_id', projectId);

                if (teamError) {
                    console.error('[FETCH_TEAM_ERROR] Cannot load team members:', teamError.message);
                    throw new Error('Không thể tải danh sách thành viên');
                }

                console.log('[TEAM_DATA_RAW]', { projectId, teamData });

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

                console.log('[PROJECT_DATA_SET]', {
                    projectId,
                    teamMembers: uniqueMembers,
                });

                const currentUserRole = uniqueMembers.find(member => member.id === user.id)?.role;
                setCanEdit(currentUserRole === 'leader');

                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id, full_name, avatar')
                    .returns<UserRow[]>();

                if (usersError) {
                    console.error('[FETCH_USERS_ERROR] Cannot load users:', usersError.message);
                    throw new Error('Không thể tải danh sách người dùng');
                }
                setAvailableUsers(users || []);

            } catch (error: any) {
                console.error('[FETCH_PROJECT_FAILED]', error.message);
                alert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
            }
        };

        fetchProjectAndUsers();

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
                    console.log('[PROJECT_UPDATED] Real-time project update', {
                        projectId,
                        title: updatedProject.title,
                        description: updatedProject.description,
                        dueDate: updatedProject.due_date,
                        permission: updatedProject.permission
                    });
                }
            )
            .subscribe();

        const teamChannel = supabase
            .channel(`project_team-${projectId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'project_team', filter: `project_id=eq.${projectId}` },
                async (payload) => {
                    const { data: teamData, error: teamError } = await supabase
                        .from('project_team')
                        .select('user_id, users (id, full_name, avatar), role')
                        .eq('project_id', projectId);

                    if (teamError) {
                        console.error('[FETCH_TEAM_UPDATE_ERROR] Error fetching updated team data:', teamError.message);
                        return;
                    }

                    console.log('[TEAM_UPDATE_RAW]', { projectId, teamData });

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
                    setCanEdit(currentUserRole === 'leader');

                    console.log('[TEAM_UPDATED] Real-time team update', {
                        projectId,
                        teamMembers: uniqueMembers,
                        canEdit: currentUserRole === 'leader'
                    });
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(projectChannel);
            supabase.removeChannel(teamChannel);
        };
    }, [projectId, initialTitle, initialDescription, initialDueDate, initialPermission, currentUserId]);

    const logger = {
        error: (message: string, error: any, context?: any) => {
            console.error(`[TaskDetails] ${message}`, {
                error: error?.message || error,
                stack: error?.stack,
                context,
                timestamp: new Date().toISOString(),
            });
        },
        warn: (message: string, context?: any) => {
            console.warn(`[TaskDetails] ${message}`, {
                context,
                timestamp: new Date().toISOString(),
            });
        },
    };

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

    const handleRemoveMember = async (memberId: string) => {
        if (!canEdit) return;
        try {
            const { error } = await supabase
                .from('project_team')
                .delete()
                .eq('project_id', projectId)
                .eq('user_id', memberId);

            if (error) {
                console.error('[REMOVE_MEMBER_ERROR] Cannot remove member:', error.message);
                throw new Error('Không thể xóa thành viên');
            }

            setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
        } catch (error: any) {
            console.error('[REMOVE_MEMBER_FAILED]', error.message);
            alert('Không thể xóa thành viên. Vui lòng thử lại.');
        }
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
                console.error('[UPDATE_PROJECT_ERROR] Cannot update project:', projectError.message);
                throw new Error('Không thể cập nhật dự án');
            }

            const { data: currentTeamData, error: fetchError } = await supabase
                .from('project_team')
                .select('user_id, role')
                .eq('project_id', projectId);

            if (fetchError) {
                console.error('[FETCH_CURRENT_TEAM_ERROR] Cannot fetch current team:', fetchError.message);
                throw new Error('Không thể lấy danh sách thành viên hiện tại');
            }

            const desiredTeam: ProjectTeamInsert[] = [
                { project_id: projectId, user_id: currentUserId!, role: 'leader' },
                ...teamMembers.map(member => ({
                    project_id: projectId,
                    user_id: member.id,
                    role: member.role || 'member',
                })),
            ];

            const currentTeamMap = new Map(currentTeamData.map(entry => [entry.user_id, entry]));
            const desiredTeamMap = new Map(desiredTeam.map(entry => [entry.user_id, entry]));

            const toDelete = currentTeamData.filter(entry => !desiredTeamMap.has(entry.user_id));
            if (toDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('project_team')
                    .delete()
                    .in('user_id', toDelete.map(d => d.user_id))
                    .eq('project_id', projectId);
                if (deleteError) {
                    console.error('[DELETE_TEAM_ERROR] Cannot delete team members:', deleteError.message);
                    throw new Error('Không thể xóa thành viên');
                }
            }

            const toUpsert: ProjectTeamInsert[] = desiredTeam.filter(entry => {
                const current = currentTeamMap.get(entry.user_id);
                return !current || current.role !== entry.role;
            });
            if (toUpsert.length > 0) {
                const { error: upsertError } = await supabase
                    .from('project_team')
                    .upsert(toUpsert, { onConflict: 'project_id,user_id' });
                if (upsertError) {
                    console.error('[UPSERT_TEAM_ERROR] Cannot upsert team members:', upsertError.message);
                    throw new Error('Không thể thêm/cập nhật thành viên');
                }
            }

            console.log('[UPDATE_PROJECT_SUCCESS]', { projectId, title, description, dueDate: dueDate.toISOString(), teamMembers });
            router.back();

        } catch (error: any) {
            console.error('[UPDATE_PROJECT_FAILED]', error.message);
            alert('Không thể cập nhật dự án. Vui lòng thử lại.');
        }
    };

    const handleDeleteProject = async () => {
        if (!canEdit) return;
        try {
            await supabase
                .from('project_team')
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
                console.error('[DELETE_PROJECT_ERROR] Cannot delete project:', error.message);
                throw new Error('Không thể xóa dự án');
            }

            console.log('[DELETE_PROJECT_SUCCESS]', { projectId });
            router.push('/screens/home');

        } catch (error: any) {
            console.error('[DELETE_PROJECT_FAILED]', error.message);
            alert('Không thể xóa dự án. Vui lòng thử lại.');
        }
    };

    const handleGoBack = () => {
        try {
            router.back();
        } catch (error) {
            logger.error("Error in handleGoBack", error);
        }
    };

    const handleMembersAdded = (newMembers: TeamMember[]) => {
        setTeamMembers([...teamMembers, ...newMembers]);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <Head
                onLeftPress={handleGoBack}
                showRightIcon={false}
            >
                <CustomText fontFamily='Inter' fontSize={25} style={[{ color: colors.text7 }]}>Project Information</CustomText>
            </Head>

            <ScrollView showsVerticalScrollIndicator={false}>
                <CustomText fontSize={22} style={[styles.title1, { color: colors.text7 }]}>Project Title</CustomText>
                <MyInputField
                    style={{ paddingHorizontal: 20 }}
                    textStyle={{ fontSize: 21, opacity: 0.99 }}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter project title"
                    backgroundColor={colors.box2}
                    editable={canEdit}
                />

                <CustomText fontSize={22} style={[styles.title1, { color: colors.text7 }]}>Project Details</CustomText>
                <MyInputField
                    style={{ paddingHorizontal: 20, height: 100, flexWrap: 'wrap' }}
                    textStyle={{ fontSize: 13, opacity: 0.99 }}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter project details"
                    backgroundColor={colors.box2}
                    editable={canEdit}
                />

                <CustomText fontFamily='Inter' fontSize={22} style={[styles.title2, { color: colors.text7 }]}>Add team members</CustomText>
                <TeamMembersList
                    teamMembers={teamMembers}
                    canEdit={canEdit}
                    colors={colors}
                    onRemoveMember={handleRemoveMember}
                    onOpenAddMemberModal={() => setShowAddMemberModal(true)}
                    avatarSize={20}
                />

                <CustomText fontFamily='Inter' fontSize={22} style={[styles.title2, { color: colors.text7 }]}>Time & Date</CustomText>
                <View style={styles.box2}>
                    <TouchableOpacity
                        onPress={() => canEdit && setShowTimePicker(true)}
                        style={[styles.Time, { backgroundColor: colors.box2 }]}
                        disabled={!canEdit}
                    >
                        <View style={{ backgroundColor: colors.box1, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Icon category='screens' name='clock' style={{ width: 24, height: 24 }} />
                        </View>
                        <View style={styles.timeView}>
                            <CustomText fontSize={20} style={{ color: colors.text5 }}>
                                {dueDate && !isNaN(dueDate.getTime())
                                    ? dueDate.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    })
                                    : 'Invalid Time'}
                            </CustomText>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => canEdit && setShowDatePicker(true)}
                        style={[styles.Date, { backgroundColor: colors.box2 }]}
                        disabled={!canEdit}
                    >
                        <View style={[styles.dateIcon, { backgroundColor: colors.box1 }]}>
                            <Icon category='screens' name='calendar' style={{ width: 24, height: 24 }} />
                        </View>
                        <View style={styles.dateView}>
                            <CustomText fontSize={20} style={{ color: colors.text5 }}>
                                {dueDate && !isNaN(dueDate.getTime())
                                    ? dueDate.toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    })
                                    : 'Invalid Date'}
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

                <CustomText fontFamily='Inter' fontSize={22} style={[styles.title2, { color: colors.text7 }]}>Permission</CustomText>
                <TouchableOpacity
                    onPress={() => {
                        if (canEdit) {
                            setShowPermissionModal(true);
                            console.log('[PERMISSION_MODAL_OPEN] Permission modal opened', { currentPermission: permission });
                        }
                    }}
                    style={[{ flexDirection: 'row', width: '65%', height: 40, opacity: canEdit ? 1 : 0.6 }]}
                    disabled={!canEdit}
                >
                    <View style={{ flex: 1, backgroundColor: colors.box1, justifyContent: 'center', alignItems: 'center' }}>
                        <Icon category='screens' name='more' style={{ width: 24, height: 24 }} />
                    </View>
                    <View style={{ flex: 4, backgroundColor: colors.box2, justifyContent: 'center', alignItems: 'center' }}>
                        <CustomText fontSize={20} style={{ color: colors.text5, opacity: 0.9 }}>
                            {permission ? 'Allow editing' : 'No editing allowed'}
                        </CustomText>
                    </View>
                </TouchableOpacity>

                <View style={styles.deleteChange}>
                    <MyButton
                        onPress={handleDeleteProject}
                        title={<CustomText fontFamily='InterSemiBold' fontSize={18} style={{ color: colors.text5 }}>Delete</CustomText>}
                        style={[styles.Delete, { opacity: canEdit ? 1 : 0.6 }]}
                        disabled={!canEdit}
                        backgroundColor={colors.box2}
                    />
                    <MyButton
                        onPress={handleUpdateProject}
                        title={<CustomText fontFamily='InterSemiBold' fontSize={18} style={{ color: colors.text4 }}>Change</CustomText>}
                        style={[styles.Change, { opacity: canEdit ? 1 : 0.6 }]}
                        disabled={!canEdit}
                        backgroundColor={colors.box1}
                    />
                </View>
            </ScrollView>

            <AddTeamMemberModal
                visible={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                availableUsers={availableUsers}
                teamMembers={teamMembers}
                projectId={projectId}
                currentUserId={currentUserId}
                canEdit={canEdit}
                colors={colors}
                onMembersAdded={handleMembersAdded}
            />

            <Modal visible={showPermissionModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: colors.backgroundColor, padding: 20 }}>
                        <CustomText fontFamily='InterSemiBold' fontSize={22} style={{ marginBottom: 10, textAlign: 'center', color: colors.text7 }}>
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
                                <CustomText fontSize={16} style={{ color: colors.text5 }}>{option.label}</CustomText>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => {
                                console.log('[PERMISSION_MODAL_CLOSE] Permission modal closed without change', { currentPermission: permission });
                                setShowPermissionModal(false);
                            }}
                            style={{
                                backgroundColor: colors.box1,
                                padding: 10,
                                alignItems: 'center',
                                marginTop: 10,
                            }}
                        >
                            <CustomText style={{ color: colors.text4, fontSize: 16 }}>Close</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ProjectInformation;