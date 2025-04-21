import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import Icon, { IconCategory } from './Icon';
import { useThemeContext } from '@/context/ThemeContext';
import CustomText from '@/constants/CustomText';

interface ProfileFieldProps {
    iconCategory: IconCategory;
    iconName?: string;
    iconRightName?: string;
    label: string;
    value: string;
    isPassword?: boolean;
    onUpdate?: (value: string) => void;
    canEdit?: boolean;
}

export default function ProfileField({
    iconCategory,
    iconName,
    iconRightName,
    label,
    value,
    isPassword = false,
    onUpdate,
    canEdit,
}: ProfileFieldProps) {
    const { colors } = useThemeContext();
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleEdit = () => {
        setInputValue(value);
        setIsEditing(true);
    };

    const handleSave = () => {
        onUpdate?.(inputValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setInputValue(value);
        setIsEditing(false);
    };

    return (
        <>
            <View style={[styles.container, { backgroundColor: colors.box2 }]}>
                <View style={styles.iconContainer}>
                    <Icon category={iconCategory} name={iconName} />
                </View>
                <View style={styles.contentContainer}>
                    <CustomText
                        fontFamily="Inter"
                        fontSize={16}
                        style={{ color: colors.text5 }}
                    >
                        {isPassword ? '••••••••' : value}
                    </CustomText>
                </View>
                <Pressable
                    onPress={canEdit ? handleEdit : undefined}
                    style={styles.editButton}
                >
                    <Icon category={iconCategory} name={iconRightName} />
                </Pressable>
            </View>

            <Modal visible={isEditing} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.backgroundColor }]}>
                        <CustomText
                            fontFamily="Inter"
                            fontSize={18}
                            style={{ color: colors.text5, fontWeight: 'bold', marginBottom: 16 }}
                        >
                            Edit {label}
                        </CustomText>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.box2, color: colors.text5 }]}
                            value={inputValue}
                            onChangeText={setInputValue}
                            secureTextEntry={isPassword}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <Pressable onPress={handleCancel} style={styles.cancelButton}>
                                <CustomText
                                    fontFamily="Inter"
                                    fontSize={16}
                                    style={{ color: colors.text5 }}
                                >
                                    Cancel
                                </CustomText>
                            </Pressable>
                            <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.box1 }]}>
                                <CustomText
                                    fontFamily="Inter"
                                    fontSize={16}
                                    style={{ color: colors.text5, fontWeight: '600' }}
                                >
                                    Save
                                </CustomText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
    },
    iconContainer: {
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    editButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        padding: 20,
        width: '80%',
    },
    input: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        padding: 10,
        marginRight: 12,
    },
    saveButton: {
        padding: 10,
        borderRadius: 8,
    },
});