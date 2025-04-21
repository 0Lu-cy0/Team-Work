import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import CustomText from '@/constants/CustomText';

interface NotificationItemProps {
    content: string;
    relatedName?: string; // Name of project/task/group (if available)
    timestamp: string;
    avatar?: string; // URL of avatar (if available)
    onPress?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    content,
    relatedName,
    timestamp,
    avatar,
    onPress,
}) => {
    const { colors } = useThemeContext();
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.box2 }]}>
                    <CustomText
                        fontFamily="InterSemiBold"
                        fontSize={18}
                        style={[styles.avatarText, { color: colors.text5 }]}
                    >
                        {content.charAt(0).toUpperCase()}
                    </CustomText>
                </View>
            )}
            <View style={styles.content}>
                <View style={{ flex: 8 }}>
                    <CustomText
                        fontFamily="Inter"
                        fontSize={20}
                        style={[{ color: colors.textNoti, flexWrap: 'wrap' }]}
                        numberOfLines={2}
                    >
                        {content}
                    </CustomText>
                    {relatedName && (
                        <CustomText
                            fontFamily="Inter"
                            fontSize={20}
                            style={styles.relatedName}
                            numberOfLines={1}
                        >
                            {relatedName}
                        </CustomText>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <CustomText
                        fontFamily="Inter"
                        fontSize={12}
                        style={[styles.time, { color: colors.text5 }]}
                    >
                        {timestamp}
                    </CustomText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
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
        flexDirection: 'row'
    },
    relatedName: {
        color: '#FFC107',
        marginTop: 4,
    },
    time: {
        marginTop: 4,
        position: 'absolute',
        right: 0,
        top: 0,
    },
});