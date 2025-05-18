import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Modal } from 'react-native';
import CustomText from '@/constants/CustomText';
import Icon from '@/components/Icon';

interface TeamMember {
    id: string;
    full_name: string;
    avatar: string | null;
}

interface AvailableUser {
    id: string;
    full_name: string;
    avatar: string | null;
}

interface AddTeamMemberModalSimpleProps {
    visible: boolean;
    onClose: () => void;
    availableUsers: AvailableUser[];
    selectedMembers: TeamMember[];
    onMembersSelected: (members: TeamMember[]) => void;
    colors: any; // Replace with specific type if available
}

const AddTeamMemberModalSimple: React.FC<AddTeamMemberModalSimpleProps> = ({
    visible,
    onClose,
    availableUsers,
    selectedMembers = [],
    onMembersSelected,
    colors,
}) => {
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
        selectedMembers.map((member) => member.id)
    );

    // Reset selectedMemberIds khi modal mở và cập nhật từ selectedMembers
    useEffect(() => {
        if (visible) {
            setSelectedMemberIds(selectedMembers.map((member) => member.id));
        }
    }, [visible, selectedMembers]);

    const handleToggleMemberSelection = (userId: string) => {
        setSelectedMemberIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAddMembers = () => {
        // Lọc các thành viên mới được chọn, loại bỏ các thành viên đã có trong selectedMembers
        const newMembers = availableUsers
            .filter((user) => selectedMemberIds.includes(user.id))
            .map((user) => ({
                id: user.id,
                full_name: user.full_name || 'Không rõ',
                avatar: user.avatar,
            }));

        // Gộp danh sách mới với danh sách cũ, loại bỏ trùng lặp dựa trên id
        const updatedMembers = [
            ...selectedMembers,
            ...newMembers.filter(
                (newMember) =>
                    !selectedMembers.some((member) => member.id === newMember.id)
            ),
        ];

        onMembersSelected(updatedMembers);
        setSelectedMemberIds(updatedMembers.map((member) => member.id));
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                <View style={{ backgroundColor: colors.backgroundColor, padding: 20, borderRadius: 10 }}>
                    <CustomText
                        fontFamily="InterSemiBold"
                        fontSize={18}
                        style={{ marginBottom: 10, textAlign: 'center', color: colors.text7 }}
                    >
                        Add Team Members
                    </CustomText>
                    <FlatList
                        data={availableUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            const isSelected = selectedMemberIds.includes(item.id);
                            return (
                                <TouchableOpacity
                                    onPress={() => handleToggleMemberSelection(item.id)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 10,
                                        opacity: isSelected ? 0.6 : 1, // Làm mờ nếu đã chọn
                                    }}
                                    disabled={isSelected} // Vô hiệu hóa nếu đã chọn
                                >
                                    <Icon
                                        category="icon_sign_up_in"
                                        name={isSelected ? 'checked' : 'unChecked'}
                                        style={{ width: 24, height: 24, marginRight: 10, tintColor: colors.text5 }}
                                    />
                                    {item.avatar ? (
                                        <Image
                                            source={{ uri: item.avatar }}
                                            style={{ width: 32, height: 32, borderRadius: 16 }}
                                        />
                                    ) : (
                                        <Icon
                                            category="avatar"
                                            style={{ width: 32, height: 32, borderRadius: 16 }}
                                        />
                                    )}
                                    <CustomText
                                        fontSize={16}
                                        style={{ marginLeft: 10, color: colors.text5 }}
                                    >
                                        {item.full_name || 'Không rõ'}
                                    </CustomText>
                                    {isSelected && (
                                        <CustomText
                                            fontSize={12}
                                            style={{ marginLeft: 10, color: colors.text4 }}
                                        >
                                            (Đã thêm)
                                        </CustomText>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedMemberIds(selectedMembers.map((member) => member.id));
                                onClose();
                            }}
                            style={{
                                padding: 10,
                                alignItems: 'center',
                                backgroundColor: colors.box2,
                                flex: 1,
                                marginRight: 5,
                            }}
                        >
                            <CustomText style={{ color: colors.text5, fontSize: 16 }}>Cancel</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleAddMembers}
                            style={{
                                padding: 10,
                                alignItems: 'center',
                                backgroundColor: selectedMemberIds.length > 0 ? colors.box1 : colors.box2,
                                flex: 1,
                                marginLeft: 5,
                                opacity: selectedMemberIds.length <= selectedMembers.length ? 0.6 : 1,
                            }}
                            disabled={selectedMemberIds.length <= selectedMembers.length}
                        >
                            <CustomText style={{ color: colors.text5, fontSize: 16 }}>Add Selected</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AddTeamMemberModalSimple;