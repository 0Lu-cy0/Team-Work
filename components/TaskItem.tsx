import React from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import CustomText from '@/constants/CustomText';

interface TaskItemProps {
    title: string;
    startTime: string;
    endTime: string;
    members: { id: string; avatar?: string | null }[];
    isCompleted: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
    title,
    startTime,
    endTime,
    members,
    isCompleted,
}) => {
    const { colors } = useThemeContext();

    // Hàm định dạng thời gian
    const formatTime = (isoString: string): string => {
        const date = new Date(isoString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <View style={[[styles.container, { backgroundColor: colors.box3, borderLeftWidth: 10, borderLeftColor: colors.box1 }], isCompleted && { backgroundColor: colors.box1 }]}>
            <View style={{ flex: 1.5 }}></View>
            <View style={styles.content}>
                <CustomText
                    fontFamily="Inter"
                    fontSize={22}
                    style={{ color: isCompleted ? colors.text4 : colors.text5 }}
                >
                    {title}
                </CustomText>
                <CustomText
                    fontFamily="Inter"
                    fontSize={12}
                    style={{ color: isCompleted ? colors.text4 : colors.text5, opacity: 0.5 }}
                >
                    {`${formatTime(startTime)} - ${formatTime(endTime)}`}
                </CustomText>
            </View>
            <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center', marginTop: 13 }}>
                <FlatList
                    data={members}
                    keyExtractor={(item) => item.id}
                    horizontal
                    renderItem={({ item }) => (
                        item.avatar ? (
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.box2 }]}>
                                <CustomText
                                    fontFamily="InterSemiBold"
                                    fontSize={14}
                                    style={{ color: colors.text5 }}
                                >
                                    {item.id.charAt(0).toUpperCase()}
                                </CustomText>
                            </View>
                        )
                    )}
                    style={styles.avatarList}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        marginBottom: 8,
        alignItems: 'center',
    },
    content: {
        flex: 11,
    },
    avatarList: {},
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1E2A44',
    },
    avatarPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1E2A44',
        justifyContent: 'center',
        alignItems: 'center',
    },
});