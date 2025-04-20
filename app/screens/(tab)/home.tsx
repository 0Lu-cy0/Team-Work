import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import CustomText from '@/constants/CustomText';
import { useRouter } from 'expo-router';
import styles from '@/styles/home';
import CompletedCircle from '@/components/CompletedCircle';
import MyInputField from '@/components/MyInputField';
import CompletedLine from '@/components/CompletedLine';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import Icon from '@/components/Icon';
import { useThemeContext } from '@/context/ThemeContext';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface ProjectTeamWithUser {
    project_id: string;
    user_id: string;
    users: { avatar: string | null };
}

interface Project extends ProjectRow {
    tasks: TaskRow[];
    members: { user_id: string; avatar: string | null }[];
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
    const [filteredProjectsData, setFilteredProjectsData] = useState<{ completed: Project[]; ongoing: Project[] }>({
        completed: [],
        ongoing: [],
    });

    const { colors } = useThemeContext();
    const completedScrollRef = useRef<ScrollView>(null);
    const ongoingScrollRef = useRef<ScrollView>(null);

    const fetchUserAndProjects = async () => {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('[FETCH_USER_ERROR] Failed to fetch user:', { error: userError?.message });
            setLoading(false);
            return;
        }
        console.log('[FETCH_USER_SUCCESS] Current user:', { userId: user.id });

        const { data: userProjects, error: userProjectsError } = await supabase
            .from('project_team')
            .select('project_id')
            .eq('user_id', user.id);

        if (userProjectsError) {
            console.error('[FETCH_USER_PROJECTS_ERROR] Failed to fetch user projects:', {
                error: userProjectsError.message,
                details: userProjectsError.details,
            });
            setLoading(false);
            return;
        }
        console.log('[FETCH_USER_PROJECTS_SUCCESS] User project IDs from project_team:', {
            projectIds: userProjects.map((up) => up.project_id),
            count: userProjects.length,
        });

        const projectIdsFromTeam = userProjects.map((up) => up.project_id);
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .or(`created_by.eq.${user.id},id.in.(${projectIdsFromTeam.join(',')})`);

        if (projectsError) {
            console.error('[FETCH_PROJECTS_ERROR] Failed to fetch projects:', {
                error: projectsError.message,
                details: projectsError.details,
            });
            setLoading(false);
            return;
        }
        console.log('[FETCH_PROJECTS_SUCCESS] Raw projects data:', {
            projects: projects,
            projectCount: projects.length,
            projectIds: projects.map((p) => p.id),
        });

        const projectIds = projects.map((p) => p.id);
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .in('project_id', projectIds);

        if (tasksError) {
            console.error('[FETCH_TASKS_ERROR] Failed to fetch tasks:', {
                error: tasksError.message,
                details: tasksError.details,
            });
            setLoading(false);
            return;
        }
        console.log('[FETCH_TASKS_SUCCESS] Raw tasks data:', {
            tasks: tasks,
            taskCount: tasks.length,
            taskIds: tasks.map((t) => t.id),
            projectIdsInTasks: [...new Set(tasks.map((t) => t.project_id))],
        });

        const { data: projectTeam, error: teamError } = await supabase
            .from('project_team')
            .select('project_id, user_id, users (avatar)')
            .in('project_id', projectIds);

        if (teamError) {
            console.error('[FETCH_PROJECT_TEAM_ERROR] Failed to fetch project_team:', {
                error: teamError.message,
                details: teamError.details,
            });
            setLoading(false);
            return;
        }
        console.log('[FETCH_PROJECT_TEAM_SUCCESS] Raw project_team data:', {
            projectTeam: projectTeam,
            entryCount: projectTeam.length,
            projectIdsInTeam: [...new Set(projectTeam.map((pt) => pt.project_id))],
            userIdsInTeam: [...new Set(projectTeam.map((pt) => pt.user_id))],
        });

        const projectsWithDetails = projects.map((project) => ({
            ...project,
            tasks: tasks.filter((task) => task.project_id === project.id),
            members: projectTeam
                .filter((pt) => pt.project_id === project.id)
                .map((pt) => ({ user_id: pt.user_id, avatar: pt.users.avatar })),
        }));

