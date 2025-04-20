import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ContactItem } from '@/components/ContactItem';
import { Ionicons } from '@expo/vector-icons';

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
    const [isSearchVisible, setIsSearchVisible] = useState(false); // Trạng thái hiển thị thanh tìm kiếm
    const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm

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
            avatar: user.avatar ?? '',
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
            setSearchQuery(''); // Xóa từ khóa tìm kiếm
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
            <SafeAreaView style={styles.container}>
                <Text style={styles.emptyText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Group</Text>
                <TouchableOpacity onPress={toggleSearch}>
                    <Ionicons
                        name={isSearchVisible ? 'close' : 'search'}
                        size={24}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </View>
            {isSearchVisible && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#A0AEC0"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            )}
            <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
                <View style={styles.createGroupIcon}>
                    <Text style={styles.createGroupIconText}>g</Text>
                </View>
                <Text style={styles.createGroupText}>Create a group</Text>
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
                                    <Text style={styles.sectionLetter}>{item.letter}</Text>
                                )}
                            </View>
                        ))}
                    </>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No contacts found</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2A44',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2A3A5A',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    searchContainer: {
        padding: 16,
    },
    searchInput: {
        backgroundColor: '#2A3A5A',
        color: '#FFFFFF',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    createGroupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFC107',
        margin: 16,
        padding: 12,
        borderRadius: 8,
    },
    createGroupIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E2A44',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    createGroupIconText: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    createGroupText: {
        fontSize: 16,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFC107',
    },
    emptyText: {
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
    },
});