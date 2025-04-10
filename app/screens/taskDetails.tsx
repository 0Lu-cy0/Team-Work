import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Head from '@/components/Head';
import styles from '@/styles/taskDetail';
import CustomText from '@/constants/CustomText';
import CompletedCircle from '@/components/CompletedCircle';
import MyButton from '@/components/MyButton';
import TaskModal from '@/components/TaskModal';
import AddTaskModal from '@/components/AddTaskModal';
import TaskMembersModal from '@/components/TaskMembersModal';
import TeamMembersModal from '@/components/TeamMembersModal';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import Icon from '@/components/Icon';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface Member {
    user_id: string;
    avatar: string | null;
    name: string;
    role?: string;
}

const calculateCompletionPercentage = (tasks: TaskRow[]): number =>
    tasks.length === 0 ? 0 : parseFloat(((tasks.filter((task) => task.status).length / tasks.length) * 100).toFixed(2));

const TaskDetails: React.FC = () => {
    const router = useRouter();
    const { title, id, due_date, projectDetails, type, permission: initialPermission, members } = useLocalSearchParams();
    const processedTitle = title ? (title as string).replace(/\n/g, ' ') : 'No Title';
    const processID = id?.toString() || null;
    const initialDueDate = due_date
        ? new Date(Array.isArray(due_date) ? due_date[0] : due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })
        : 'No Due Date';
    const initialProjectDetails = projectDetails || '';
    const initialMembers = members ? JSON.parse(members as string) : [];

    const [processedDueDate, setProcessedDueDate] = useState<string>(initialDueDate);
    const [processedProjectDetails, setProcessedProjectDetails] = useState<string | string[] | undefined>(initialProjectDetails);
    const [processedMembers, setProcessedMembers] = useState<Member[]>(initialMembers);
    const [tasks, setTasks] = useState<TaskRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalAddTaskVisible, setModalAddTaskVisible] = useState(false);
    const [taskModalVisible, setTaskModalVisible] = useState(false);
    const [teamModalVisible, setTeamModalVisible] = useState(false);
    const [nameTask, setNameTask] = useState<string>('');
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const [taskProgress, setTaskProgress] = useState<number>(0);
    const [dueTimeTask, setDueTimeTask] = useState<Date>(new Date());
    const [dueDateTask, setDueDateTask] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [taskMembersModalVisible, setTaskMembersModalVisible] = useState(false);
    const [taskMembers, setTaskMembers] = useState<{ [taskId: string]: string[] }>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        setTaskProgress(calculateCompletionPercentage(tasks));
    }, [tasks]);

    useEffect(() => {
        if (!processID) return;

        const fetchInitialDataAndPermission = async () => {
            setLoading(true);

            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;
            if (userResponse.error || !user || !user.id) {
                console.error('❌ Lỗi khi lấy thông tin người dùng:', userResponse.error);
                setLoading(false);
                return;
            }
            setCurrentUserId(user.id);

            const [tasksRes, projectRes, teamRes, taskTeamRes] = await Promise.all([
                supabase.from('tasks').select('*').eq('project_id', processID),
                supabase.from('projects').select('due_date, description, status, created_by, permission').eq('id', processID).single(),
                supabase.from('project_task_team').select('user_id, users (avatar, full_name), role').eq('project_id', processID),
                supabase.from('project_task_team').select('task_id, user_id').eq('project_id', processID),
            ]);

            if (!tasksRes.error) {
                const uniqueTasks = Array.from(new Map(tasksRes.data.map(task => [task.id, task])).values());
                setTasks(uniqueTasks || []);
            }
            if (!projectRes.error) {
                setProcessedDueDate(new Date(projectRes.data.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }));
                setProcessedProjectDetails(projectRes.data.description || '');
                setCanEdit(projectRes.data.created_by === user.id || projectRes.data.permission === true);
            }
            if (!teamRes.error) {
                const membersData = teamRes.data.map((item: any) => ({
                    user_id: item.user_id,
                    avatar: item.users.avatar,
                    name: item.users.full_name || 'Unknown',
                    role: item.role || 'Member',
                }));
                const uniqueMembers = Array.from(new Map(membersData.map(member => [member.user_id, member])).values());
                setProcessedMembers(uniqueMembers);

                const userTeamData = teamRes.data.find((item: any) => item.user_id === user.id);
                if (userTeamData && userTeamData.role === 'editor') {
                    setCanEdit(true);
                }
            }
            if (!taskTeamRes.error) {
                const taskMembersMap = taskTeamRes.data.reduce((acc, { task_id, user_id }) => {
                    acc[task_id] = acc[task_id] ? [...acc[task_id], user_id] : [user_id];
                    return acc;
                }, {} as { [key: string]: string[] });
                setTaskMembers(taskMembersMap);
            }

            setLoading(false);
        };
        fetchInitialDataAndPermission();

        // Real-time cho bảng tasks
        const taskChannel = supabase
            .channel(`tasks-${processID}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${processID}` }, (payload) => {
                setTasks((prev) => {
                    const newTask = payload.new as TaskRow | undefined;
                    const oldTask = payload.old as TaskRow | undefined;
                    const existingTaskIndex = prev.findIndex((task) => task.id === (newTask?.id || oldTask?.id));
                    if (payload.eventType === 'INSERT' && newTask) {
                        if (existingTaskIndex === -1) return [...prev, newTask];
                    } else if (payload.eventType === 'UPDATE' && newTask) {
                        if (existingTaskIndex !== -1) {
                            return prev.map((task) => (task.id === newTask.id ? { ...task, ...newTask } : task));
                        }
                    } else if (payload.eventType === 'DELETE' && oldTask) {
                        return prev.filter((task) => task.id !== oldTask.id);
                    }
                    return prev;
                });
            })
            .subscribe();

        // Real-time cho bảng projects
        const projectChannel = supabase
            .channel(`projects-${processID}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${processID}` }, (payload) => {
                const updatedProject = payload.new as Database['public']['Tables']['projects']['Row'];
                setProcessedDueDate(new Date(updatedProject.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }));
                setProcessedProjectDetails(updatedProject.description || '');
                if (currentUserId) {
                    const isCreator = updatedProject.created_by === currentUserId;
                    const hasPermission = updatedProject.permission === true;
                    setCanEdit(isCreator || hasPermission);
                    if (!isCreator && !hasPermission) {
                        supabase
                            .from('project_task_team')
                            .select('user_id, role')
                            .eq('project_id', processID)
                            .eq('user_id', currentUserId)
                            .single()
                            .then(({ data }) => setCanEdit(data?.role === 'editor'));
                    }
                }
            })
            .subscribe();

        // Real-time cho bảng project_task_team (cả members và taskMembers)
        const teamChannel = supabase
            .channel(`project_task_team-${processID}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_task_team', filter: `project_id=eq.${processID}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newEntry = payload.new as { user_id: string; task_id: string; role: string };
                    supabase
                        .from('users')
                        .select('avatar, full_name')
                        .eq('id', newEntry.user_id)
                        .single()
                        .then(({ data: userData }) => {
                            setProcessedMembers((prev) => {
                                const newMember: Member = {
                                    user_id: newEntry.user_id,
                                    avatar: userData?.avatar || null,
                                    name: userData?.full_name || 'Unknown',
                                    role: newEntry.role || 'Member',
                                };
                                if (prev.some(m => m.user_id === newEntry.user_id)) return prev;
                                return [...prev, newMember];
                            });
                            setTaskMembers((prev) => {
                                const taskId = newEntry.task_id;
                                if (!taskId) return prev;
                                const updated = { ...prev };
                                updated[taskId] = updated[taskId] ? [...updated[taskId], newEntry.user_id] : [newEntry.user_id];
                                return updated;
                            });
                            if (newEntry.user_id === currentUserId && newEntry.role === 'editor') setCanEdit(true);
                        });
                } else if (payload.eventType === 'UPDATE') {
                    const updatedEntry = payload.new as { user_id: string; task_id: string; role: string };
                    setProcessedMembers((prev) =>
                        prev.map((member) =>
                            member.user_id === updatedEntry.user_id ? { ...member, role: updatedEntry.role } : member
                        )
                    );
                    setTaskMembers((prev) => {
                        const taskId = updatedEntry.task_id;
                        if (!taskId) return prev;
                        const updated = { ...prev };
                        if (!updated[taskId].includes(updatedEntry.user_id)) {
                            updated[taskId] = [...updated[taskId], updatedEntry.user_id];
                        }
                        return updated;
                    });
                    if (updatedEntry.user_id === currentUserId) setCanEdit(updatedEntry.role === 'editor');
                } else if (payload.eventType === 'DELETE') {
                    const deletedEntry = payload.old as { user_id: string; task_id: string };
                    setProcessedMembers((prev) => prev.filter((member) => member.user_id !== deletedEntry.user_id));
                    setTaskMembers((prev) => {
                        const taskId = deletedEntry.task_id;
                        if (!taskId) return prev;
                        const updated = { ...prev };
                        updated[taskId] = updated[taskId]?.filter((userId) => userId !== deletedEntry.user_id) || [];
                        return updated;
                    });
                    if (deletedEntry.user_id === currentUserId) {
                        supabase
                            .from('projects')
                            .select('created_by, permission')
                            .eq('id', processID)
                            .single()
                            .then(({ data }) => setCanEdit(data?.created_by === currentUserId || data?.permission === true));
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(taskChannel);
            supabase.removeChannel(projectChannel);
            supabase.removeChannel(teamChannel);
        };
    }, [processID, currentUserId]);

    const handleSaveTaskMembers = async (taskId: string, selectedMemberIds: string[]) => {
        if (!canEdit || !processID) return;

        const { error: deleteError } = await supabase
            .from('project_task_team')
            .delete()
            .eq('project_id', processID)
            .eq('task_id', taskId);

        if (deleteError) {
            console.error('❌ Lỗi khi xóa thành viên task:', deleteError);
            return;
        }

        const inserts = selectedMemberIds.map(user_id => ({
            project_id: processID,
            task_id: taskId,
            user_id,
            role: 'member',
            assigned_at: new Date().toISOString(),
        }));
        const { error: insertError } = await supabase
            .from('project_task_team')
            .insert(inserts);

        if (!insertError) {
            setTaskMembers(prev => ({ ...prev, [taskId]: selectedMemberIds }));
        } else {
            console.error('❌ Lỗi khi thêm thành viên task:', insertError);
        }
    };

    const handleSaveTask = async () => {
        if (!canEdit || !nameTask.trim() || !processID) {
            alert(!nameTask.trim() ? 'Tên task không được để trống!' : 'Project ID không hợp lệ!');
            return;
        }
        const userResponse = await supabase.auth.getUser();
        const user = userResponse.data.user;
        if (!user || !user.id) return;

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                project_id: processID,
                created_by: user.id,
                title: nameTask,
                due_date: dueDateTask.toISOString(),
                start_time: dueTimeTask.toISOString(),
                end_time: dueTimeTask.toISOString(),
                status: false,
            })
            .select()
            .single();

        if (!error && data) {
            setTasks(prev => [...prev, data]);
            setTaskMembers(prev => ({ ...prev, [data.id]: [] }));
            setModalAddTaskVisible(false);
            setNameTask('');
        } else {
            console.error('❌ Lỗi khi thêm task:', error);
        }
    };

    const handleChangeTask = async () => {
        if (!canEdit || !selectedTask || !nameTask.trim()) {
            alert('Vui lòng chọn một task và nhập tên hợp lệ!');
            return;
        }
        const { error } = await supabase
            .from('tasks')
            .update({
                title: nameTask,
                due_date: dueDateTask.toISOString(),
                start_time: dueTimeTask.toISOString(),
                end_time: dueTimeTask.toISOString(),
            })
            .eq('id', selectedTask.id);

        if (!error) setTaskModalVisible(false);
        else console.error('❌ Lỗi khi cập nhật task:', error);
    };

    const handleDeleteTask = async () => {
        if (!canEdit || !selectedTask) {
            alert('Vui lòng chọn một task để xoá!');
            return;
        }
        const { error } = await supabase.from('tasks').delete().eq('id', selectedTask.id);
        if (!error) {
            setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
            setTaskModalVisible(false);
        } else {
            console.error('❌ Lỗi khi xoá task:', error);
        }
    };

    const toggleTaskStatus = async (taskId: string) => {
        if (!canEdit) return;

        const taskToUpdate = tasks.find((task) => task.id === taskId);
        if (!taskToUpdate) return;

        const newStatus = !taskToUpdate.status;
        const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
        if (error) {
            console.error('❌ Lỗi khi cập nhật trạng thái task:', error);
            return;
        }
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDueDateTask(selectedDate);
    };

    const onChangeTime = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) setDueTimeTask(selectedTime);
    };

    const handleGoBack = () => router.back();

    const onRefresh = async () => {
        if (!processID) return;

        setRefreshing(true);
        try {
            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;
            if (!user || !user.id) {
                console.error('❌ Không có thông tin người dùng để làm mới');
                setRefreshing(false);
                return;
            }

            const [tasksRes, projectRes, teamRes, taskTeamRes] = await Promise.all([
                supabase.from('tasks').select('*').eq('project_id', processID),
                supabase.from('projects').select('due_date, description, status, created_by, permission').eq('id', processID).single(),
                supabase.from('project_task_team').select('user_id, users (avatar, full_name), role').eq('project_id', processID),
                supabase.from('project_task_team').select('task_id, user_id').eq('project_id', processID),
            ]);

            if (!tasksRes.error) {
                const uniqueTasks = Array.from(new Map(tasksRes.data.map(task => [task.id, task])).values());
                setTasks(uniqueTasks || []);
            }
            if (!projectRes.error) {
                setProcessedDueDate(new Date(projectRes.data.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }));
                setProcessedProjectDetails(projectRes.data.description || '');
                setCanEdit(projectRes.data.created_by === user.id || projectRes.data.permission === true);
            }
            if (!teamRes.error) {
                const membersData = teamRes.data.map((item: any) => ({
                    user_id: item.user_id,
                    avatar: item.users.avatar,
                    name: item.users.full_name || 'Unknown',
                    role: item.role || 'Member',
                }));
                const uniqueMembers = Array.from(new Map(membersData.map(member => [member.user_id, member])).values());
                setProcessedMembers(uniqueMembers);
            }
            if (!taskTeamRes.error) {
                const taskMembersMap = taskTeamRes.data.reduce((acc, { task_id, user_id }) => {
                    acc[task_id] = acc[task_id] ? [...acc[task_id], user_id] : [user_id];
                    return acc;
                }, {} as { [key: string]: string[] });
                setTaskMembers(taskMembersMap);
            }
        } catch (error) {
            console.error('❌ Lỗi khi làm mới:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderTaskItem = useCallback(({ item }: { item: TaskRow }) => (
        <View
            style={[
                styles.box,
                tasks.indexOf(item) > 0 && { marginTop: 12 },
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
            ]}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingLeft: 12,
                }}
                onLongPress={() => {
                    setSelectedTask(item);
                    setNameTask(item.title || '');
                    setDueDateTask(new Date(item.due_date || Date.now()));
                    setDueTimeTask(new Date(item.start_time || Date.now()));
                    setTaskModalVisible(true);
                }}
            >
                <CustomText style={[{ fontFamily: 'InterMedium' }, styles.boxText]}>
                    {item.title || 'Untitled Task'}
                </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.boxIcon, !canEdit && { opacity: 0.6 }]}
                onPress={() => canEdit && toggleTaskStatus(item.id)}
                disabled={!canEdit}
            >
                {item.status ? (
                    <Icon category="screens" name="tickedCircle" style={{ width: 24, height: 24 }} />
                ) : (
                    <Icon category="screens" name="unTickedCircle" style={{ width: 24, height: 24 }} />
                )}
            </TouchableOpacity>
        </View>
    ), [canEdit, tasks]);

    return (
        <View style={styles.container}>
            <Head
                onLeftPress={handleGoBack}
                onRightPress={() =>
                    router.push({
                        pathname: '/screens/projectInformation',
                        params: {
                            id: processID,
                            title: processedTitle,
                            description: processedProjectDetails || '',
                            due_date: due_date as string,
                            type: type as string,
                            permission: canEdit ? 'true' : 'false',
                            members: JSON.stringify(processedMembers),
                        },
                    })
                }
            >
                <CustomText style={[{ fontFamily: 'Inter' }, styles.headTitle]}>Project Details</CustomText>
            </Head>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0000ff']}
                        tintColor="#0000ff"
                    />
                }
            >
                <View style={styles.header}>
                    <CustomText style={[{ fontFamily: 'Inter' }, styles.info]}>{processedTitle}</CustomText>
                </View>
                <View style={styles.dateAndTeam}>
                    <View style={styles.date}>
                        <Icon category="screens" name="dueDate" />
                    </View>
                    <View style={styles.textDate}>
                        <CustomText style={[{ fontFamily: 'InterMedium' }, styles.dueDate]}>Due Date</CustomText>
                        <CustomText style={[{ fontFamily: 'InterSemiBold' }, styles.dateText]}>{processedDueDate}</CustomText>
                    </View>
                    <View style={styles.team}>
                        <Icon category="screens" name="teamMember" />
                    </View>
                    <TouchableOpacity onPress={() => setTeamModalVisible(true)} style={styles.textTeam}>
                        <CustomText style={[{ fontFamily: 'InterMedium' }, styles.dueDate]}>Project Team</CustomText>
                        <View style={styles.teamMember}>
                            {processedMembers.length > 0 ? (
                                processedMembers.slice(0, 3).map((member, index) =>
                                    member.avatar ? (
                                        <Image
                                            key={`${member.user_id}-${index}`}
                                            source={{ uri: member.avatar }}
                                            style={{ width: 32, height: 32, borderRadius: 16 }}
                                        />
                                    ) : (
                                        <Icon
                                            key={`${member.user_id}-${index}`}
                                            category="avatar"
                                            style={{ width: 32, height: 32 }}
                                        />
                                    )
                                )
                            ) : (
                                <CustomText>No members available</CustomText>
                            )}
                            {processedMembers.length > 3 && (
                                <View style={[styles.memberAvatar, styles.extraMembers, { zIndex: 0, marginLeft: -10 }]}>
                                    <CustomText style={styles.extraMembersText}>+{processedMembers.length - 3}</CustomText>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.details}>
                    <CustomText style={[{ fontFamily: 'InterMedium' }, styles.projectDetails]}>Project Details</CustomText>
                    <CustomText style={[{ fontFamily: 'InterReguler' }, styles.textDetails]}>
                        {processedProjectDetails || 'No details available'}
                    </CustomText>
                </View>
                <View style={styles.progress}>
                    <CustomText style={[{ fontFamily: 'InterMedium' }, styles.progressText]}>Project Progress</CustomText>
                    <CompletedCircle progress={taskProgress} containerStyle={styles.completed} />
                </View>
                <View style={styles.allTask}>
                    <CustomText style={[{ fontFamily: 'InterMedium' }, styles.allTaskText]}>All Tasks</CustomText>
                </View>
                <View style={styles.flashList}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <FlashList
                            data={tasks}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderTaskItem}
                            estimatedItemSize={58}
                            extraData={{ canEdit }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.flashListContent}
                        />
                    )}
                </View>
            </ScrollView>
            <TaskModal
                visible={taskModalVisible}
                nameTask={nameTask}
                setNameTask={setNameTask}
                dueDate={dueDateTask}
                dueTime={dueTimeTask}
                showDatePicker={showDatePicker}
                showTimePicker={showTimePicker}
                onClose={() => setTaskModalVisible(false)}
                handleChangeTask={canEdit ? handleChangeTask : () => { }}
                handleDeleteTask={canEdit ? handleDeleteTask : () => { }}
                onShowDatePicker={() => canEdit && setShowDatePicker(true)}
                onShowTimePicker={() => canEdit && setShowTimePicker(true)}
                timeOnpress={canEdit ? onChangeTime : () => { }}
                dateOnpress={canEdit ? onChangeDate : () => { }}
                canEdit={canEdit}
                members={processedMembers}
                selectedMembers={selectedTask ? taskMembers[selectedTask.id] || [] : []}
                onSaveMembers={(selected) => selectedTask && handleSaveTaskMembers(selectedTask.id, selected)}
            />
            <View style={styles.addTask}>
                <MyButton
                    onPress={() => canEdit && setModalAddTaskVisible(true)}
                    style={[styles.addTaskButton, { opacity: canEdit ? 1 : 0.6 }]}
                    disabled={!canEdit}
                    title={<CustomText fontFamily="InterSemiBold" fontSize={18} style={{ color: '#000' }}>Add Task</CustomText>}
                />
            </View>
            <AddTaskModal
                visible={modalAddTaskVisible}
                nameTask={nameTask}
                setNameTask={setNameTask}
                dueDate={dueDateTask}
                dueTime={dueTimeTask}
                showDatePicker={showDatePicker}
                showTimePicker={showTimePicker}
                onClose={() => setModalAddTaskVisible(false)}
                handleAddTask={handleSaveTask}
                onShowDatePicker={() => setShowDatePicker(true)}
                onShowTimePicker={() => setShowTimePicker(true)}
                timeOnpress={onChangeTime}
                dateOnpress={onChangeDate}
                members={processedMembers}
                selectedMembers={[]}
                onSaveMembers={(selected) => {
                    const newTask = tasks[tasks.length - 1];
                    if (newTask) handleSaveTaskMembers(newTask.id, selected);
                }}
            />
            <TeamMembersModal visible={teamModalVisible} onClose={() => setTeamModalVisible(false)} members={processedMembers} />
            <TaskMembersModal
                visible={taskMembersModalVisible}
                onClose={() => setTaskMembersModalVisible(false)}
                members={processedMembers}
                selectedMembers={selectedTask ? taskMembers[selectedTask.id] || [] : []}
                onSave={(selected) => selectedTask && handleSaveTaskMembers(selectedTask.id, selected)}
            />
        </View>
    );
};

export default TaskDetails;