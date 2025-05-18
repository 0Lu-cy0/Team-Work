import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ScrollView, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Head from '@/components/Head';
import styles from '@/styles/taskDetail';
import CustomText from '@/constants/CustomText';
import CompletedCircle from '@/components/CompletedCircle';
import MyButton from '@/components/MyButton';
import TaskModal from '@/components/TaskModal';
import AddTaskModal from '@/components/AddTaskModal';
import TeamMembersModal from '@/components/TeamMembersModal';
import TaskMembersModal from '@/components/TaskMembersModal';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import Icon from '@/components/Icon';
import { useThemeContext } from '@/context/ThemeContext';

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

type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface Member {
    user_id: string;
    avatar: string | null;
    name: string;
    role?: string;
}

const calculateCompletionPercentage = (tasks: TaskRow[]): number => {
    try {
        if (!Array.isArray(tasks)) {
            logger.error("Invalid tasks array in calculateCompletionPercentage", new Error("Tasks is not an array"));
            return 0;
        }
        return tasks.length === 0
            ? 0
            : parseFloat(((tasks.filter((task) => task.status).length / tasks.length) * 100).toFixed(2));
    } catch (error) {
        logger.error("Error in calculateCompletionPercentage", error, { tasks });
        return 0;
    }
};

const TaskDetails: React.FC = () => {
    const router = useRouter();
    const { title, id, due_date, projectDetails, type, permission: initialPermission, members } = useLocalSearchParams();
    const initialTitle = title ? (title as string).replace(/\n/g, ' ') : 'No Title';
    const processID = id?.toString();
    const initialDueDate = due_date
        ? new Date(Array.isArray(due_date) ? due_date[0] : due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })
        : 'No Due Date';
    const initialProjectDetails = projectDetails || '';
    const initialMembers = members ? JSON.parse(members as string) : [];

    const [processedTitle, setProcessedTitle] = useState<string>(initialTitle);
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
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [taskMembersModalVisible, setTaskMembersModalVisible] = useState(false);
    const [taskMembers, setTaskMembers] = useState<{ [taskId: string]: string[] }>({});
    const [pendingTaskMembers, setPendingTaskMembers] = useState<{ [taskId: string]: string[] }>({}); // THÊM: State lưu tạm thành viên
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const { colors } = useThemeContext();

    useEffect(() => {
        try {
            setTaskProgress(calculateCompletionPercentage(tasks));
        } catch (error) {
            logger.error("Error setting task progress", error, { tasks });
        }
    }, [tasks]);

    const fetchInitialDataAndPermission = useCallback(async () => {
        if (!processID) {
            logger.warn("No processID provided");
            return;
        }

        setLoading(true);

        try {
            const userResponse = await supabase.auth.getUser();
            if (userResponse.error || !userResponse.data.user?.id) {
                logger.error("Failed to fetch user data", userResponse.error);
                setLoading(false);
                return;
            }
            setCurrentUserId(userResponse.data.user.id);

            const [tasksRes, projectRes, projectTeamRes, taskTeamRes] = await Promise.all([
                supabase.from('tasks').select('*').eq('project_id', processID),
                supabase.from('projects').select('title, due_date, description, status, created_by, permission').eq('id', processID).single(),
                supabase.from('project_team').select('user_id, users (avatar, full_name), role').eq('project_id', processID),
                supabase.from('project_task_team').select('task_id, user_id').eq('project_id', processID),
            ]);

            if (tasksRes.error) {
                logger.error("Failed to fetch tasks", tasksRes.error, { processID });
            } else {
                const uniqueTasks = Array.from(new Map(tasksRes.data.map(task => [task.id, task])).values());
                setTasks(uniqueTasks || []);
            }

            if (projectRes.error) {
                logger.error("Failed to fetch project", projectRes.error, { processID });
            } else {
                setProcessedTitle(projectRes.data.title || 'No Title');
                setProcessedDueDate(new Date(projectRes.data.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }));
                setProcessedProjectDetails(projectRes.data.description || '');
                setCanEdit(projectRes.data.created_by === userResponse.data.user.id || projectRes.data.permission === true);
            }

            if (projectTeamRes.error) {
                logger.error("Failed to fetch project team", projectTeamRes.error, { processID });
            } else {
                const membersData = projectTeamRes.data.map((item: any) => ({
                    user_id: item.user_id,
                    avatar: item.users.avatar,
                    name: item.users.full_name || 'Unknown',
                    role: item.role || 'Member',
                }));
                const uniqueMembers = Array.from(new Map(membersData.map(member => [member.user_id, member])).values());
                setProcessedMembers(uniqueMembers);

                const userTeamData = projectTeamRes.data.find((item: any) => item.user_id === userResponse.data.user.id);
                if (userTeamData && userTeamData.role === 'lead') {
                    setCanEdit(true);
                }
            }

            if (taskTeamRes.error) {
                logger.error("Failed to fetch task team", taskTeamRes.error, { processID });
            } else {
                const taskMembersMap = taskTeamRes.data.reduce((acc, { task_id, user_id }) => {
                    if (task_id && user_id) {
                        acc[task_id] = acc[task_id] ? [...acc[task_id], user_id] : [user_id];
                    }
                    return acc;
                }, {} as { [key: string]: string[] });
                console.log('Initial taskMembers:', taskMembersMap);
                setTaskMembers(taskMembersMap);
            }
        } catch (error) {
            logger.error("Unexpected error in fetchInitialDataAndPermission", error, { processID });
        } finally {
            setLoading(false);
        }
    }, [processID]);

    useFocusEffect(
        useCallback(() => {
            fetchInitialDataAndPermission();
        }, [fetchInitialDataAndPermission])
    );

    useEffect(() => {
        if (!processID) {
            logger.warn("No processID for subscription setup");
            return;
        }

        const taskChannel = supabase
            .channel(`tasks-${processID}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${processID}` }, (payload) => {
                try {
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
                } catch (error) {
                    logger.error("Error handling task channel update", error, { payload });
                }
            })
            .subscribe((status, error) => {
                if (error) {
                    logger.error("Task channel subscription error", error, { processID });
                }
            });

        const projectChannel = supabase
            .channel(`projects-${processID}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${processID}` }, async (payload) => {
                try {
                    const updatedProject = payload.new as Database['public']['Tables']['projects']['Row'];
                    setProcessedTitle(updatedProject.title || 'No Title');
                    setProcessedDueDate(new Date(updatedProject.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }));
                    setProcessedProjectDetails(updatedProject.description || '');
                    if (currentUserId) {
                        const isCreator = updatedProject.created_by === currentUserId;
                        const hasPermission = updatedProject.permission === true;
                        setCanEdit(isCreator || hasPermission);
                        if (!isCreator && !hasPermission) {
                            const { data, error } = await supabase
                                .from('project_team')
                                .select('user_id, role')
                                .eq('project_id', processID)
                                .eq('user_id', currentUserId)
                                .single();
                            if (error) {
                                logger.error("Error checking project team role", error, { processID, currentUserId });
                            } else {
                                setCanEdit(data?.role === 'lead');
                            }
                        }
                    }
                } catch (error) {
                    logger.error("Error handling project channel update", error, { payload });
                }
            })
            .subscribe((status, error) => {
                if (error) {
                    logger.error("Project channel subscription error", error, { processID });
                }
            });

        const teamChannel = supabase
            .channel(`project_team-${processID}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_team', filter: `project_id=eq.${processID}` }, async (payload) => {
                try {
                    if (payload.eventType === 'INSERT') {
                        const newEntry = payload.new as { user_id: string; role: string };
                        const { data: userData, error: userError } = await supabase
                            .from('users')
                            .select('avatar, full_name')
                            .eq('id', newEntry.user_id)
                            .single();
                        if (userError) {
                            logger.error("Error fetching user data for new team member", userError, { newEntry });
                            return;
                        }
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
                        if (newEntry.user_id === currentUserId && newEntry.role === 'lead') setCanEdit(true);
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedEntry = payload.new as { user_id: string; role: string };
                        setProcessedMembers((prev) =>
                            prev.map((member) =>
                                member.user_id === updatedEntry.user_id ? { ...member, role: updatedEntry.role } : member
                            )
                        );
                        if (updatedEntry.user_id === currentUserId) setCanEdit(updatedEntry.role === 'lead');
                    } else if (payload.eventType === 'DELETE') {
                        const deletedEntry = payload.old as { user_id: string };
                        setProcessedMembers((prev) => prev.filter((member) => member.user_id !== deletedEntry.user_id));
                        if (deletedEntry.user_id === currentUserId) {
                            const { data, error } = await supabase
                                .from('projects')
                                .select('created_by, permission')
                                .eq('id', processID)
                                .single();
                            if (error) {
                                logger.error("Error checking permissions after team member deletion", error, { processID, currentUserId });
                            } else {
                                setCanEdit(data?.created_by === currentUserId || data?.permission === true);
                            }
                        }
                    }
                } catch (error) {
                    logger.error("Error handling team channel update", error, { payload });
                }
            })
            .subscribe((status, error) => {
                if (error) {
                    logger.error("Team channel subscription error", error, { processID });
                }
            });

        const taskTeamChannel = supabase
            .channel(`project_task_team-${processID}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_task_team', filter: `project_id=eq.${processID}` }, async (payload) => {
                try {
                    console.log('TaskTeamChannel payload:', payload);
                    if (payload.eventType === 'INSERT') {
                        const newEntry = payload.new as { user_id: string; task_id: string };
                        if (newEntry.task_id && newEntry.user_id) {
                            setTaskMembers((prev) => {
                                const updated = { ...prev };
                                updated[newEntry.task_id] = updated[newEntry.task_id] ? [...updated[newEntry.task_id], newEntry.user_id] : [newEntry.user_id];
                                console.log('Updated taskMembers after INSERT:', updated);
                                return updated;
                            });
                        }
                    } else if (payload.eventType === 'DELETE') {
                        const deletedEntry = payload.old as { user_id: string; task_id: string };
                        if (deletedEntry.task_id && deletedEntry.user_id) {
                            setTaskMembers((prev) => {
                                const updated = { ...prev };
                                updated[deletedEntry.task_id] = updated[deletedEntry.task_id]?.filter((userId) => userId !== deletedEntry.user_id) || [];
                                console.log('Updated taskMembers after DELETE:', updated);
                                return updated;
                            });
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const { task_id } = payload.new as { task_id: string };
                        if (task_id) {
                            const { data, error } = await supabase
                                .from('project_task_team')
                                .select('user_id')
                                .eq('project_id', processID)
                                .eq('task_id', task_id);
                            if (error) {
                                console.error('Error fetching task members on UPDATE:', error);
                                return;
                            }
                            const memberIds = data
                                .map(m => m.user_id)
                                .filter((id): id is string => id !== null);
                            setTaskMembers((prev) => {
                                const updated = { ...prev, [task_id]: memberIds };
                                console.log('Updated taskMembers after UPDATE:', updated);
                                return updated;
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error handling task team channel:', error, { payload });
                }
            })
            .subscribe((status, error) => {
                if (error) console.error('Task team channel subscription error:', error);
            });

        return () => {
            try {
                supabase.removeChannel(taskChannel);
                supabase.removeChannel(projectChannel);
                supabase.removeChannel(teamChannel);
                supabase.removeChannel(taskTeamChannel);
            } catch (error) {
                logger.error("Error removing channels", error, { processID });
            }
        };
    }, [processID, currentUserId]);

    const handleSaveTaskMembers = async (taskId: string, selectedMemberIds: string[]) => {
        if (!canEdit || !processID || !taskId) {
            console.warn('Cannot save task members: invalid params', { canEdit, processID, taskId });
            return;
        }

        try {
            console.log('handleSaveTaskMembers: taskId', taskId, 'selectedMemberIds', selectedMemberIds);
            // Lưu tạm vào pendingTaskMembers thay vì gọi API ngay
            setPendingTaskMembers((prev) => ({
                ...prev,
                [taskId]: [...selectedMemberIds],
            }));
            console.log('Updated pendingTaskMembers:', { ...pendingTaskMembers, [taskId]: selectedMemberIds });
        } catch (error) {
            console.error('Unexpected error in handleSaveTaskMembers:', error);
            alert('Đã có lỗi bất ngờ xảy ra!');
        }
    };

    const commitTaskMembers = async (taskId: string, selectedMemberIds: string[]) => {
        // Hàm này thực hiện cập nhật cơ sở dữ liệu
        try {
            console.log('commitTaskMembers: taskId', taskId, 'selectedMemberIds', selectedMemberIds);
            const { data: projectMembers, error: fetchError } = await supabase
                .from('project_team')
                .select('user_id')
                .eq('project_id', processID);
            if (fetchError) {
                console.error('Error fetching project members:', fetchError);
                alert('Lỗi khi kiểm tra thành viên dự án!');
                return;
            }
            const projectMemberIds = projectMembers.map(m => m.user_id);
            const invalidMembers = selectedMemberIds.filter(id => !projectMemberIds.includes(id));
            if (invalidMembers.length > 0) {
                console.warn('Invalid members selected:', invalidMembers);
                alert('Một số thành viên không thuộc dự án!');
                return;
            }

            const { data: existingTaskMembers, error: fetchTaskMembersError } = await supabase
                .from('project_task_team')
                .select('id, user_id')
                .eq('project_id', processID)
                .eq('task_id', taskId);
            if (fetchTaskMembersError) {
                console.error('Error fetching task members:', fetchTaskMembersError);
                alert('Lỗi khi lấy danh sách thành viên task!');
                return;
            }

            const existingMembersMap = new Map<string, string>(
                existingTaskMembers
                    .filter(member => member.user_id !== null)
                    .map(member => [member.user_id as string, member.id])
            );

            if (selectedMemberIds.length > 0) {
                const upsertData = selectedMemberIds.map(user_id => ({
                    id: existingMembersMap.get(user_id) || uuidv4(),
                    project_id: processID,
                    task_id: taskId,
                    user_id,
                    assigned_at: new Date().toISOString(),
                }));
                const { error: upsertError } = await supabase
                    .from('project_task_team')
                    .upsert(upsertData);
                if (upsertError) {
                    console.error('Error upserting task members:', upsertError);
                    alert('Lỗi khi lưu thành viên task!');
                    return;
                }
            }

            const membersToRemove = existingTaskMembers
                .filter(member => !selectedMemberIds.includes(member.user_id as string))
                .map(member => member.user_id as string);
            if (membersToRemove.length > 0) {
                const { error: deleteError } = await supabase
                    .from('project_task_team')
                    .delete()
                    .eq('project_id', processID)
                    .eq('task_id', taskId)
                    .in('user_id', membersToRemove);
                if (deleteError) {
                    console.error('Error deleting task members:', deleteError);
                    alert('Lỗi khi xóa thành viên task!');
                    return;
                }
            }

            setTaskMembers(prev => {
                const updated = { ...prev, [taskId]: [...selectedMemberIds] };
                console.log('Updated taskMembers:', updated);
                return updated;
            });
        } catch (error) {
            console.error('Unexpected error in commitTaskMembers:', error);
            alert('Đã có lỗi bất ngờ xảy ra!');
        }
    };

    const handleSaveTask = async () => {
        if (!canEdit || !nameTask.trim() || !processID) {
            logger.warn("Cannot save task: invalid conditions", { canEdit, nameTask, processID });
            alert(!nameTask.trim() ? 'Tên task không được để trống!' : 'Project ID không hợp lệ!');
            return;
        }

        try {
            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;
            if (!user || !user.id) {
                logger.error("No user data available for task creation", userResponse.error);
                return;
            }

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

            if (error) {
                logger.error("Error inserting new task", error, { nameTask, processID });
                return;
            }

            setTasks(prev => [...prev, data]);
            setTaskMembers(prev => ({ ...prev, [data.id]: [] }));
            setPendingTaskMembers(prev => ({ ...prev, [data.id]: [] })); // THÊM: Khởi tạo pendingTaskMembers cho task mới
            setModalAddTaskVisible(false);
            setNameTask('');
        } catch (error) {
            logger.error("Unexpected error in handleSaveTask", error, { nameTask, processID });
        }
    };

    const handleChangeTask = async () => {
        if (!canEdit || !selectedTask || !nameTask.trim()) {
            logger.warn("Cannot update task: invalid conditions", { canEdit, selectedTask, nameTask });
            alert('Vui lòng chọn một task và nhập tên hợp lệ!');
            return;
        }

        try {
            const isValidDate = (date: unknown): boolean => date instanceof Date && !isNaN(date.getTime());
            const dueDate = isValidDate(dueDateTask) ? dueDateTask.toISOString() : new Date().toISOString();
            const dueTime = isValidDate(dueTimeTask) ? dueTimeTask.toISOString() : new Date().toISOString();
            console.log('dueDateTask:', dueDateTask, '->', dueDate);
            console.log('dueTimeTask:', dueTimeTask, '->', dueTime);

            const { error } = await supabase
                .from('tasks')
                .update({
                    title: nameTask,
                    due_date: dueDate,
                    start_time: dueTime,
                    end_time: dueTime,
                })
                .eq('id', selectedTask.id);

            if (error) {
                logger.error("Error updating task", error, { taskId: selectedTask.id, nameTask });
                alert('Lỗi khi cập nhật task: ' + error.message);
                return;
            }

            // Áp dụng thay đổi thành viên từ pendingTaskMembers
            if (pendingTaskMembers[selectedTask.id]) {
                await commitTaskMembers(selectedTask.id, pendingTaskMembers[selectedTask.id]);
                setPendingTaskMembers((prev) => {
                    const { [selectedTask.id]: _, ...rest } = prev;
                    return rest;
                });
            }

            setTaskModalVisible(false);
        } catch (error) {
            logger.error("Unexpected error in handleChangeTask", error, { taskId: selectedTask?.id, nameTask });
            alert('Lỗi không xác định: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const handleDeleteTask = async () => {
        if (!canEdit || !selectedTask) {
            logger.warn("Cannot delete task: invalid conditions", { canEdit, selectedTask });
            alert('Vui lòng chọn một task để xoá!');
            return;
        }

        try {
            const { error } = await supabase.from('tasks').delete().eq('id', selectedTask.id);
            if (error) {
                logger.error("Error deleting task", error, { taskId: selectedTask.id });
                return;
            }

            setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
            setTaskModalVisible(false);
            setPendingTaskMembers((prev) => {
                const { [selectedTask.id]: _, ...rest } = prev;
                return rest;
            });
        } catch (error) {
            logger.error("Unexpected error in handleDeleteTask", error, { taskId: selectedTask?.id });
        }
    };

    const toggleTaskStatus = async (taskId: string) => {
        if (!canEdit) {
            logger.warn("Cannot toggle task status: no edit permission", { taskId });
            return;
        }
        try {
            const taskToUpdate = tasks.find((task) => task.id === taskId);
            if (!taskToUpdate) {
                logger.warn("Task not found for status update", { taskId });
                return;
            }

            const newStatus = !taskToUpdate.status;
            const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
            if (error) {
                logger.error("Error updating task status", error, { taskId, newStatus });
                return;
            }
        } catch (error) {
            logger.error("Unexpected error in toggleTaskStatus", error, { taskId });
        }
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        try {
            setShowDatePicker(false);
            if (selectedDate) setDueDateTask(selectedDate);
        } catch (error) {
            logger.error("Error in onChangeDate", error, { selectedDate });
        }
    };

    const onChangeTime = (event: any, selectedTime?: Date) => {
        try {
            setShowTimePicker(false);
            if (selectedTime) setDueTimeTask(selectedTime);
        } catch (error) {
            logger.error("Error in onChangeTime", error, { selectedTime });
        }
    };

    const handleGoBack = () => {
        try {
            router.back();
        } catch (error) {
            logger.error("Error in handleGoBack", error);
        }
    };

    const handleCancelTaskModal = () => {
        // THÊM: Reset pendingTaskMembers và đóng modal
        setTaskModalVisible(false);
        if (selectedTask?.id) {
            setPendingTaskMembers((prev) => {
                const { [selectedTask.id]: _, ...rest } = prev;
                return rest;
            });
        }
        setNameTask('');
        setDueDateTask(new Date());
        setDueTimeTask(new Date());
        setSelectedTask(null);
    };

    const renderTaskItem = useCallback(({ item }: { item: TaskRow }) => (
        <View
            style={[
                styles.box,
                { backgroundColor: colors.box2 },
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
                    try {
                        console.log('Selecting task:', item.id, 'Members:', taskMembers[item.id]);
                        setSelectedTask(item);
                        setNameTask(item.title || '');
                        setDueDateTask(new Date(item.due_date || Date.now()));
                        setDueTimeTask(new Date(item.start_time || Date.now()));
                        setTaskModalVisible(true);
                    } catch (error) {
                        logger.error("Error in task item long press", error, { item });
                    }
                }}
            >
                <CustomText fontFamily='InterMedium' fontSize={18} style={{ color: colors.text5 }}>
                    {item.title || 'Untitled Task'}
                </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.boxIcon, { backgroundColor: colors.box1 }, !canEdit && { opacity: 0.6 }]}
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
    ), [canEdit, tasks, taskMembers]);

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <Head
                onLeftPress={handleGoBack}
                onRightPress={() => {
                    try {
                        router.push({
                            pathname: '/screens/projectInformation',
                            params: {
                                id: processID ?? '',
                                title: processedTitle,
                                description: processedProjectDetails || '',
                                due_date: due_date as string,
                                type: type as string,
                                permission: canEdit ? 'true' : 'false',
                                members: JSON.stringify(processedMembers),
                            },
                        });
                    } catch (error) {
                        logger.error("Error navigating to project information", error, { processID });
                    }
                }}
            >
                <CustomText fontFamily='Inter' fontSize={25} style={{ color: colors.text7 }}>Project Details</CustomText>
            </Head>
            <View style={styles.header}>
                <CustomText fontFamily='Inter' fontSize={20} style={[styles.info, { color: colors.text7 }]}>{processedTitle}</CustomText>
            </View>
            <View style={styles.dateAndTeam}>
                <View style={[styles.date, { backgroundColor: colors.box1 }]}>
                    <Icon category="screens" name="dueDate" />
                </View>
                <View style={styles.textDate}>
                    <CustomText fontFamily='InterMedium' fontSize={15} style={{ color: colors.text3, marginTop: 10 }}>Due Date</CustomText>
                    <CustomText fontFamily='InterSemiBold' fontSize={22} style={[styles.dateText, { color: colors.text7 }]}>{processedDueDate}</CustomText>
                </View>
                <View style={[styles.team, { backgroundColor: colors.box1 }]}>
                    <Icon category="screens" name="teamMember" />
                </View>
                <TouchableOpacity onPress={() => setTeamModalVisible(true)} style={styles.textTeam}>
                    <CustomText fontFamily='InterMedium' fontSize={15} style={{ color: colors.text3 }}>Project Team</CustomText>
                    <View style={styles.teamMember}>
                        {processedMembers.length > 0 ? (
                            processedMembers.slice(0, 3).map((member, index) =>
                                member.avatar ? (
                                    <Image
                                        key={`${member.user_id}-${index}`}
                                        source={{ uri: member.avatar }}
                                        style={{ width: 20, height: 20, borderRadius: 16 }}
                                    />
                                ) : (
                                    <Icon
                                        key={`${member.user_id}-${index}`}
                                        category="avatar"
                                        style={{ width: 20, height: 20 }}
                                    />
                                )
                            )
                        ) : (
                            <CustomText>No members available</CustomText>
                        )}
                        {processedMembers.length > 3 && (
                            <View style={[styles.memberAvatar, [styles.extraMembers, { backgroundColor: colors.box2 }], { zIndex: 0 }]}>
                                <CustomText fontSize={12} style={{ color: colors.text5 }}>+{processedMembers.length - 3}</CustomText>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.details}>
                <CustomText fontFamily='InterMedium' fontSize={22} style={{ color: colors.text7 }}>Project Details</CustomText>
                <CustomText fontFamily='InterRegular' fontSize={15} style={[styles.textDetails, { color: colors.textChat }]}>
                    {processedProjectDetails || 'No details available'}
                </CustomText>
            </View>
            <View style={styles.progress}>
                <CustomText fontFamily='InterMedium' fontSize={22} style={{ color: colors.text7 }}>Project Progress</CustomText>
                <CompletedCircle progress={taskProgress} containerStyle={styles.completed} />
            </View>
            <View style={styles.allTask}>
                <CustomText fontFamily='InterMedium' fontSize={22} style={{ color: colors.text7 }}>All Tasks</CustomText>
            </View>
            <View style={styles.flashList}>
                {loading ? (
                    <ActivityIndicator size="large" color={colors.box1} />
                ) : (
                    <FlashList
                        data={tasks}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderTaskItem}
                        estimatedItemSize={58}
                        extraData={{ canEdit, taskMembers }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flashListContent}
                    />
                )}
            </View>
            <TaskModal
                visible={taskModalVisible}
                nameTask={nameTask}
                setNameTask={setNameTask}
                dueDate={dueDateTask}
                dueTime={dueTimeTask}
                showDatePicker={showDatePicker}
                showTimePicker={showTimePicker}
                onClose={handleCancelTaskModal} // SỬA: Sử dụng handleCancelTaskModal
                handleChangeTask={canEdit ? handleChangeTask : () => { }}
                handleDeleteTask={canEdit ? handleDeleteTask : () => { }}
                onShowDatePicker={() => canEdit && setShowDatePicker(true)}
                onShowTimePicker={() => canEdit && setShowTimePicker(true)}
                timeOnpress={canEdit ? onChangeTime : () => { }}
                dateOnpress={canEdit ? onChangeDate : () => { }}
                canEdit={canEdit}
                members={processedMembers}
                selectedMembers={selectedTask ? (pendingTaskMembers[selectedTask.id] || taskMembers[selectedTask.id] || []) : []} // SỬA: Sử dụng pendingTaskMembers nếu có
                onSaveMembers={(selected) => selectedTask && handleSaveTaskMembers(selectedTask.id, selected)}
                onCancelMembers={() => selectedTask && setPendingTaskMembers((prev) => ({ ...prev, [selectedTask.id]: taskMembers[selectedTask.id] || [] }))} // THÊM: Reset pendingTaskMembers khi cancel
                projectId={processID}
                taskId={selectedTask?.id}
            />
            <View style={[styles.addTask, { backgroundColor: colors.boxMenu }]}>
                <MyButton
                    onPress={() => canEdit && setModalAddTaskVisible(true)}
                    style={[styles.addTaskButton, { backgroundColor: colors.boxAdd }, { opacity: canEdit ? 1 : 0.6 }]}
                    disabled={!canEdit}
                    title={<CustomText fontFamily="InterSemiBold" fontSize={18} style={{ color: colors.text4 }}>Add Task</CustomText>}
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
                    try {
                        const newTask = tasks[tasks.length - 1];
                        if (newTask) handleSaveTaskMembers(newTask.id, selected);
                    } catch (error) {
                        logger.error("Error saving members for new task", error, { selected });
                    }
                }}
                projectId={processID}
                taskId={tasks[tasks.length - 1]?.id}
            />
            <TaskMembersModal
                visible={taskMembersModalVisible}
                onClose={() => setTaskMembersModalVisible(false)}
                members={processedMembers}
                selectedMembers={selectedTask ? (pendingTaskMembers[selectedTask.id] || taskMembers[selectedTask.id] || []) : []} // SỬA: Sử dụng pendingTaskMembers nếu có
                onSave={(selected) => selectedTask && handleSaveTaskMembers(selectedTask.id, selected)}
                onCancel={() => selectedTask && setPendingTaskMembers((prev) => ({ ...prev, [selectedTask.id]: taskMembers[selectedTask.id] || [] }))} // THÊM: Reset pendingTaskMembers khi cancel
                projectId={processID}
                taskId={selectedTask?.id}
            />
        </View>
    );
};

export default TaskDetails;