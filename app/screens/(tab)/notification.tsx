import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { NotificationItem } from '@/components/NotificationItem';
import { formatRelativeTime } from '@/utils/dateUtils';
import { useThemeContext } from '@/context/ThemeContext';
import CustomText from '@/constants/CustomText';

interface Notification {
    id: string;
    content: string;
    type: string;
    created_at: string;
    is_read: boolean;
    related_id: string | null;
    related_type: string | null;
    related_name?: string;
    sender_name?: string;
}

type ListItem =
    | { type: 'header'; title: string }
    | { type: 'notification'; data: Notification };

export default function NotificationScreen() {
    const router = useRouter();
    const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
    const [earlierNotifications, setEarlierNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { colors } = useThemeContext();

    const fetchNotifications = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error('Error fetching user:', userError);
            return;
        }

        const { data, error } = await supabase
            .from('notifications')
            .select(`
                id,
                content,
                type,
                created_at,
                is_read,
                related_id,
                related_type,
                chats (id, name, chat_members (user_id, users (full_name)))
            `)
            .eq('user_id', userData.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return;
        }

        const notifications: Notification[] = await Promise.all(
            data.map(async (notification: any) => {
                let relatedName: string | undefined;
                let senderName: string | undefined;

                if (notification.type === 'new_message' && notification.related_id) {
                    const chat = notification.chats;
                    if (chat) {
                        const otherMember = chat.chat_members.find(
                            (member: any) => member.user_id !== userData.user.id
                        );
                        senderName = otherMember?.users?.full_name || 'Unknown';
                        relatedName = chat.name || 'Chat';
                    }
                } else if (notification.type === 'group_invite' && notification.related_id) {
                    relatedName = notification.chats?.name || 'Group';
                } else if (notification.type === 'task_assignment' || notification.type === 'project_update') {
                    relatedName = 'Project X';
                }

                return {
                    id: notification.id,
                    content: notification.type === 'new_message' && senderName
                        ? `You have a new message from ${senderName}`
                        : notification.content,
                    type: notification.type,
                    created_at: notification.created_at,
                    is_read: notification.is_read,
                    related_id: notification.related_id,
                    related_type: notification.related_type,
                    related_name: relatedName,
                    sender_name: senderName,
                };
            })
        );

        const newNotifs = notifications.filter((n) => !n.is_read);
        const earlierNotifs = notifications.filter((n) => n.is_read);

        setNewNotifications(newNotifs);
        setEarlierNotifications(earlierNotifs);
    };

    useEffect(() => {
        setIsLoading(true);
        fetchNotifications().then(() => setIsLoading(false));
    }, []);

    const handleNotificationPress = (notification: Notification) => {
        if (notification.related_type === 'chat' && notification.related_id) {
            if (notification.type === 'new_message') {
                router.push({
                    pathname: '/screens/chat/[id]',
                    params: { id: notification.related_id, name: notification.related_name || 'Chat' },
                });
            } else if (notification.type === 'group_invite') {
                router.push({
                    pathname: '/screens/chat/group/[id]',
                    params: { id: notification.related_id, name: notification.related_name || 'Group' },
                });
            }
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
                <CustomText fontFamily="Inter" fontSize={16} style={[styles.emptyText, { color: colors.text5 }]}>
                    Loading...
                </CustomText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <FlashList<ListItem>
                data={[
                    { type: 'header', title: 'New' } as const,
                    ...newNotifications.map((item) => ({ type: 'notification', data: item } as const)),
                    { type: 'header', title: 'Earlier' } as const,
                    ...earlierNotifications.map((item) => ({ type: 'notification', data: item } as const)),
                ]}
                keyExtractor={(item) =>
                    item.type === 'header' ? `header-${item.title}` : item.data.id
                }
                renderItem={({ item }) => {
                    if (item.type === 'header') {
                        return item.title === 'New' && newNotifications.length === 0 ? null : (
                            <CustomText
                                fontFamily="Inter"
                                fontSize={23}
                                style={[styles.sectionHeader, { color: colors.text5 }]}
                            >
                                {item.title}
                            </CustomText>
                        );
                    }
                    const notification = item.data;
                    return (
                        <NotificationItem
                            content={notification.content}
                            relatedName={notification.related_name}
                            timestamp={formatRelativeTime(notification.created_at)}
                            avatar={undefined}
                            onPress={() => handleNotificationPress(notification)}
                        />
                    );
                }}
                estimatedItemSize={70}
                ListEmptyComponent={
                    <CustomText fontFamily="Inter" fontSize={16} style={[styles.emptyText, { color: colors.text5 }]}>
                        No notifications found
                    </CustomText>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 29,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    sectionHeader: {
        paddingVertical: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 32,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
    },
    fab: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});