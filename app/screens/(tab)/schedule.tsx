import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
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
    day: string; // Thứ (Mon, Tue,...)
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
                day: date.toLocaleString('default', { weekday: 'short' }),
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
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error('Error fetching user:', userError);
            return;
        }

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
            .eq('due_date', date)
            .order('start_time', { ascending: true });

        if (tasksError) {
            console.error('Error fetching tasks:', tasksError);
            return;
        }

        const tasksWithMembers = await Promise.all(
            tasksData.map(async (task: any) => {
                const { data: teamData, error: teamError } = await supabase
                    .from('project_task_team')
                    .select(`
                        user_id,
                        users!project_task_team_user_id_fkey (id, avatar, full_name)
                    `)
                    .eq('task_id', task.id)
                    .eq('project_id', task.project_id);

                if (teamError) {
                    console.error('Error fetching task team:', teamError);
                    return { ...task, members: [] };
                }

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
            <SafeAreaView style={styles.container}>
                <Text style={styles.emptyText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.calendar}>
                <Text style={styles.month}>
                    {selectedMonth.toLocaleString('default', { month: 'long' })}
                </Text>
                <FlatList
                    data={daysInMonth}
                    keyExtractor={(item) => item.date.toString()}
                    horizontal
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.day,
                                item.date === new Date(selectedDate).getDate() &&
                                new Date(selectedDate).getMonth() === selectedMonth.getMonth() &&
                                styles.selectedDay,
                            ]}
                            onPress={() => handleDateSelect(item.date)}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    item.date === new Date(selectedDate).getDate() &&
                                    new Date(selectedDate).getMonth() === selectedMonth.getMonth() &&
                                    styles.selectedDayText,
                                ]}
                            >
                                {item.day}
                            </Text>
                            <Text
                                style={[
                                    styles.dateText,
                                    item.date === new Date(selectedDate).getDate() &&
                                    new Date(selectedDate).getMonth() === selectedMonth.getMonth() &&
                                    styles.selectedDateText,
                                ]}
                            >
                                {item.date}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <Text style={styles.sectionHeader}>Today's Tasks</Text>

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
                ListEmptyComponent={<Text style={styles.emptyText}>No tasks for this day</Text>}
            />

            <Modal
                visible={showMonthPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowMonthPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Month</Text>
                        <FlatList
                            data={months}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    style={styles.monthItem}
                                    onPress={() => handleMonthSelect(index)}
                                >
                                    <Text style={styles.monthText}>{item}</Text>
                                </Pressable>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowMonthPicker(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
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
        backgroundColor: '#1E2A44',
    },
    headerRight: {
        marginRight: 16,
        marginBottom: 20
    },
    calendar: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    month: {
        color: '#A0AEC0',
        fontSize: 16,
        marginBottom: 8,
    },
    day: {
        alignItems: 'center',
        padding: 8,
        marginRight: 8,
        borderRadius: 8,
    },
    selectedDay: {
        backgroundColor: '#FFC107',
    },
    dayText: {
        color: '#A0AEC0',
        fontSize: 12,
    },
    selectedDayText: {
        color: '#1E2A44',
    },
    dateText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    selectedDateText: {
        color: '#1E2A44',
    },
    sectionHeader: {
        color: '#A0AEC0',
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    emptyText: {
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#2A3A5A',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    monthItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#A0AEC0',
    },
    monthText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: '#FFC107',
        paddingVertical: 12,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#1E2A44',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});