import React from 'react';
import { Modal, View, Image, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomText from '@/constants/CustomText';
import MyInputField from '@/components/MyInputField';
import MyButton from '@/components/MyButton';

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    nameTask: string;
    setNameTask: (text: string) => void;
    handleAddTask: () => void;
    timeOnpress: (event: any, selectedTime?: Date) => void;
    dateOnpress: (event: any, selectedDate?: Date) => void;
    dueDate: Date;
    dueTime: Date;
    showDatePicker: boolean;
    showTimePicker: boolean;
    onShowDatePicker: () => void;
    onShowTimePicker: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
    visible,
    onClose,
    nameTask,
    setNameTask,
    handleAddTask,
    timeOnpress,
    dateOnpress,
    dueDate,
    dueTime,
    showDatePicker,
    showTimePicker,
    onShowDatePicker,
    onShowTimePicker
}) => {
    const formatDate = (date: Date) => date.toLocaleDateString("en-GB", { day: "2-digit", month: "long" });
    const formatTime = (date: Date) => date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <View style={styles.exitBox}>
                            <CustomText style={[{ fontFamily: "Inter" }, styles.closeText]}>X</CustomText>
                        </View>
                    </Pressable>
                    <CustomText fontFamily="InterSemiBold" fontSize={18} style={{ color: '#fff' }}>Task Info</CustomText>
                    <MyInputField value={nameTask} onChangeText={setNameTask} placeholder='Enter task name...' style={styles.nameTask} />
                    <View style={styles.dateTime}>
                        <View style={styles.Time}>
                            <Pressable onPress={onShowTimePicker} style={styles.timeIcon}>
                                <Image source={{ uri: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/98f481d7-a3c9-43ad-bea6-4e6c9512925e" }} style={{ width: 24, height: 24 }} />
                            </Pressable>
                            <View style={styles.timeView}>
                                <CustomText fontSize={20} style={{ color: "#fff" }}>
                                    {formatTime(dueTime)}
                                </CustomText>
                            </View>
                        </View>
                        <View style={styles.Date}>
                            <Pressable onPress={onShowDatePicker} style={styles.dateIcon}>
                                <Image source={{ uri: "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c89994dc-77ab-4dfb-a2c7-db39b0b35d73" }} style={{ width: 24, height: 24 }} />
                            </Pressable>
                            <View style={styles.dateView}>
                                <CustomText fontSize={20} style={{ color: "#fff" }}>
                                    {formatDate(dueDate)}
                                </CustomText>
                            </View>
                        </View>
                    </View>
                    <MyButton onPress={handleAddTask} title={<CustomText fontSize={20}>Add</CustomText>} style={styles.Add} />
                </View>
            </View>
            {showTimePicker && (
                <DateTimePicker value={dueTime} mode="time" is24Hour={true} display="default" onChange={timeOnpress} />
            )}
            {showDatePicker && (
                <DateTimePicker value={dueDate} mode="date" display="default" onChange={dateOnpress} />
            )}
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
        width: '86.75%',
        height: 270,
        backgroundColor: '#263238',
        padding: 20,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 5,
        left: 350,
    },
    exitBox: {
        width: 30,
        height: 30,
        right: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        fontSize: 18,
        color: 'white',
    },
    nameTask: {
        top: 20,
        width: 358,
        height: 48,
    },
    dateTime: {
        marginTop: 40,
        width: 358,
        height: 41,
        flexDirection: 'row',
    },
    Time: {
        width: 176,
        height: '100%',
        flexDirection: 'row',
        marginRight: 6,
    },
    timeIcon: {
        width: 41,
        height: '100%',
        backgroundColor: '#FED36A',
        justifyContent: 'center',
        alignItems: 'center'
    },
    timeView: {
        width: 135,
        height: '100%',
        backgroundColor: '#455A64',
        justifyContent: 'center',
        alignItems: 'center'
    },
    Date: {
        width: 176,
        height: '100%',
        flexDirection: 'row',
    },
    dateIcon: {
        width: 41,
        height: '100%',
        backgroundColor: '#FED36A',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dateView: {
        width: 135,
        height: '100%',
        backgroundColor: '#455A64',
        justifyContent: 'center',
        alignItems: 'center'
    },
    Add: {
        marginTop: 20,
        width: 310,
        height: 58,
        backgroundColor: '#FED36A',
    },
});

export default AddTaskModal;
