import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, TouchableOpacity, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Head from '@/components/Head';
import styles from '@/styles/taskDetail';
import CustomText from '@/constants/CustomText';
import CompletedCircle from '@/components/CompletedCircle';
import MyButton from '@/components/MyButton';
import TaskModal from '@/components/TaskModal';
import AddTaskModal from '@/components/AddTaskModal';
import TeamMembersModal from '@/components/TeamMembersModal';
import { FlashList } from "@shopify/flash-list";
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface Member {
    user_id: string;
    avatar: string | null;
    name: string;
    role?: string; // Thay permission thành role
}

const calculateCompletionPercentage = (tasks: TaskRow[]): number => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status).length;
    return parseFloat(((completedTasks / tasks.length) * 100).toFixed(2));
};

const TaskDetails: React.FC = () => {
    const router = useRouter();
    const { title, id, due_date, projectDetails, allTasks, type, permission, members } = useLocalSearchParams();

    const processPermission = permission; // Nếu bạn vẫn cần permission cho mục đích khác, giữ lại; nếu không, có thể bỏ
    const processedTitle = title ? (title as string).replace(/\n/g, ' ') : 'No Title';
    const processID = id ? id.toString() : null;
    const initialDueDate = due_date ? new Date(Array.isArray(due_date) ? due_date[0] : due_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
    }) : "No Due Date";
    const initialProjectDetails = projectDetails || '';
    const initialAllTasks = allTasks ? JSON.parse(allTasks as string) : [];
    const initialMembers = members ? JSON.parse(members as string) : [];

    const [processedDueDate, setProcessedDueDate] = useState<string>(initialDueDate);
    const [processedProjectDetails, setProcessedProjectDetails] = useState<string | string[] | undefined>(initialProjectDetails);
    const [processedMembers, setProcessedMembers] = useState<Member[]>(initialMembers);
    const [tasks, setTasks] = useState<TaskRow[]>(initialAllTasks);
    const selectedProjectType = type;
    const [modalAddTaskVisible, setModalAddTaskVisible] = useState(false);
    const [taskModalVisible, setTaskModalVisible] = useState(false);
    const [teamModalVisible, setTeamModalVisible] = useState(false);
    const [nameTask, setNameTask] = useState('');
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const [taskProgress, setTaskProgress] = useState<number>(calculateCompletionPercentage(tasks));
    const [dueTimeTask, setDueTimeTask] = useState(new Date());
    const [dueDateTask, setDueDateTask] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        setTaskProgress(calculateCompletionPercentage(tasks));
    }, [tasks]);

    useEffect(() => {
        if (!processID) return;

        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('project_id', processID);
            if (error) {
                console.error('Error fetching tasks:', error.message);
            } else {
                setTasks(data || []);
            }
        };
        fetchTasks();

        const fetchProjectDetails = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('due_date, description')
                .eq('id', processID)
                .single();
            if (error) {
                console.error('Error fetching project details:', error.message);
            } else {
                setProcessedDueDate(new Date(data.due_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                }));
                setProcessedProjectDetails(data.description || '');
            }
        };
        fetchProjectDetails();

        const fetchProjectTeam = async () => {
            const { data, error } = await supabase
                .from('project_task_team')
                .select('user_id, users (avatar, full_name), role')
                .eq('project_id', processID);
            if (error) {
                console.error('Error fetching project team:', error.message);
            } else {
                const membersData = data.map((item: any) => ({
                    user_id: item.user_id,
                    avatar: item.users.avatar,
                    name: item.users.full_name || 'Unknown',
                    role: item.role || 'Member',
                }));
                setProcessedMembers(membersData);
            }
        };
        fetchProjectTeam();

        const taskChannel = supabase
            .channel(`tasks-${processID}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${processID}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks((prev) => [...prev, payload.new as TaskRow]);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks((prev) =>
                        prev.map((task) => (task.id === payload.new.id ? (payload.new as TaskRow) : task))
                    );
                } else if (payload.eventType === 'DELETE') {
                    setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
                }
            })
            .subscribe();

        const projectChannel = supabase
            .channel(`projects-${processID}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${processID}` }, (payload) => {
                const updatedProject = payload.new as ProjectRow;
                setProcessedDueDate(new Date(updatedProject.due_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                }));
                setProcessedProjectDetails(updatedProject.description || '');
            })
            .subscribe();

        const teamChannel = supabase
            .channel(`project_task_team-${processID}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_task_team', filter: `project_id=eq.${processID}` }, async (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    const { data, error } = await supabase
                        .from('project_task_team')
                        .select('user_id, users (avatar, full_name), role')
                        .eq('project_id', processID);
                    if (error) {
                        console.error('Error fetching updated project team:', error.message);
                    } else {
                        const membersData = data.map((item: any) => ({
                            user_id: item.user_id,
                            avatar: item.users.avatar,
                            name: item.users.full_name || 'Unknown',
                            role: item.role || 'Member',
                        }));
                        setProcessedMembers(membersData);
                    }
                } else if (payload.eventType === 'DELETE') {
                    setProcessedMembers((prev) => prev.filter((member) => member.user_id !== payload.old.user_id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(taskChannel);
            supabase.removeChannel(projectChannel);
            supabase.removeChannel(teamChannel);
        };
    }, [processID]);

    const handleSaveTask = async () => {
        if (!nameTask.trim()) {
            alert("Tên task không được để trống!");
            return;
        }
        if (!processID) {
            alert("Project ID không hợp lệ!");
            return;
        }
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase
                .from('tasks')
                .insert({
                    project_id: processID,
                    created_by: user.id,
                    title: nameTask,
                    due_date: dueDateTask.toISOString(),
                    start_time: dueTimeTask.toISOString(),
                    end_time: dueTimeTask.toISOString(),
                    status: false,
                });
            if (error) throw error;
            console.log("✅ Task đã được thêm thành công!");
            setModalAddTaskVisible(false);
            setNameTask("");
        } catch (error) {
            console.error("❌ Lỗi khi thêm task:", error);
        }
    };

    const handleChangeTask = async () => {
        if (!selectedTask || !nameTask.trim()) {
            alert("Vui lòng chọn một task và nhập tên hợp lệ!");
            return;
        }
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: nameTask,
                    due_date: dueDateTask.toISOString(),
                    start_time: dueTimeTask.toISOString(),
                    end_time: dueTimeTask.toISOString(),
                })
                .eq('id', selectedTask.id);
            if (error) throw error;
            console.log(`✅ Task ID ${selectedTask.id} đã được cập nhật!`);
            setTaskModalVisible(false);
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật task:", error);
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask) {
            alert("Vui lòng chọn một task để xoá!");
            return;
        }
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', selectedTask.id);
            if (error) throw error;
            console.log(`✅ Task ID ${selectedTask.id} đã bị xoá!`);
            setTaskModalVisible(false);
        } catch (error) {
            console.error("❌ Lỗi khi xoá task:", error);
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

    const handleGoBack = () => {
        router.back();
    };

    const toggleTaskStatus = async (taskId: string) => {
        try {
            const taskToUpdate = tasks.find(task => task.id === taskId);
            if (!taskToUpdate) return;

            const newStatus = !taskToUpdate.status;
            const { error: updateTaskError } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', taskId);
            if (updateTaskError) throw updateTaskError;

            const updatedTasks = tasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
            );
            setTasks(updatedTasks);

            if (!processID) {
                console.error("❌ Project ID không hợp lệ, không thể cập nhật trạng thái project.");
                return;
            }

            const newProgress = calculateCompletionPercentage(updatedTasks);
            const currentProjectStatus = await supabase
                .from('projects')
                .select('status')
                .eq('id', processID)
                .single();

            if (currentProjectStatus.error) throw currentProjectStatus.error;

            const projectStatus = currentProjectStatus.data.status;
            if (newProgress < 100 && projectStatus === 'completed') {
                const { error: updateProjectError } = await supabase
                    .from('projects')
                    .update({ status: 'ongoing' })
                    .eq('id', processID);
                if (updateProjectError) throw updateProjectError;
                console.log(`✅ Project ${processID} đã chuyển từ completed sang ongoing`);
            } else if (newProgress === 100 && projectStatus !== 'completed') {
                const { error: updateProjectError } = await supabase
                    .from('projects')
                    .update({ status: 'completed' })
                    .eq('id', processID);
                if (updateProjectError) throw updateProjectError;
                console.log(`✅ Project ${processID} đã chuyển sang completed`);
            }
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái task hoặc project:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Head
                onLeftPress={handleGoBack}
                onRightPress={() => {
                    router.push({
                        pathname: '/screens/projectInformation',
                        params: {
                            id: processID,
                            title: processedTitle,
                            description: processedProjectDetails || '',
                            due_date: due_date as string,
                            type: selectedProjectType as string,
                            permission: processPermission as string,
                            members: JSON.stringify(processedMembers),
                        },
                    });
                }}
            >
                <CustomText style={[{ fontFamily: 'Inter' }, styles.headTitle]}>Project Details</CustomText>
            </Head>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.header}>
                    <CustomText style={[{ fontFamily: 'Inter' }, styles.info]}>{processedTitle}</CustomText>
                </View>
                <View style={styles.dateAndTeam}>
                    <View style={styles.date}>
                        <Image
                            source={{ uri: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/3b81ac77-79c7-49c3-88db-5758394b8f30" }}
                            style={styles.dateImage}
                        />
                    </View>
                    <View style={styles.textDate}>
                        <CustomText style={[{ fontFamily: 'InterMedium' }, styles.dueDate]}>Due Date</CustomText>
                        <CustomText style={[{ fontFamily: 'InterSemiBold' }, styles.dateText]}>{processedDueDate}</CustomText>
                    </View>
                    <View style={styles.team}>
                        <Image
                            source={{ uri: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c5881b13-0fbc-44e5-a12f-a9c111c25a1f" }}
                            style={styles.dateImage}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => setTeamModalVisible(true)}
                        style={styles.textTeam}
                    >
                        <CustomText style={[{ fontFamily: 'InterMedium' }, styles.dueDate]}>Project Team</CustomText>
                        <View style={styles.teamMember}>
                            {processedMembers.slice(0, 3).map((member: Member, index: number) => (
                                <Image
                                    key={member.user_id}
                                    source={
                                        member.avatar
                                            ? { uri: member.avatar }
                                            : require('@/assets/images/Avatar/Ellipse 36.png')
                                    }
                                    style={[styles.memberAvatar, { zIndex: 3 - index, marginLeft: index > 0 ? -10 : 0 }]}
                                />
                            ))}
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
                    <CustomText style={[{ fontFamily: 'InterReguler' }, styles.textDetails]}>{processedProjectDetails}</CustomText>
                </View>
                <View style={styles.progress}>
                    <CustomText style={[{ fontFamily: 'InterMedium' }, styles.progressText]}>Project Progress</CustomText>
                    <CompletedCircle progress={taskProgress} containerStyle={styles.completed} />
                </View>
                <View style={styles.allTask}>
                    <CustomText style={[{ fontFamily: 'InterMedium' }, styles.allTaskText]}>All Tasks</CustomText>
                </View>
                <View style={styles.flashList}>
                    <FlashList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        estimatedItemSize={58}
                        renderItem={({ item }: { item: TaskRow }) => (
                            <TouchableOpacity
                                style={[styles.box, tasks.indexOf(item) > 0 && { marginTop: 12 }]}
                                onPress={() => toggleTaskStatus(item.id)}
                                onLongPress={() => {
                                    setSelectedTask(item);
                                    setNameTask(item.title || '');
                                    setDueDateTask(new Date(item.due_date || Date.now()));
                                    setDueTimeTask(new Date(item.start_time || Date.now()));
                                    setTaskModalVisible(true);
                                }}
                            >
                                <CustomText style={[{ fontFamily: "InterMedium" }, styles.boxText]}>
                                    {item.title}
                                </CustomText>
                                <View style={styles.boxIcon}>
                                    <Image
                                        source={{
                                            uri: item.status
                                                ? "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/821e1450-bd52-4d89-8ba1-a77d5137fcbc"
                                                : "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/8a9772be-257c-46a8-bcd9-2015ab0f44ff",
                                        }}
                                        style={{ width: 24, height: 24 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flashListContent}
                    />
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
                handleChangeTask={handleChangeTask}
                handleDeleteTask={handleDeleteTask}
                onShowDatePicker={() => setShowDatePicker(true)}
                onShowTimePicker={() => setShowTimePicker(true)}
                timeOnpress={onChangeTime}
                dateOnpress={onChangeDate}
            />
            <View style={styles.addTask}>
                <MyButton
                    onPress={() => setModalAddTaskVisible(true)}
                    style={styles.addTaskButton}
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
            />
            <TeamMembersModal
                visible={teamModalVisible}
                onClose={() => setTeamModalVisible(false)}
                members={processedMembers}
            />
        </View>
    );
};

export default TaskDetails;