import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import CustomText from '@/constants/CustomText';
import { useRouter } from 'expo-router';
import styles from '@/styles/home';
import CompletedCircle from '@/components/CompletedCircle';
import MyInputField from '@/components/MyInputField';
import CompletedLine from '@/components/CompletedLine';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import * as Icon from '@/constants/CustomIcon'

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type ProjectTaskTeamRow = Database['public']['Tables']['project_task_team']['Row'];

interface ProjectTaskTeamWithUser {
    project_id: string;
    user_id: string;
    users: { avatar: string | null };
}

interface Project extends ProjectRow {
    tasks: TaskRow[];
    members: { user_id: string; avatar: string | null }[];
    permission: string;
}

interface NavigationParams {
    id: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    created_by: string;
    allTasks: string;
    type: string;
    teamMember?: string;
    permission?: string;
    members?: string;
    [key: string]: string | undefined;
}

const Home = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [projectsData, setProjectsData] = useState<{ completed: Project[]; ongoing: Project[] }>({
        completed: [],
        ongoing: [],
    });

    const completedScrollRef = useRef<ScrollView>(null);
    const ongoingScrollRef = useRef<ScrollView>(null);

    const fetchUserAndProjects = async () => {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Người dùng chưa được xác thực:', userError?.message);
            setLoading(false);
            return;
        }

        const { data: userProjects, error: userProjectsError } = await supabase
            .from('project_task_team')
            .select('project_id')
            .eq('user_id', user.id)
            .returns<{ project_id: string }[]>();

        if (userProjectsError) {
            console.error('Lỗi khi lấy danh sách dự án của người dùng:', userProjectsError.message);
            setLoading(false);
            return;
        }

        const projectIdsFromTeam = userProjects.map((up) => up.project_id);
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .or(`created_by.eq.${user.id},id.in.(${projectIdsFromTeam.join(',')})`)
            .returns<ProjectRow[]>();

        if (projectsError) {
            console.error('Lỗi khi lấy danh sách dự án:', projectsError.message);
            setLoading(false);
            return;
        }

        const projectIds = projects.map((p) => p.id);
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .in('project_id', projectIds)
            .returns<TaskRow[]>();

        if (tasksError) {
            console.error('Lỗi khi lấy danh sách nhiệm vụ:', tasksError.message);
            setLoading(false);
            return;
        }

        const { data: projectTaskTeam, error: teamError } = await supabase
            .from('project_task_team')
            .select('project_id, user_id, users (avatar)')
            .in('project_id', projectIds)
            .returns<ProjectTaskTeamWithUser[]>();

        if (teamError) {
            console.error('Lỗi khi lấy thành viên nhóm dự án:', teamError.message);
            setLoading(false);
            return;
        }

        const projectsWithDetails = projects.map((project) => {
            const projectMembers = projectTaskTeam
                .filter((ptt) => ptt.project_id === project.id)
                .map((ptt) => ({
                    user_id: ptt.user_id,
                    avatar: ptt.users.avatar,
                }));

            return {
                ...project,
                tasks: tasks.filter((task) => task.project_id === project.id),
                members: projectMembers,
            };
        });

        const completed = projectsWithDetails.filter((p) => p.status === 'completed');
        const ongoing = projectsWithDetails.filter((p) => p.status === 'ongoing');

        setProjectsData({ completed, ongoing });
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserAndProjects();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchUserAndProjects();

        const projectChannel = supabase
            .channel('projects')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'projects' },
                (payload) => {
                    console.log('Project data changed:', payload);
                    const updatedProject = payload.new as ProjectRow;

                    setProjectsData((prev) => {
                        const updateProject = (projects: Project[]) =>
                            projects.map((project) =>
                                project.id === updatedProject.id
                                    ? { ...project, title: updatedProject.title, due_date: updatedProject.due_date, status: updatedProject.status }
                                    : project
                            );

                        const completed = updateProject(prev.completed);
                        const ongoing = updateProject(prev.ongoing);

                        // Di chuyển dự án giữa completed và ongoing nếu status thay đổi
                        if (updatedProject.status === 'completed') {
                            const movedProject = ongoing.find((p) => p.id === updatedProject.id);
                            if (movedProject) {
                                return {
                                    completed: [...completed, { ...movedProject, ...updatedProject }],
                                    ongoing: ongoing.filter((p) => p.id !== updatedProject.id),
                                };
                            }
                        } else if (updatedProject.status === 'ongoing') {
                            const movedProject = completed.find((p) => p.id === updatedProject.id);
                            if (movedProject) {
                                return {
                                    completed: completed.filter((p) => p.id !== updatedProject.id),
                                    ongoing: [...ongoing, { ...movedProject, ...updatedProject }],
                                };
                            }
                        }

                        return { completed, ongoing };
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'projects' },
                () => fetchUserAndProjects() // Tải lại toàn bộ khi có dự án mới
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'projects' },
                (payload) => {
                    const deletedProjectId = payload.old.id;
                    setProjectsData((prev) => ({
                        completed: prev.completed.filter((p) => p.id !== deletedProjectId),
                        ongoing: prev.ongoing.filter((p) => p.id !== deletedProjectId),
                    }));
                }
            )
            .subscribe();

        const taskChannel = supabase
            .channel('tasks')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                async (payload) => {
                    console.log('Task data changed:', payload);

                    // Xác định project_id dựa trên loại sự kiện
                    let projectId: string | undefined;
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        projectId = (payload.new as TaskRow)?.project_id;
                    } else if (payload.eventType === 'DELETE') {
                        projectId = (payload.old as { id: string; project_id: string })?.project_id;
                    }

                    if (!projectId) {
                        console.error('No project_id found in payload');
                        return;
                    }

                    // Lấy danh sách tasks mới nhất cho projectId
                    const { data: tasks, error: tasksError } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('project_id', projectId)
                        .returns<TaskRow[]>();

                    if (tasksError) {
                        console.error('Error fetching updated tasks:', tasksError.message);
                        return;
                    }

                    setProjectsData((prev) => {
                        const updateTasks = (projects: Project[]) =>
                            projects.map((project) =>
                                project.id === projectId ? { ...project, tasks } : project
                            );

                        return {
                            completed: updateTasks(prev.completed),
                            ongoing: updateTasks(prev.ongoing),
                        };
                    });
                }
            )
            .subscribe();

        const teamChannel = supabase
            .channel('project_task_team')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'project_task_team' },
                async (payload) => {
                    console.log('Project team data changed:', payload);
                    const projectId = payload.new.project_id;
                    const userId = payload.new.user_id;

                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('avatar')
                        .eq('id', userId)
                        .single();

                    if (userError) {
                        console.error('Error fetching updated user:', userError.message);
                        return;
                    }

                    setProjectsData((prev) => {
                        const updateMembers = (projects: Project[]) =>
                            projects.map((project) =>
                                project.id === projectId
                                    ? {
                                        ...project,
                                        members: project.members.map((member) =>
                                            member.user_id === userId
                                                ? { ...member, avatar: userData.avatar }
                                                : member
                                        ),
                                    }
                                    : project
                            );

                        return {
                            completed: updateMembers(prev.completed),
                            ongoing: updateMembers(prev.ongoing),
                        };
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(projectChannel);
            supabase.removeChannel(taskChannel);
            supabase.removeChannel(teamChannel);
        };
    }, []);

    const calculateCompletionPercentage = (tasks: TaskRow[] = []): number => {
        const completedTasks = tasks.filter((task) => task.status).length;
        return tasks.length > 0 ? parseFloat(((completedTasks / tasks.length) * 100).toFixed(2)) : 0;
    };

    const handleTaskPress = (task: Project) => {
        const params: NavigationParams = {
            id: task.id,
            title: task.title,
            description: task.description || '',
            due_date: task.due_date,
            status: task.status,
            created_by: task.created_by,
            allTasks: JSON.stringify(task.tasks || []),
            type: 'completed',
            members: JSON.stringify(task.members || []),
        };
        router.push({ pathname: '/screens/taskDetails', params });
    };

    const handleProjectPress = (project: Project) => {
        const params: NavigationParams = {
            id: project.id,
            title: project.title,
            description: project.description || '',
            due_date: project.due_date,
            status: project.status,
            created_by: project.created_by,
            allTasks: JSON.stringify(project.tasks || []),
            type: 'ongoingProjects',
            members: JSON.stringify(project.members || []),
        };
        router.push({ pathname: '/screens/taskDetails', params });
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchAndSetting}>
                <MyInputField
                    style={styles.search}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Tìm kiếm nhiệm vụ"
                    leftIcon={
                        <Image
                            source={Icon.screens.search}
                            style={{ width: 24, height: 24 }}
                        />
                    }
                />
                <View style={styles.setting}>
                    <Image
                        source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/29d5bfb0-2b66-4e13-84c3-b9d2014ebb74' }}
                        style={styles.settingImage}
                    />
                </View>
            </View>

            <View style={styles.completedProject}>
                <CustomText fontFamily="Inter" style={styles.title1}>
                    Dự Án Đã Hoàn Thành
                </CustomText>
                <CustomText fontFamily="Inter" style={styles.title2}>
                    Xem tất cả
                </CustomText>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#FED36A" style={{ top: 120 }} />
            ) : (
                <ScrollView
                    ref={completedScrollRef}
                    horizontal
                    style={{ flex: 1 }}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FED36A" />
                    }
                >
                    {projectsData.completed.map((task, index) => (
                        <TouchableOpacity
                            key={task.id}
                            style={[styles.box, index > 0 && { marginLeft: 7 }]}
                            onPress={() => handleTaskPress(task)}
                        >
                            <CustomText fontFamily="Inter" style={styles.titleBoxSelectedBox}>
                                {task.title}
                            </CustomText>
                            <View style={styles.teamMemberConntainer}>
                                <CustomText fontFamily="InterReguler" fontSize={13.25} style={{ color: '#212832' }}>
                                    Thành viên nhóm
                                </CustomText>
                                <View style={styles.teamMember}>
                                    {task.members.slice(0, 5).map((member) => (
                                        <Image
                                            key={member.user_id}
                                            source={
                                                member.avatar
                                                    ? { uri: member.avatar }
                                                    : require('@/assets/images/Avatar/Ellipse 36.png')
                                            }
                                            style={styles.memberAvatar}
                                        />
                                    ))}
                                </View>
                            </View>
                            <View style={styles.progressBox}>
                                <CustomText fontFamily="InterReguler" style={{ fontSize: 13.25, color: '#212832' }}>
                                    Đã hoàn thành
                                </CustomText>
                                <CustomText fontFamily="Inter" style={{ fontSize: 13.25, color: '#212832' }}>
                                    {calculateCompletionPercentage(task.tasks)}%
                                </CustomText>
                            </View>
                            <CompletedLine
                                progress={calculateCompletionPercentage(task.tasks)}
                                containerStyle={{ marginTop: 10 }}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <View style={styles.ongoingProject}>
                <CustomText fontFamily="Inter" style={styles.title1}>
                    Dự Án Đang Thực Hiện
                </CustomText>
                <CustomText fontFamily="Inter" style={styles.title2}>
                    Xem tất cả
                </CustomText>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#FED36A" style={{ top: 360 }} />
            ) : (
                <ScrollView
                    ref={ongoingScrollRef}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContentVertically}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FED36A" />
                    }
                >
                    {projectsData.ongoing.map((project, index) => (
                        <TouchableOpacity
                            key={project.id}
                            style={[styles.box1, index > 0 && { marginTop: 15 }]}
                            onPress={() => handleProjectPress(project)}
                        >
                            <CustomText fontFamily="Inter" style={styles.titleBoxUnSelected}>
                                {project.title}
                            </CustomText>
                            <View style={styles.box2}>
                                <View style={styles.teamMemberProject}>
                                    <CustomText fontFamily="InterReguler" style={{ fontSize: 13.25, color: '#FFFFFF' }}>
                                        Thành viên nhóm
                                    </CustomText>
                                    <View style={styles.teamMember}>
                                        {project.members.slice(0, 5).map((member) => (
                                            <Image
                                                key={member.user_id}
                                                source={
                                                    member.avatar
                                                        ? { uri: member.avatar }
                                                        : require('@/assets/images/Avatar/Ellipse 36.png')
                                                }
                                                style={styles.memberAvatar}
                                            />
                                        ))}
                                    </View>
                                </View>
                                <View>
                                    <CustomText
                                        fontFamily="Inter"
                                        style={{ lineHeight: 25, width: 113, fontSize: 13.25, color: '#FFFFFF' }}
                                    >
                                        Hạn chót:{' '}
                                        {new Date(project.due_date).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'long',
                                        })}
                                    </CustomText>
                                </View>
                                <CompletedCircle
                                    progress={calculateCompletionPercentage(project.tasks)}
                                    containerStyle={styles.completed}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default Home;