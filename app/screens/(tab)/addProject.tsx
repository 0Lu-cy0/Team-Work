import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Platform,
    RefreshControl,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '@/constants/CustomText';
import MyButton from '@/components/MyButton';
import AddTeamMemberModalSimple from '@/components/AddTeamMemberModalSimple';
import TeamMembersList from '@/components/TeamMembersList';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '@/context/ThemeContext';
import MyInputField from '@/components/MyInputField';
import styles from '@/styles/projectInformation';
import Icon from '@/components/Icon';

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
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { colors } = useThemeContext();

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
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user || !user.id) {
                    console.error('Lỗi khi lấy thông tin người dùng:', userError?.message);
                    throw new Error('Không thể xác thực người dùng');
                }
                setCurrentUserId(user.id);

                const { data, error } = await supabase
                    .from('users')
                    .select('id, full_name, avatar')
                    .neq('id', user.id)
                    .limit(50);

                if (error) {
                    console.error('Lỗi khi lấy danh sách người dùng:', error.message);
                    throw new Error('Không thể tải danh sách người dùng');
                }
                setAvailableUsers(data || []);
            } catch (error: any) {
                alert(`Lỗi: ${error.message || 'Không thể tải dữ liệu'}`);
            } finally {
                setIsLoading(false);
            }
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

    const assignTeamMembers = async (projectId: string, userId: string) => {
        const teamEntries = [
            { project_id: projectId, user_id: userId, role: 'leader' },
            ...teamMembers.map((member) => ({
                project_id: projectId,
                user_id: member.id,
                role: 'member',
            })),
        ];
        const { error } = await supabase.from('project_team').insert(teamEntries);
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

            await assignTeamMembers(project.id, user.id);

            const task = await createInitialTask(project.id, user.id);
            if (!task || !task.id) throw new Error('Không thể tạo task ban đầu');

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
        <View style={{ flex: 1, backgroundColor: colors.backgroundColor, paddingHorizontal: 20 }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <CustomText fontSize={22} style={{ marginBottom: 8, color: colors.text7 }}>
                    Project Title
                </CustomText>
                <MyInputField
                    style={{ paddingHorizontal: 20 }}
                    textStyle={{ fontSize: 21, opacity: 0.99 }}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter project title"
                    backgroundColor={colors.box2}
                />
                <CustomText fontSize={22} style={{ color: colors.text7, marginBottom: 8, marginTop: 33 }}>
                    Project Details
                </CustomText>
                <MyInputField
                    style={{ paddingHorizontal: 20, height: 100, flexWrap: 'wrap' }}
                    textStyle={{ fontSize: 13, opacity: 0.99 }}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter project details"
                    backgroundColor={colors.box2}
                />

                <CustomText fontSize={22} style={{ color: colors.text7, marginBottom: 8, marginTop: 33 }}>
                    Add team members
                </CustomText>
                <TeamMembersList
                    teamMembers={teamMembers}
                    canEdit={!isLoading}
                    colors={colors}
                    onRemoveMember={handleRemoveMember}
                    onOpenAddMemberModal={() => setShowAddMemberModal(true)}
                    avatarSize={20}
                />

                <CustomText fontFamily='Inter' fontSize={22} style={[styles.title2, { color: colors.text7 }]}>Time & Date</CustomText>
                <View style={styles.box2}>
                    <TouchableOpacity
                        onPress={() => setShowTimePicker(true)}
                        style={[styles.Time, { backgroundColor: colors.box2 }]}
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
                        onPress={() => setShowDatePicker(true)}
                        style={[styles.Date, { backgroundColor: colors.box2 }]}
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

                <CustomText fontFamily='Inter' fontSize={22} style={[styles.title2, { color: colors.text7 }]}>Permission</CustomText>
                <TouchableOpacity
                    onPress={() => {
                        setShowPermissionModal(true);
                    }}
                    style={[{ flexDirection: 'row', width: '65%', height: 40 }]}
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

                <MyButton
                    onPress={handleCreateProject}
                    title={<CustomText fontFamily='InterSemiBold' fontSize={18} style={{ color: colors.text4 }}>Create</CustomText>}
                    disabled={isLoading}
                    style={{
                        backgroundColor: isLoading ? '#B0BEC5' : '#FED36A',
                        paddingVertical: 15,
                        alignItems: 'center',
                        marginTop: 20,
                    }}
                />
            </ScrollView>

            <AddTeamMemberModalSimple
                visible={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                availableUsers={availableUsers}
                selectedMembers={teamMembers}
                onMembersSelected={setTeamMembers}
                colors={colors}
            />

            <Modal visible={showPermissionModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: colors.backgroundColor, padding: 20 }}>
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
                                backgroundColor: colors.box1,
                                padding: 10,
                                alignItems: 'center',
                                marginTop: 10,
                            }}
                            disabled={isLoading}
                        >
                            <CustomText style={{ color: colors.text4 }}>Đóng</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AddProject;