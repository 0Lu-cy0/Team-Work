import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Modal } from 'react-native';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import CustomText from '@/constants/CustomText';
import Icon from '@/components/Icon';

type UserRow = Database['public']['Tables']['users']['Row'];
type ProjectTeamInsert = Database['public']['Tables']['project_team']['Insert'];

interface TeamMember {
    id: string;
    full_name: string;
    avatar: string | null;
    role?: string;
}

interface AddTeamMemberModalProps {
    visible: boolean;
    onClose: () => void;
    availableUsers: UserRow[];
    teamMembers: TeamMember[];
    projectId: string;
    currentUserId: string | null;
    canEdit: boolean;
    colors: any; // Replace with specific type if available
    onMembersAdded: (newMembers: TeamMember[]) => void;
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
    visible,
    onClose,
    availableUsers,
    teamMembers = [], // Default to empty array
    projectId,
    currentUserId,
    canEdit,
    colors,
    onMembersAdded,
}) => {
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const handleToggleMemberSelection = (userId: string) => {
        if (!canEdit) return;
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAddMembers = async () => {
        if (!canEdit || selectedMembers.length === 0) return;
        try {
            const newMembers: ProjectTeamInsert[] = selectedMembers.map((userId) => ({
                project_id: projectId,
                user_id: userId,
                role: 'member',
            }));

            const { error } = await supabase
                .from('project_team')
                .insert(newMembers);

            if (error) {
                console.error('[ADD_MEMBERS_ERROR] Cannot add members:', error.message);
                throw new Error('Không thể thêm thành viên');
            }

            const newTeamMembers = availableUsers
                .filter((user) => selectedMembers.includes(user.id))
                .map((user) => ({
                    id: user.id,
                    full_name: user.full_name || 'Không rõ',
                    avatar: user.avatar,
                    role: 'member',
                }));

            onMembersAdded(newTeamMembers);
            setSelectedMembers([]);
            onClose();
        } catch (error: any) {
            console.error('[ADD_MEMBERS_FAILED]', error.message);
            alert('Không thể thêm thành viên. Vui lòng thử lại.');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                <View style={{ backgroundColor: colors.backgroundColor, padding: 20, borderRadius: 10 }}>
                    <CustomText fontFamily='InterSemiBold' fontSize={18} style={{ marginBottom: 10, textAlign: 'center', color: colors.text7 }}>
                        Add Team Members
                    </CustomText>
                    <FlatList
                        data={availableUsers.filter(
                            (user) => user.id !== currentUserId && !teamMembers.find((member) => member.id === user.id)
                        )}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleToggleMemberSelection(item.id)}
                                style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
                                disabled={!canEdit}
                            >
                                <View style={{
                                    width: 24,
                                    height: 24,
                                    borderWidth: 2,
                                    borderColor: colors.text5,
                                    backgroundColor: selectedMembers.includes(item.id) ? colors.box1 : 'transparent',
                                    marginRight: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    {selectedMembers.includes(item.id) && (
                                        <Icon category="screens" name="check" style={{ width: 16, height: 16, tintColor: colors.text4 }} />
                                    )}
                                </View>
                                {item.avatar ? (
                                    <Image source={{ uri: item.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                                ) : (
                                    <Icon category="avatar" style={{ width: 32, height: 32, borderRadius: 16 }} />
                                )}
                                <CustomText fontSize={16} style={{ marginLeft: 10, color: colors.text5 }}>{item.full_name || 'Không rõ'}</CustomText>
                            </TouchableOpacity>
                        )}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedMembers([]);
                                onClose();
                            }}
                            style={{
                                padding: 10,
                                alignItems: 'center',
                                backgroundColor: colors.box2,
                                flex: 1,
                                marginRight: 5,
                                borderRadius: 5,
                            }}
                        >
                            <CustomText style={{ color: colors.text5, fontSize: 16 }}>Cancel</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleAddMembers}
                            style={{
                                padding: 10,
                                alignItems: 'center',
                                backgroundColor: selectedMembers.length > 0 ? colors.box1 : colors.box2,
                                flex: 1,
                                marginLeft: 5,
                                borderRadius: 5,
                                opacity: selectedMembers.length > 0 ? 1 : 0.6,
                            }}
                            disabled={selectedMembers.length === 0}
                        >
                            <CustomText style={{ color: colors.text4, fontSize: 16 }}>Add Selected</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AddTeamMemberModal;