import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ContactItem } from '@/components/ContactItem';
import { useThemeContext } from '@/context/ThemeContext';
import Head from '@/components/Head';
import CustomText from '@/constants/CustomText';
import MyInputField from '@/components/MyInputField';
import Icon from '@/components/Icon';

interface Contact {
    id: string;
    name: string;
    avatar: string;
    letter: string;
}

export default function NewChatScreen() {
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { colors } = useThemeContext();

    // Lấy danh sách người dùng từ bảng users
    const fetchContacts = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, avatar')
            .order('full_name');

        if (error) {
            console.error('Error fetching contacts:', error);
            return;
        }

        const contactItems: Contact[] = data.map((user) => ({
            id: user.id,
            name: user.full_name,
            avatar: user.avatar ?? '', // Đảm bảo avatar là chuỗi, có thể rỗng
            letter: user.full_name.charAt(0).toUpperCase(),
        }));

        setContacts(contactItems);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Xử lý chọn người dùng
    const toggleUserSelection = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    // Tạo nhóm
    const handleCreateGroup = async () => {
        if (selectedUsers.length < 2) {
            alert('Please select at least 2 users to create a group.');
            return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) return;

        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .insert([{ type: 'group', name: 'New Group' }])
            .select()
            .single();

        if (chatError || !chatData) {
            console.error('Error creating group:', chatError);
            return;
        }

        const members = [
            { chat_id: chatData.id, user_id: userData.user.id },
            ...selectedUsers.map((userId) => ({ chat_id: chatData.id, user_id: userId })),
        ];

        const { error: memberError } = await supabase
            .from('chat_members')
            .insert(members);

        if (memberError) {
            console.error('Error adding members:', memberError);
            return;
        }

        router.push({
            pathname: '/screens/chat/group/[id]',
            params: { id: chatData.id, name: 'New Group' },
        });
    };

    // Xử lý hiển thị/ẩn thanh tìm kiếm
    const toggleSearch = () => {
        if (isSearchVisible) {
            setSearchQuery('');
        }
        setIsSearchVisible(!isSearchVisible);
    };

    // Lọc danh sách liên hệ dựa trên từ khóa tìm kiếm
    const filteredContacts = searchQuery
        ? contacts.filter((contact) =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : contacts;

    // Nhóm liên hệ theo chữ cái đầu
    const groupedContacts: Record<string, Contact[]> = {};
    filteredContacts.forEach((contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });

    const sections = Object.entries(groupedContacts).map(([letter, items]) => ({
        letter,
        data: items,
    }));

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
                <CustomText fontFamily="Inter" fontSize={16} style={[styles.emptyText, { color: colors.text5 }]}>
                    Loading...
                </CustomText>
            </SafeAreaView>
        );
    }

    const handleGoBack = () => {
        try {
            router.back();
        } catch (error) {
            logger.error('Error in handleGoBack', error);
        }
    };

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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <Head
                leftIcon={{ category: 'topTab', name: 'back' }}
                rightIcon={{
                    category: isSearchVisible ? 'screens' : 'topTab',
                    name: isSearchVisible ? 'close' : 'search',
                }}
                onLeftPress={() => router.back()}
                onRightPress={toggleSearch}
                showRightIcon={true}
            >
                <CustomText fontFamily="Inter" fontSize={25} style={{ color: colors.text7 }}>
                    New Chat
                </CustomText>
            </Head>
            {isSearchVisible && (
                <View>
                    <MyInputField
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search"
                        rightIcon={<Icon category="screens" name="delete" />}
                        onRightIconPress={toggleSearch}
                    />
                </View>
            )}
            <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
                <View style={[styles.createGroupIcon, { backgroundColor: colors.box1 }]}>
                    <Icon category='screens' name='teamMember' style={{ width: 24, height: 24 }} />
                </View>
                <CustomText fontFamily="Inter" fontSize={16} style={styles.createGroupText}>
                    Create a group
                </CustomText>
            </TouchableOpacity>
            <FlatList
                data={sections}
                keyExtractor={(item) => item.letter}
                renderItem={({ item }) => (
                    <>
                        {item.data.map((contact, index) => (
                            <View key={contact.id} style={styles.contactContainer}>
                                <ContactItem
                                    contact={contact}
                                    onPress={() => toggleUserSelection(contact.id)}
                                />
                                {index === 0 && (
                                    <CustomText
                                        fontFamily="InterSemiBold"
                                        fontSize={24}
                                        style={[styles.sectionLetter, { color: colors.text8 }]}
                                    >
                                        {item.letter}
                                    </CustomText>
                                )}
                            </View>
                        ))}
                    </>
                )}
                ListEmptyComponent={
                    <CustomText fontFamily="Inter" fontSize={16} style={styles.emptyText}>
                        No contacts found
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
    createGroupButton: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    createGroupIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    createGroupText: {
        color: '#1E2A44',
        fontWeight: '600',
    },
    contactContainer: {
        position: 'relative',
    },
    sectionLetter: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 32,
    },
});