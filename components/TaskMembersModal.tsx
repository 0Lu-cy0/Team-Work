import React, { useState, useEffect } from 'react';
import { Modal, View, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import CustomText from '@/constants/CustomText';
import MyButton from '@/components/MyButton';

interface TaskMembersModalProps {
    visible: boolean;
    onClose: () => void;
    members: Member[];
    selectedMembers: string[];
    onSave: (selectedMemberIds: string[]) => void;
    onCancel?: () => void; // THÊM: Prop để xử lý cancel
    projectId?: string;
    taskId?: string;
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
    onCancel,
    projectId,
    taskId,
}) => {
    const [selected, setSelected] = useState<string[]>(selectedMembers);

    // Đồng bộ selected với selectedMembers khi prop thay đổi
    useEffect(() => {
        console.log('TaskMembersModal: taskId', taskId, 'selectedMembers', selectedMembers);
        setSelected(selectedMembers);
    }, [selectedMembers, taskId]);

    const toggleMember = (userId: string) => {
        setSelected((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = () => {
        console.log('Saving members for task', taskId, 'selected', selected);
        onSave(selected);
        onClose();
    };

    const handleCancel = () => {
        console.log('Canceling members for task', taskId, 'resetting to', selectedMembers);
        setSelected(selectedMembers); // Reset về selectedMembers ban đầu
        onCancel?.(); // Gọi onCancel để thông báo cho parent
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
            ]}>
                {selected.includes(item.user_id) && (
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/checkmark.png' }}
                        style={styles.checkmark}
                    />
                )}
            </View>
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
                            onPress={handleCancel} // SỬA: Sử dụng handleCancel
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#FED36A',
    },
    checkmark: {
        width: 16,
        height: 16,
        tintColor: '#000000',
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