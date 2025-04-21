import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ChatListItem } from '@/components/ChatListItem';
import { isToday, formatTime, formatDate } from '@/utils/dateUtils';
import styles from '@/styles/messages';
import { useThemeContext } from '@/context/ThemeContext';
import MyInputField from '@/components/MyInputField';
import CustomText from '@/constants/CustomText';

interface ChatItem {
    id: string;
    name: string;
    avatar: string | null;
    lastMessage: string | null;
    timestamp: string | null;
}

interface GroupItem {
    id: string;
    name: string | null;
    lastMessage: string | null;
    timestamp: string | null;
}

export default function MessageScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'chat' | 'groups'>('chat');
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { colors } = useThemeContext();

    // Lấy danh sách chat cá nhân
    const fetchChats = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error('Error fetching user:', userError);
            return;
        }
        console.log('Current user:', userData.user);

        const { data, error } = await supabase
            .from('chats')
            .select(`
                id,
                name,
                type,
                messages (content, sent_at, sender_id, users (full_name)),
                chat_members (user_id, users (full_name, avatar))
            `)
            .eq('type', 'private');

        if (error) {
            console.error('Error fetching chats:', error);
            return;
        }
        console.log('Raw chats data from Supabase:', JSON.stringify(data, null, 2));

        const chatItems: ChatItem[] = data
            .filter((chat: any) =>
                chat.chat_members.some((member: any) => member.user_id === userData.user.id)
            )
            .map((chat: any) => {
                const otherMember = chat.chat_members.find(
                    (member: any) => member.user_id !== userData.user.id
                );
                const sortedMessages = chat.messages.sort(
                    (a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
                );
                const lastMessage = sortedMessages[0]?.content || null;
                const timestamp = sortedMessages[0]?.sent_at || null;

                return {
                    id: chat.id,
                    name: otherMember?.users?.full_name || 'Unknown',
                    avatar: otherMember?.users?.avatar || null,
                    lastMessage,
                    timestamp,
                };
            })
            .sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

        console.log('Processed chat items:', chatItems);
        setChats(chatItems);
    };

    // Lấy danh sách nhóm
    const fetchGroups = async () => {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            console.error('Error fetching user:', userError);
            return;
        }

        const { data, error } = await supabase
            .from('chats')
            .select(`
                id,
                name,
                type,
                messages (content, sent_at),
                chat_members (user_id)
            `)
            .eq('type', 'group');

        if (error) {
            console.error('Error fetching groups:', error);
            return;
        }
        console.log('Raw groups data from Supabase:', JSON.stringify(data, null, 2));

        const groupItems: GroupItem[] = data
            .filter((group: any) =>
                group.chat_members.some((member: any) => member.user_id === userData.user.id)
            )
            .map((group: any) => {
                const sortedMessages = group.messages.sort(
                    (a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
                );
                const lastMessage = sortedMessages[0]?.content || null;
                const timestamp = sortedMessages[0]?.sent_at || null;

                return {
                    id: group.id,
                    name: group.name || 'Unnamed Group',
                    lastMessage,
                    timestamp,
                };
            })
            .sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

        console.log('Processed group items:', groupItems);
        setGroups(groupItems);
    };

    useEffect(() => {
        const fetchData = async () => {
            console.log('Starting to fetch data...');
            setIsLoading(true);
            await Promise.all([fetchChats(), fetchGroups()]);
            setIsLoading(false);
            console.log('Finished fetching data.');
        };
        fetchData();
    }, []);

    // Format thời gian
    const formatTimestamp = (timestamp: string | null) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';

        if (isToday(timestamp)) {
            return formatTime(timestamp); // Hiển thị "6:53 AM" nếu là hôm nay
        }

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return formatDate(timestamp); // "19 Apr"
    };

    // Lọc dữ liệu theo tìm kiếm
    const filteredChats = searchQuery
        ? chats.filter((chat) =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : chats;

    const filteredGroups = searchQuery
        ? groups.filter((group) =>
            group.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : groups;

    console.log('Filtered chats to display:', filteredChats);
    console.log('Filtered groups to display:', filteredGroups);

    const handleChatPress = (chatId: string, name: string, avatar: string | null) => {
        console.log(`Navigating to chat with ID: ${chatId}, Name: ${name}, Avatar: ${avatar}`);
        router.push({
            pathname: '/screens/chat/[id]',
            params: { id: chatId, name, avatar: avatar || '' },
        });
    };

    const handleGroupPress = (groupId: string, name: string | null) => {
        console.log(`Navigating to group with ID: ${groupId}, Name: ${name}`);
        router.push({
            pathname: '/screens/chat/group/[id]',
            params: { id: groupId, name: name || 'Group' },
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
                <Text style={[styles.emptyText, { color: colors.text5 }]}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <View style={styles.searchContainer}>
                <MyInputField
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder='Search'
                />
            </View>
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[[styles.tabChat, { backgroundColor: colors.box3 }], activeTab === 'chat' && [{ backgroundColor: colors.box1 }]]}
                    onPress={() => setActiveTab('chat')}
                >
                    <Text
                        style={[[styles.tabText, { color: colors.text5 }], activeTab === 'chat' && { color: colors.text4 }]}
                    >
                        Chat
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabGroup, { backgroundColor: colors.box3 }, activeTab === 'groups' && [{ backgroundColor: colors.box1 }]]}
                    onPress={() => setActiveTab('groups')}
                >
                    <Text
                        style={[[styles.tabText, { color: colors.text5 }], activeTab === 'groups' && { color: colors.text4 }]}
                    >
                        Groups
                    </Text>
                </TouchableOpacity>
            </View>
            {activeTab === 'chat' ? (
                <FlashList
                    data={filteredChats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        console.log('Rendering chat item:', item);
                        return (
                            <ChatListItem
                                id={item.id}
                                name={item.name}
                                avatar={item.avatar || undefined}
                                lastMessage={item.lastMessage || 'No messages'}
                                timestamp={formatTimestamp(item.timestamp)}
                                onPress={() => handleChatPress(item.id, item.name, item.avatar)}
                            />
                        );
                    }}
                    estimatedItemSize={70}
                    ListEmptyComponent={<Text style={styles.emptyText}>No chats found</Text>}
                    ListFooterComponent={() => (
                        <View style={styles.startChatContainer}>
                            <TouchableOpacity
                                style={[styles.startChatButton, { backgroundColor: colors.box1 }]}
                                onPress={() => router.push('/screens/chat/newMessage')}
                            >
                                <CustomText fontFamily='InterMedium' fontSize={16} style={{ color: colors.text4 }}> Start Chat</CustomText>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            ) : (
                <FlashList
                    data={filteredGroups}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        console.log('Rendering group item:', item);
                        return (
                            <ChatListItem
                                id={item.id}
                                name={item.name || 'Group'}
                                avatar={undefined}
                                lastMessage={item.lastMessage || 'No messages'}
                                timestamp={formatTimestamp(item.timestamp)}
                                onPress={() => handleGroupPress(item.id, item.name)}
                            />
                        );
                    }}
                    estimatedItemSize={70}
                    ListEmptyComponent={<Text style={styles.emptyText}>No groups found</Text>}
                />
            )}
        </SafeAreaView>
    );
}

