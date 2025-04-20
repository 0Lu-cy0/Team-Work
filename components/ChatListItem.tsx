import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

interface ChatListItemProps {
    id: string;
    name: string;
    avatar: string | undefined;
    lastMessage: string;
    timestamp: string;
    onPress: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
    name,
    avatar,
    lastMessage,
    timestamp,
    onPress,
}) => {
    const { colors } = useThemeContext();
    return (

        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.box2 }]}>
                    <Text style={[styles.avatarText, { color: colors.text5 }]}>{name.charAt(0).toUpperCase()}</Text>
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.name, { color: colors.text5 }]} numberOfLines={1}>{name}</Text>
                    {timestamp ? (
                        <Text style={[styles.time, { color: colors.text5, }]}>{timestamp}</Text>
                    ) : null}
                </View>
                <Text style={[styles.message, { color: colors.text5, opacity: 0.5 }]} numberOfLines={1}>
                    {lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    time: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 8,
    },
    message: {
        color: '#fff',
        fontSize: 14,
    },
});