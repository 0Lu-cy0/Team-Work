import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';

interface TaskItemProps {
    title: string;
    startTime: string;
    endTime: string;
    members: { id: string; avatar?: string | null }[];
    isCompleted: boolean; // Thêm prop isCompleted
}

export const TaskItem: React.FC<TaskItemProps> = ({
    title,
    startTime,
    endTime,
    members,
    isCompleted,
}) => {
    return (
        <View style={[styles.container, isCompleted && styles.completedContainer]}>
            <View style={[styles.leftBorder, isCompleted && styles.hiddenBorder]} />
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.time}>{`${startTime} - ${endTime}`}</Text>
            </View>
            <FlatList
                data={members}
                keyExtractor={(item) => item.id}
                horizontal
                renderItem={({ item }) => (
                    item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {item.id.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )
                )}
                style={styles.avatarList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#2A3A5A',
        marginBottom: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    completedContainer: {
        backgroundColor: '#FFC107', // Background màu vàng nếu task hoàn thành
    },
    leftBorder: {
        width: 4,
        height: '100%',
        backgroundColor: '#FFC107',
        borderRadius: 2,
        marginRight: 12,
    },
    hiddenBorder: {
        backgroundColor: 'transparent', // Ẩn cột nhỏ màu vàng nếu task hoàn thành
    },
    content: {
        flex: 1,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    time: {
        color: '#A0AEC0',
        fontSize: 12,
        marginTop: 4,
    },
    avatarList: {
        marginLeft: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginLeft: -8,
        borderWidth: 2,
        borderColor: '#1E2A44',
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginLeft: -8,
        borderWidth: 2,
        borderColor: '#1E2A44',
        backgroundColor: '#2A3A5A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});