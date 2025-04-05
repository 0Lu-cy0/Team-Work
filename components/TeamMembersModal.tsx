import React from 'react';
import { Modal, View, FlatList, Image, TouchableOpacity } from 'react-native';
import CustomText from '@/constants/CustomText';
import { StyleSheet } from 'react-native';

interface Member {
    user_id: string;
    avatar: string | null;
    name: string;
    role?: string; // Thay permission thành role
}

interface TeamMembersModalProps {
    visible: boolean;
    onClose: () => void;
    members: Member[];
}

const TeamMembersModal: React.FC<TeamMembersModalProps> = ({ visible, onClose, members }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <CustomText style={styles.headerText}>Project Team</CustomText>
                    </View>
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.user_id}
                        renderItem={({ item }) => (
                            <View style={styles.memberRow}>
                                <Image
                                    source={
                                        item.avatar
                                            ? { uri: item.avatar }
                                            : require('@/assets/images/Avatar/Ellipse 36.png')
                                    }
                                    style={styles.memberAvatar}
                                />
                                <View style={styles.memberInfo}>
                                    <CustomText style={styles.memberName}>{item.name}</CustomText>
                                    <CustomText style={styles.memberPermission}>{item.role || 'Member'}</CustomText>
                                </View>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: '#212832',
        borderRadius: 10,
        paddingVertical: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#455A64',
    },
    headerText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontFamily: 'InterMedium',
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'InterMedium',
    },
    memberPermission: {
        fontSize: 14,
        color: '#8CAAB9',
        fontFamily: 'InterReguler',
    },
});

export default TeamMembersModal;