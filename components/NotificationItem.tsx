import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface NotificationItemProps {
    content: string;
    relatedName?: string; // Tên của project/task/group (nếu có)
    timestamp: string;
    avatar?: string; // URL của avatar (nếu có)
    onPress?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    content,
    relatedName,
    timestamp,
    avatar,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {content.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.message} numberOfLines={1}>
                    {content}
                </Text>
                {relatedName && (
                    <Text style={styles.relatedName} numberOfLines={1}>
                        {relatedName}
                    </Text>
                )}
                <Text style={styles.time}>{timestamp}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#2A3A5A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    relatedName: {
        color: '#FFC107',
        fontSize: 12,
        marginTop: 4,
    },
    time: {
        color: '#A0AEC0',
        fontSize: 12,
        marginTop: 4,
        position: 'absolute',
        right: 0,
        top: 0,
    },
});