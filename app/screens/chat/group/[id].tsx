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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { ChatMessage } from '@/components/ChatMessage';
import { Ionicons } from '@expo/vector-icons';

interface MessageItem {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  image: string | null;
}

export default function GroupChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error('Error fetching user:', userError);
        setIsLoading(false);
        return;
      }
      setUserId(userData.user.id);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sent_at,
          sender_id,
          attachment,
          users (full_name, avatar)
        `)
        .eq('chat_id', id)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        setIsLoading(false);
        return;
      }

      const messageItems: MessageItem[] = data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        timestamp: new Date(msg.sent_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        senderId: msg.sender_id,
        senderName: msg.users.full_name || 'Unknown',
        senderAvatar: msg.users.avatar,
        image: msg.attachment,
      }));

      setMessages(messageItems);
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    const { error } = await supabase.from('messages').insert({
      chat_id: id,
      sender_id: userId,
      content: newMessage,
      sent_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setMessages([
      {
        id: Date.now().toString(),
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        senderId: userId,
        senderName: 'You',
        senderAvatar: null,
        image: null,
      },
      ...messages,
    ]);
    setNewMessage('');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Please log in to view group chat</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{name}</Text>
          <Text style={styles.statusText}>Online</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="videocam" size={24} color="#FFFFFF" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="call" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <FlashList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            isCurrentUser={item.senderId === userId}
            content={item.content}
            timestamp={item.timestamp}
            senderName={item.senderName}
            senderAvatar={item.senderAvatar}
            image={item.image}
          />
        )}
        contentContainerStyle={styles.messagesList}
        inverted
        estimatedItemSize={100}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet</Text>}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="#FFFFFF" style={styles.inputIcon} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#A0AEC0"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <Ionicons name="send" size={24} color="#FFC107" style={styles.inputIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="mic" size={24} color="#FFFFFF" style={styles.inputIcon} />
        </TouchableOpacity>
      </View>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 16,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyText: {
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A3A5A',
  },
  input: {
    flex: 1,
    backgroundColor: '#2A3A5A',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  inputIcon: {
    marginHorizontal: 4,
  },
});