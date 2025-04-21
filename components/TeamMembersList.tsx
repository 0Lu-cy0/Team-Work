import React from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import CustomText from '@/constants/CustomText';
import Icon from '@/components/Icon';

interface TeamMember {
    id: string;
    full_name: string;
    avatar: string | null;
    role?: string;
}

interface TeamMembersListProps {
    teamMembers: TeamMember[];
    canEdit: boolean;
    colors: any; // Thay bằng type cụ thể nếu có
    onRemoveMember: (memberId: string) => void;
    onOpenAddMemberModal: () => void;
    avatarSize?: number; // Kích thước avatar (mặc định 20)
    addButtonColor?: string; // Màu nút thêm thành viên (mặc định từ colors.box1)
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
    teamMembers,
    canEdit,
    colors,
    onRemoveMember,
    onOpenAddMemberModal,
    avatarSize = 20,
    addButtonColor,
}) => {
    const styles = StyleSheet.create({
        box1: {
            flex: 7,
            flexDirection: 'row',
            alignItems: 'center',
        },
        temMember: {
            flexGrow: 0,
        },
        addTeamMember: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 10,
            backgroundColor: addButtonColor || colors.box1,
        },
        memberContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 10,
            backgroundColor: colors.box2,
            paddingHorizontal: 10,
            paddingVertical: 10,
        },
        avatar: {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
        },
        memberName: {
            color: colors.text5,
            marginLeft: 5,
            fontSize: 14,
        },
        deleteButton: {
            marginLeft: 5,
        },
    });

    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={styles.box1}>
                <FlatList
                    style={styles.temMember}
                    data={teamMembers}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.memberContainer}>
                            {item.avatar ? (
                                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                            ) : (
                                <Icon category="avatar" style={styles.avatar} />
                            )}
                            <CustomText style={styles.memberName}>{item.full_name}</CustomText>
                            {canEdit && (
                                <TouchableOpacity
                                    onPress={() => onRemoveMember(item.id)}
                                    style={styles.deleteButton}
                                >
                                    <Icon
                                        category="screens"
                                        name="delete"
                                        style={{ marginLeft: 10, width: 20, height: 20 }}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            </View>
            {canEdit && (
                <TouchableOpacity onPress={onOpenAddMemberModal} style={styles.addTeamMember}>
                    <Icon category="screens" name="add" style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default TeamMembersList;