import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Contact } from '@/types';

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
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: contact.avatar || 'https://via.placeholder.com/40' }}
                style={styles.avatar}
            />
            <View style={styles.content}>
                <Text style={styles.name}>{contact.name}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    name: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});