        console.log('[PROJECTS_WITH_DETAILS] Processed projects with tasks and members:', {
            projectsWithDetails: projectsWithDetails,
            completedCount: projectsWithDetails.filter((p) => p.status === 'completed').length,
            ongoingCount: projectsWithDetails.filter((p) => p.status === 'ongoing').length,
        });

        setProjectsData({
            completed: projectsWithDetails.filter((p) => p.status === 'completed'),
            ongoing: projectsWithDetails.filter((p) => p.status === 'ongoing'),
        });
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserAndProjects();
        setRefreshing(false);
    };

    // Logic tìm kiếm
    useEffect(() => {
        if (!search.trim()) {
            // Nếu search rỗng, hiển thị toàn bộ dữ liệu gốc
            setFilteredProjectsData(projectsData);
            return;
        }

        const searchLower = search.toLowerCase();
        const filterProjects = (projects: Project[]) =>
            projects.filter((project) => project.title.toLowerCase().includes(searchLower));

        setFilteredProjectsData({
            completed: filterProjects(projectsData.completed),
            ongoing: filterProjects(projectsData.ongoing),
        });
    }, [search, projectsData]);

    useEffect(() => {
        fetchUserAndProjects();

        const projectChannel = supabase
            .channel('projects')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, async (payload) => {
                const updatedProject = payload.new as ProjectRow;
                console.log('[PROJECT_CHANNEL_UPDATE] Received update:', { updatedProject });

                const fetchUpdatedTasks = async (projectId: string): Promise<TaskRow[]> => {
                    const { data: tasks, error } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('project_id', projectId);
                    if (error) {
                        console.error('[FETCH_UPDATED_TASKS_ERROR] Failed to fetch updated tasks:', { error: error.message });
                        return [];
                    }
                    console.log('[FETCH_UPDATED_TASKS_SUCCESS] Updated tasks for project:', {
                        projectId,
                        tasks,
                    });
                    return tasks || [];
                };

                setProjectsData((prev) => {
                    const projectInCompleted = prev.completed.find((p) => p.id === updatedProject.id);
                    const projectInOngoing = prev.ongoing.find((p) => p.id === updatedProject.id);

                    if (updatedProject.status === 'completed' && projectInOngoing) {
                        fetchUpdatedTasks(updatedProject.id).then((updatedTasks) => {
                            setProjectsData((current) => ({
                                completed: [
                                    ...current.completed,
                                    { ...projectInOngoing, ...updatedProject, tasks: updatedTasks },
                                ],
                                ongoing: current.ongoing.filter((p) => p.id !== updatedProject.id),
                            }));
                        });
                        return prev;
                    } else if (updatedProject.status === 'ongoing' && projectInCompleted) {
                        fetchUpdatedTasks(updatedProject.id).then((updatedTasks) => {
                            setProjectsData((current) => ({
                                completed: current.completed.filter((p) => p.id !== updatedProject.id),
                                ongoing: [
                                    ...current.ongoing,
                                    { ...projectInCompleted, ...updatedProject, tasks: updatedTasks },
                                ],
                            }));
                        });
                        return prev;
                    }

                    return {
                        completed: prev.completed.map((p) =>
                            p.id === updatedProject.id ? { ...p, ...updatedProject } : p
                        ),
                        ongoing: prev.ongoing.map((p) =>
                            p.id === updatedProject.id ? { ...p, ...updatedProject } : p
                        ),
                    };
                });
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, () => fetchUserAndProjects())
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'projects' }, (payload) => {
                const deletedProjectId = payload.old.id;
                console.log('[PROJECT_CHANNEL_DELETE] Project deleted:', { deletedProjectId });
                setProjectsData((prev) => ({
                    completed: prev.completed.filter((p) => p.id !== deletedProjectId),
                    ongoing: prev.ongoing.filter((p) => p.id !== deletedProjectId),
                }));
            })
            .subscribe();

        const taskChannel = supabase
            .channel('tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                console.log('[TASK_CHANNEL_EVENT] Received task event:', { eventType: payload.eventType, payload });
                const projectId = payload.eventType === 'DELETE' ? payload.old.project_id : payload.new.project_id;
                setProjectsData((prev) => {
                    const updateTasks = (project: Project): Project => {
                        if (project.id !== projectId) return project;
                        if (payload.eventType === 'INSERT') {
                            return { ...project, tasks: [...project.tasks, payload.new as TaskRow] };
                        } else if (payload.eventType === 'UPDATE') {
                            return {
                                ...project,
                                tasks: project.tasks.map((t) =>
                                    t.id === (payload.new as TaskRow).id ? (payload.new as TaskRow) : t
                                ),
                            };
                        } else {
                            return { ...project, tasks: project.tasks.filter((t) => t.id !== payload.old.id) };
                        }
                    };

                    return {
                        completed: prev.completed.map(updateTasks),
                        ongoing: prev.ongoing.map(updateTasks),
                    };
                });
            })
            .subscribe();

        const teamChannel = supabase
            .channel('project_team')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'project_team' },
                (payload) => {
                    console.log('[TEAM_CHANNEL_EVENT] Received project_team event:', { eventType: payload.eventType, payload });
                    const teamRow = payload.eventType === 'DELETE'
                        ? (payload.old as Database['public']['Tables']['project_team']['Row'])
                        : (payload.new as Database['public']['Tables']['project_team']['Row']);
                    const projectId = teamRow.project_id;
                    if (!projectId) return;

                    const fetchUpdatedMembers = async (projectId: string) => {
                        const { data: projectTeam, error } = await supabase
                            .from('project_team')
                            .select('project_id, user_id, users (avatar)')
                            .eq('project_id', projectId);
                        if (error) {
                            console.error('[FETCH_UPDATED_MEMBERS_ERROR] Failed to fetch updated members:', { error: error.message });
                            return [];
                        }
                        return projectTeam.map((pt) => ({ user_id: pt.user_id, avatar: pt.users.avatar }));
                    };

                    setProjectsData((prev) => {
                        const updateMembers = (project: Project): Project => {
                            if (project.id !== projectId) return project;
                            fetchUpdatedMembers(projectId).then((updatedMembers) => {
                                setProjectsData((current) => ({
                                    completed: current.completed.map((p) =>
                                        p.id === projectId ? { ...p, members: updatedMembers } : p
                                    ),
                                    ongoing: current.ongoing.map((p) =>
                                        p.id === projectId ? { ...p, members: updatedMembers } : p
                                    ),
                                }));
                            });
                            return project;
                        };

                        return {
                            completed: prev.completed.map(updateMembers),
                            ongoing: prev.ongoing.map(updateMembers),
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

    const calculateCompletionPercentage = (tasks: TaskRow[] = []): number =>
        tasks.length > 0 ? parseFloat(((tasks.filter((task) => task.status).length / tasks.length) * 100).toFixed(2)) : 0;

    const handleTaskPress = (task: Project) => {
        router.push({
            pathname: '/screens/taskDetails',
            params: {
                id: task.id,
                title: task.title,
                description: task.description || '',
                due_date: task.due_date,
                status: task.status,
                created_by: task.created_by,
                allTasks: JSON.stringify(task.tasks || []),
                type: 'completed',
                members: JSON.stringify(task.members || []),
            },
        });
    };

    const handleProjectPress = (project: Project) => {
        router.push({
            pathname: '/screens/taskDetails',
            params: {
                id: project.id,
                title: project.title,
                description: project.description || '',
                due_date: project.due_date,
                status: project.status,
                created_by: project.created_by,
                allTasks: JSON.stringify(project.tasks || []),
                type: 'ongoingProjects',
                members: JSON.stringify(project.members || []),
            },
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <View style={styles.searchAndSetting}>
                <MyInputField
                    style={styles.search}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search projects"
                    leftIcon={<Icon category="screens" name="search" />}
                />
                <View style={[styles.setting, { backgroundColor: colors.box1 }]}>
                    <Icon category="screens" name="setting" />
                </View>
            </View>

            <View style={styles.completedProject}>
                <CustomText fontFamily="Inter" fontSize={26} style={[styles.title1, { color: colors.text7 }]}>Completed Projects</CustomText>
                <CustomText fontFamily="Inter" fontSize={20} style={[styles.title2, { color: colors.text2 }]}>See all</CustomText>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color={colors.box1} style={{ top: 120 }} />
            ) : (
                <View style={{ height: 190, width: "100%" }}>
                    <ScrollView
                        ref={completedScrollRef}
                        horizontal
                        style={{ flex: 1 }}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.box1} />}
                    >
                        {filteredProjectsData.completed.map((task, index) => ( // Sử dụng filteredProjectsData
                            <TouchableOpacity
                                key={task.id}
                                style={[styles.box, { backgroundColor: colors.box1 }, index > 0 && { marginLeft: 7 }]}
                                onPress={() => handleTaskPress(task)}
                            >
                                <View style={{ flex: 1 }}>
                                    <CustomText fontFamily="Inter" fontSize={20} style={styles.titleBoxSelectedBox}>{task.title}</CustomText>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                    <View style={styles.teamMemberConntainer}>
                                        <CustomText fontFamily="InterReguler" fontSize={13.25} style={{ color: colors.text6 }}>
                                            Team members
                                        </CustomText>
                                        <View style={styles.teamMember}>
                                            {task.members.slice(0, 5).map((member) =>
                                                member.avatar ? (
                                                    <Image
                                                        key={member.user_id}
                                                        source={{ uri: member.avatar }}
                                                        style={{ width: 20, height: 20, borderRadius: 16 }}
                                                    />
                                                ) : (
                                                    <Icon
                                                        key={member.user_id}
                                                        category="avatar"
                                                        style={{ width: 20, height: 20 }}
                                                    />
                                                )
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.progressBox}>
                                        <CustomText
                                            fontFamily="InterReguler"
                                            style={{ fontSize: 13.25, color: colors.text6 }}
                                        >
                                            Completed
                                        </CustomText>
                                        <CustomText fontFamily="Inter" style={{ fontSize: 13.25, color: colors.text6 }}>
                                            {calculateCompletionPercentage(task.tasks)}%
                                        </CustomText>
                                    </View>
                                    <CompletedLine
                                        progress={calculateCompletionPercentage(task.tasks)}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.ongoingProject}>
                <CustomText fontFamily="Inter" fontSize={26} style={[styles.title1, { color: colors.text7 }]}>Ongoing Project</CustomText>
                <CustomText fontFamily="Inter" fontSize={20} style={[styles.title2, { color: colors.text2 }]}>See all</CustomText>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color={colors.box1} style={{ top: 360 }} />
            ) : (
                <ScrollView
                    ref={ongoingScrollRef}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContentVertically}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.box1} />}
                >
                    {filteredProjectsData.ongoing.map((project, index) => ( // Sử dụng filteredProjectsData
                        <TouchableOpacity
                            key={project.id}
                            style={[styles.box1, { backgroundColor: colors.box2 }, index > 0 && { marginTop: 15 }]}
                            onPress={() => handleProjectPress(project)}
                        >
                            <CustomText fontFamily="Inter" fontSize={20} style={[styles.titleBoxUnSelected, { color: colors.text5 }]}>
                                {project.title}
                            </CustomText>
                            <View></View>
                            <View style={styles.box2}>
                                <View>
                                    <View style={styles.teamMemberProject}>
                                        <CustomText
                                            fontFamily="InterReguler"
                                            style={{ fontSize: 13.25, color: colors.text5 }}
                                        >
                                            Team members
                                        </CustomText>
                                        <View style={styles.teamMember}>
                                            {project.members.slice(0, 5).map((member) =>
                                                member.avatar ? (
                                                    <Image
                                                        key={member.user_id}
                                                        source={{ uri: member.avatar }}
                                                        style={{ width: 20, height: 20, borderRadius: 16 }}
                                                    />
                                                ) : (
                                                    <Icon
                                                        key={member.user_id}
                                                        category="avatar"
                                                        style={{ width: 20, height: 20 }}
                                                    />
                                                )
                                            )}
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 10, flex: 1 }}>
                                        <CustomText
                                            fontFamily="Inter"
                                            style={{ lineHeight: 25, width: 113, fontSize: 13.25, color: colors.text5 }}
                                        >
                                            Due on : {' '}
                                            {new Date(project.due_date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'long',
                                            })}
                                        </CustomText>
                                    </View>
                                </View>
                                <CompletedCircle
                                    progress={calculateCompletionPercentage(project.tasks)}
                                    containerStyle={{ marginRight: 20 }}
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