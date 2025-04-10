// TaskMembersModal giữ nguyên như trước, chỉ cần đảm bảo import đúng
import React, { useState } from 'react';
import { Modal, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import CustomText from '@/constants/CustomText';
import MyButton from '@/components/MyButton';

interface TaskMembersModalProps {
    visible: boolean;
    onClose: () => void;
    members: Member[];
    selectedMembers: string[];
    onSave: (selectedMemberIds: string[]) => void;
}

interface Member {
    user_id: string;
    avatar: string | null;
    name: string;
    role?: string;
}

const TaskMembersModal: React.FC<TaskMembersModalProps> = ({
    visible,
    onClose,
    members,
    selectedMembers,
    onSave,
}) => {
    const [selected, setSelected] = useState<string[]>(selectedMembers);

    const toggleMember = (userId: string) => {
        setSelected((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = () => {
        onSave(selected);
        onClose();
    };

    const renderItem = ({ item }: { item: Member }) => (
        <TouchableOpacity
            onPress={() => toggleMember(item.user_id)}
            style={styles.memberItem}
        >
            <CustomText style={styles.memberName}>{item.name}</CustomText>
            <View style={[
                styles.checkbox,
                selected.includes(item.user_id) && styles.checkboxSelected
            ]} />
        </TouchableOpacity>
    );

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <CustomText fontFamily="InterSemiBold" fontSize={18} style={styles.title}>
                        Task Members
                    </CustomText>
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.user_id}
                        renderItem={renderItem}
                        style={styles.memberList}
                    />
                    <View style={styles.buttonContainer}>
                        <MyButton
                            onPress={onClose}
                            title={<CustomText fontSize={16}>Cancel</CustomText>}
                            style={styles.cancelButton}
                        />
                        <MyButton
                            onPress={handleSave}
                            title={<CustomText fontSize={16}>Save</CustomText>}
                            style={styles.saveButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        maxHeight: '70%',
        backgroundColor: '#263238',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        marginBottom: 15,
    },
    memberList: {
        width: '100%',
    },
    memberItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#455A64',
    },
    memberName: {
        color: '#fff',
        fontSize: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#FED36A',
        borderRadius: 4,
    },
    checkboxSelected: {
        backgroundColor: '#FED36A',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    cancelButton: {
        width: '45%',
        backgroundColor: '#455A64',
    },
    saveButton: {
        width: '45%',
        backgroundColor: '#FED36A',
    },
});

export default TaskMembersModal;