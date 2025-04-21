import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Modal,
    Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, useNavigation } from 'expo-router';
import { supabase } from '@/services/supabase';
import { TaskItem } from '@/components/TaskItem';
import Icon from '@/components/Icon';
import CustomText from '@/constants/CustomText';
import { useThemeContext } from '@/context/ThemeContext';

interface Task {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    due_date: string;
    members: { id: string; avatar?: string | null }[];
    isCompleted: boolean;
}

interface Day {
    date: number;
    day: string; // Shortened English weekday names (Mon, Tue,...)
}

export default function ScheduleScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    const [daysInMonth, setDaysInMonth] = useState<Day[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const { colors } = useThemeContext();

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (year: number, month: number): Day[] => {
        const date = new Date(year, month, 1);
        const days: Day[] = [];
        while (date.getMonth() === month) {
            days.push({
                date: date.getDate(),
                day: date.toLocaleString('en-US', { weekday: 'short' }),
            });
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    useEffect(() => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const days = getDaysInMonth(year, month);
        setDaysInMonth(days);
    }, [selectedMonth]);

    const fetchTasks = async (date: string) => {
        console.log(`[fetchTasks] Starting fetch for date: ${date}`);

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error(`[fetchTasks] Error fetching user: ${userError?.message || 'No user found'}`, {
                date,
                error: userError,
            });
            return;
        }
        console.log(`[fetchTasks] Fetched user: ${userData.user.id}`, {
            userId: userData.user.id,
            email: userData.user.email,
        });

        // Create a date range for the selected date
        const startOfDay = `${date}T00:00:00.000Z`; // e.g., 2025-04-16T00:00:00.000Z
        const endOfDay = `${date}T23:59:59.999Z`;   // e.g., 2025-04-16T23:59:59.999Z

        const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select(`
                id,
                title,
                start_time,
                end_time,
                due_date,
                project_id,
                status
            `)
            .gte('due_date', startOfDay) // due_date >= start of the day
            .lte('due_date', endOfDay)   // due_date <= end of the day
            .order('start_time', { ascending: true });

        if (tasksError) {
            console.error(`[fetchTasks] Error fetching tasks for date ${date}: ${tasksError.message}`, {
                date,
                error: tasksError,
            });
            return;
        }
        console.log(`[fetchTasks] Fetched ${tasksData.length} tasks for date ${date}`, {
            tasks: tasksData.map((task) => ({
                id: task.id,
                title: task.title,
                due_date: task.due_date,
            })),
        });

        const tasksWithMembers = await Promise.all(
            tasksData.map(async (task: any) => {
                console.log(`[fetchTasks] Fetching members for task: ${task.id} (${task.title})`);

                const { data: teamData, error: teamError } = await supabase
                    .from('project_task_team')
                    .select(`
                        user_id,
                        users!project_task_team_user_id_fkey (id, avatar, full_name)
                    `)
                    .eq('task_id', task.id)
                    .eq('project_id', task.project_id);

                if (teamError) {
                    console.error(`[fetchTasks] Error fetching members for task ${task.id}: ${teamError.message}`, {
                        taskId: task.id,
                        projectId: task.project_id,
                        error: teamError,
                    });
                    return { ...task, members: [] };
                }
                console.log(`[fetchTasks] Fetched ${teamData.length} members for task ${task.id}`, {
                    members: teamData.map((member) => ({
                        user_id: member.user_id,
                        full_name: member.users?.full_name,
                    })),
                });

                const members = teamData.map((member: any) => ({
                    id: member.user_id,
                    avatar: member.users?.avatar,
                }));

                return {
                    id: task.id,
                    title: task.title,
                    start_time: task.start_time,
                    end_time: task.end_time,
                    due_date: task.due_date,
                    members,
                    isCompleted: task.status === true,
                };
            })
        );

        setTasks(tasksWithMembers);
        console.log(`[fetchTasks] Completed fetch for date ${date}, set ${tasksWithMembers.length} tasks`, {
            taskCount: tasksWithMembers.length,
            tasks: tasksWithMembers.map((task) => task.id),
        });
    };

    useEffect(() => {
        setIsLoading(true);
        fetchTasks(selectedDate).then(() => setIsLoading(false));
    }, [selectedDate]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setShowMonthPicker(true)}>
                    <Icon category='topTab' name='addProject' style={styles.headerRight} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleDateSelect = (date: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setDate(date);
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    const handleMonthSelect = (monthIndex: number) => {
        const newMonth = new Date(selectedMonth);
        newMonth.setMonth(monthIndex);
        setSelectedMonth(newMonth);
        setShowMonthPicker(false);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
                <CustomText fontFamily="Inter" fontSize={16} style={styles.emptyText}>
                    Loading...
                </CustomText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <View style={styles.calendar}>
                <CustomText fontFamily="Inter" fontSize={22} style={[styles.month, { color: colors.text5 }]}>
                    {selectedMonth.toLocaleString('en-US', { month: 'long' })}
                </CustomText>
                <FlatList
                    data={daysInMonth}
                    keyExtractor={(item) => item.date.toString()}
                    horizontal
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                [styles.day, { backgroundColor: colors.box3 }],
                                item.date === new Date(selectedDate).getDate() &&
                                new Date(selectedDate).getMonth() === selectedMonth.getMonth() &&
                                { backgroundColor: colors.box1 },
                            ]}
                            onPress={() => handleDateSelect(item.date)}
                        >
                            <CustomText
                                fontFamily="Inter"
                                fontSize={12}
                                style={[
                                    { color: colors.text5 },
                                    item.date === new Date(selectedDate).getDate() &&
                                        new Date(selectedDate).getMonth() === selectedMonth.getMonth()
                                        ? { color: colors.text4 }
                                        : {},
                                ]}
                            >
                                {item.day}
                            </CustomText>
                            <CustomText
                                fontFamily="Inter"
                                fontSize={14}
                                style={[
                                    { color: colors.text5 },
                                    item.date === new Date(selectedDate).getDate() &&
                                        new Date(selectedDate).getMonth() === selectedMonth.getMonth()
                                        ? { color: colors.text4 }
                                        : {},
                                ]}
                            >
                                {item.date}
                            </CustomText>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <CustomText fontFamily="Inter" fontSize={22} style={[styles.sectionHeader, { color: colors.text5 }]}>
                Today's Tasks
            </CustomText>

            <FlashList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TaskItem
                        title={item.title}
                        startTime={item.start_time}
                        endTime={item.end_time}
                        members={item.members}
                        isCompleted={item.isCompleted}
                    />
                )}
                estimatedItemSize={70}
                ListEmptyComponent={
                    <CustomText fontFamily="Inter" fontSize={16} style={[styles.emptyText, { color: colors.textNoti }]}>
                        No tasks for this day
                    </CustomText>
                }
            />

            <Modal
                visible={showMonthPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowMonthPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.backgroundColor }]}>
                        <CustomText fontFamily="InterSemiBold" fontSize={18} style={[styles.modalTitle, { color: colors.text5 }]}>
                            Select Month
                        </CustomText>
                        <FlatList
                            data={months}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    style={styles.monthItem}
                                    onPress={() => handleMonthSelect(index)}
                                >
                                    <CustomText fontFamily="Inter" fontSize={16} style={[styles.monthText, { color: colors.text5 }]}>
                                        {item}
                                    </CustomText>
                                </Pressable>
                            )}
                        />
                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: colors.box1 }]}
                            onPress={() => setShowMonthPicker(false)}
                        >
                            <CustomText fontFamily="Inter" fontSize={16} style={[styles.closeButtonText, { color: colors.text4 }]}>
                                Close
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 29,
    },
    headerRight: {
        marginRight: 16,
        marginBottom: 20,
    },
    calendar: {
        paddingVertical: 12,
    },
    month: {
        marginBottom: 8,
    },
    day: {
        alignItems: 'center',
        padding: 16,
        marginRight: 8,
    },
    selectedDateText: {
        color: '#1E2A44',
    },
    sectionHeader: {
        paddingVertical: 8,
        marginBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        padding: 20,
        width: '80%',
        maxHeight: '60%',
    },
    modalTitle: {
        textAlign: 'center',
    },
    monthItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#A0AEC0',
    },
    monthText: {
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 16,
        paddingVertical: 12,
    },
    closeButtonText: {
        textAlign: 'center',
    },
});