import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ChatMessageProps {
    isCurrentUser: boolean;
    content: string;
    timestamp: string;
    senderName: string;
    senderAvatar?: string | null;
    image?: string | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    isCurrentUser,
    content,
    senderName,
    image,
}) => {
    return (
        <View
            style={[
                styles.container,
                isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
            ]}
        >
            <View
                style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
                ]}
            >
                <Text style={styles.messageText}>{content}</Text>

                {image && (
                    <Image
                        source={{ uri: image }}
                        style={styles.messageImage}
                        resizeMode="contain"
                    />
                )}
            </View>
            {isCurrentUser && <Text style={styles.seenText}>Seen</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 8,
        marginHorizontal: 16,
        maxWidth: '80%',
    },
    currentUserContainer: {
        alignSelf: 'flex-end',
    },
    otherUserContainer: {
        alignSelf: 'flex-start',
    },
    messageContainer: {
        padding: 12,
        borderRadius: 16,
    },
    currentUserMessage: {
        backgroundColor: '#FFC107',
        borderBottomRightRadius: 4,
    },
    otherUserMessage: {
        backgroundColor: '#2A3A5A',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: '#FFFFFF', // Đặt màu chữ thành trắng cho cả hai loại tin nhắn
    },
    messageImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginTop: 8,
    },
    seenText: {
        fontSize: 12,
        color: '#A0AEC0',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
});