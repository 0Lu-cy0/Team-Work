import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Contact } from '@/types';
import CustomText from '@/constants/CustomText';
import { useThemeContext } from '@/context/ThemeContext';

interface ContactItemProps {
    contact: Contact;
    onPress?: () => void;
    isSelected?: boolean;
}

export const ContactItem: React.FC<ContactItemProps> = ({
    contact,
    onPress,
    isSelected = false,
}) => {
    const { colors } = useThemeContext();

    // Lấy chữ cái đầu tiên của tên
    const firstLetter = contact.name.charAt(0).toUpperCase();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {contact.avatar ? (
                <Image
                    source={{ uri: contact.avatar }}
                    style={styles.avatar}
                    onError={() => console.log(`Failed to load avatar for ${contact.name}`)}
                />
            ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.box2 }]}>
                    <CustomText
                        fontFamily="InterSemiBold"
                        fontSize={18}
                        style={{ color: colors.text5 }}
                    >
                        {firstLetter}
                    </CustomText>
                </View>
            )}
            <View style={styles.content}>
                <CustomText fontFamily="Inter" fontSize={16} style={{ color: colors.text5 }}>
                    {contact.name}
                </CustomText>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
});