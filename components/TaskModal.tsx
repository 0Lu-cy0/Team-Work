import React, { useState } from 'react';
import { Modal, View, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '@/constants/CustomText';
import MyInputField from '@/components/MyInputField';
import MyButton from '@/components/MyButton';
import TaskMembersModal from './TaskMembersModal';
import { useThemeContext } from '@/context/ThemeContext';
import Icon from '@/components/Icon';

interface Member {
    user_id: string;
    avatar: string | null;
    name: string;
    role?: string;
}

interface TaskModalProps {
    visible: boolean;
    onClose: () => void;
    nameTask: string;
    setNameTask: (text: string) => void;
    handleDeleteTask: () => void;
    handleChangeTask: () => void;
    timeOnpress: (event: any, selectedTime?: Date) => void;
    dateOnpress: (event: any, selectedDate?: Date) => void;
    dueDate: Date;
    dueTime: Date;
    showDatePicker: boolean;
    showTimePicker: boolean;
    onShowDatePicker: () => void;
    onShowTimePicker: () => void;
    canEdit: boolean;
    members: Member[];
    selectedMembers: string[];
    onSaveMembers: (selectedMemberIds: string[]) => void;
    projectId?: string;
    taskId?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
    visible,
    onClose,
    nameTask,
    setNameTask,
    handleDeleteTask,
    handleChangeTask,
    timeOnpress,
    dateOnpress,
    dueDate,
    dueTime,
    showDatePicker,
    showTimePicker,
    onShowDatePicker,
    onShowTimePicker,
    canEdit,
    members,
    selectedMembers,
    onSaveMembers,
    projectId,
    taskId,
}) => {
    const [membersModalVisible, setMembersModalVisible] = useState(false);
    const formatDate = (date: Date) => date.toLocaleDateString("en-GB", { day: "2-digit", month: "long" });
    const formatTime = (date: Date) => date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const { colors } = useThemeContext();

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
                <View style={styles.modalBackground}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.backgroundColor }]} >
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <View style={styles.exitBox}>
                                <CustomText fontFamily="Inter" fontSize={22} style={{ color: colors.border }}>X</CustomText>
                            </View>
                        </Pressable>
                        <CustomText fontFamily="InterSemiBold" fontSize={18} style={{ color: colors.text7 }}>Task Info</CustomText>
                        <MyInputField
                            value={nameTask}
                            onChangeText={setNameTask}
                            placeholder="Enter task name..."
                            style={styles.nameTask}
                            editable={canEdit}
                        />
                        <View style={styles.dateTime}>
                            <View style={styles.Time}>
                                <Pressable onPress={canEdit ? onShowTimePicker : undefined} style={[styles.timeIcon, { backgroundColor: colors.box1 }]}>
                                    <Icon category='screens' name='clock' style={{ width: 24, height: 24 }} />
                                </Pressable>
                                <View style={[styles.timeView, { backgroundColor: colors.box2 }]}>
                                    <CustomText fontSize={20} style={{ color: colors.text5 }}>{formatTime(dueTime)}</CustomText>
                                </View>
                            </View>
                            <View style={styles.Date}>
                                <Pressable onPress={canEdit ? onShowDatePicker : undefined} style={[styles.dateIcon, { backgroundColor: colors.box1 }]}>
                                    <Icon category='screens' name='calendar' style={{ width: 24, height: 24 }} />
                                </Pressable>
                                <View style={[styles.dateView, { backgroundColor: colors.box2 }]}>
                                    <CustomText fontSize={20} style={{ color: colors.text5 }}>{formatDate(dueDate)}</CustomText>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={canEdit ? () => setMembersModalVisible(true) : undefined}
                            style={[styles.membersButton, { backgroundColor: colors.box2 }, { opacity: canEdit ? 1 : 0.6 }]}
                            disabled={!canEdit}
                        >
                            <CustomText fontFamily='Inter' fontSize={18} style={{ color: colors.text5 }}>
                                {selectedMembers.length > 0
                                    ? `${selectedMembers.length} members selected`
                                    : 'Select members'}
                            </CustomText>
                        </TouchableOpacity>
                        <View style={styles.deleteChange}>
                            <MyButton
                                onPress={handleDeleteTask}
                                title={<CustomText fontFamily="InterMedium" fontSize={18} style={{ color: colors.text4 }}>Delete</CustomText>}
                                style={[styles.Delete, { opacity: canEdit ? 1 : 0.6 }]}
                                backgroundColor={colors.box1}
                                disabled={!canEdit}
                            />
                            <MyButton
                                onPress={handleChangeTask}
                                title={<CustomText fontFamily="InterMedium" fontSize={18} style={{ color: colors.text4 }}>Change</CustomText>}
                                style={[styles.Change, { opacity: canEdit ? 1 : 0.6 }]}
                                backgroundColor={colors.box1}
                                disabled={!canEdit}
                            />
                        </View>
                    </View>
                </View>
                {showTimePicker && <DateTimePicker value={dueTime} mode="time" is24Hour={true} display="default" onChange={timeOnpress} />}
                {showDatePicker && <DateTimePicker value={dueDate} mode="date" display="default" onChange={dateOnpress} />}
            </Modal>
            <TaskMembersModal
                visible={membersModalVisible}
                onClose={() => setMembersModalVisible(false)}
                members={members}
                selectedMembers={selectedMembers}
                onSave={onSaveMembers}
                projectId={projectId}
                taskId={taskId}
            />
        </>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    membersButton: {
        marginTop: 20,
        padding: 10,
        width: "100%",
        alignItems: 'center',
    },
    modalContainer: {
        width: '86.75%',
        height: 330,
        padding: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 5,
        left: 340,
    },
    exitBox: {
        width: 30,
        height: 30,
        right: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameTask: {
        top: 20,
        width: "100%",
        height: 48,
    },
    dateTime: {
        marginTop: 40,
        width: "100%",
        height: 41,
        flexDirection: 'row',
    },
    Time: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        marginRight: 6,
    },
    timeIcon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    timeView: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    Date: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
    },
    dateIcon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dateView: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteChange: {
        width: "100%",
        height: 48,
        flexDirection: 'row',
        marginTop: 20,
    },
    Delete: {
        flex: 1,
        height: '100%',
        marginRight: 6
    },
    Change: {
        flex: 1,
        height: '100%',
    },
});

export default TaskModal;