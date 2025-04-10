import React from 'react';
import { Modal, View, FlatList, Image, TouchableOpacity } from 'react-native';
import CustomText from '@/constants/CustomText';
import { StyleSheet } from 'react-native';
import Icon from '@/components/Icon';

interface Member {
    user_id: string;
    avatar: string | null;
    name: string;
    role?: string;
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
                                {/* Hiển thị avatar nếu có, nếu không thì dùng Icon mặc định */}
                                {item.avatar ? (
                                    <Image
                                        source={{ uri: item.avatar }}
                                        style={styles.memberAvatar}
                                    />
                                ) : (
                                    <Icon
                                        category="avatar"
                                        style={{ width: 32, height: 32 }}
                                    />
                                )}
                                <View style={styles.memberInfo}>
                                    <CustomText style={styles.memberName}>{item.name}</CustomText>
                                    <CustomText style={styles.memberPermission}>
                                        {item.role || 'Member'}
                                    </CustomText>
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
        width: 32, // Đảm bảo kích thước đồng nhất với Icon
        height: 32,
        borderRadius: 16, // Làm tròn avatar
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