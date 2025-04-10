import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import Icon, { IconCategory } from './Icon';
import { useThemeContext } from '@/context/ThemeContext';

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
                    <Text style={[styles.value, { color: colors.text5 }]}>
                        {isPassword ? '••••••••' : value}
                    </Text>
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
                        <Text style={[styles.modalTitle, { color: colors.text5 }]}>
                            Edit {label}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.box2, color: colors.text5 }]}
                            value={inputValue}
                            onChangeText={setInputValue}
                            secureTextEntry={isPassword}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <Pressable onPress={handleCancel} style={styles.cancelButton}>
                                <Text style={[styles.cancelButtonText, { color: colors.text5 }]}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.box1 }]}>
                                <Text style={[styles.saveButtonText, { color: colors.text5 }]}>
                                    Save
                                </Text>
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
        borderRadius: 8,
        marginBottom: 12,
        padding: 16,
    },
    iconContainer: {
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    value: {
        fontSize: 16,
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
        borderRadius: 12,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
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
    cancelButtonText: {
        fontSize: 16,
    },
    saveButton: {
        padding: 10,
        borderRadius: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});