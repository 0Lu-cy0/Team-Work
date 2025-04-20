import { Dimensions, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 29,
    },
    scrollViewContent: {
        paddingBottom: 120, // Đảm bảo nội dung không bị che bởi nút Add Task
    },
    header: {
        marginTop: 20,
    },
    info: {
        transform: [
            { scaleX: 2 },
            { translateX: 87 }
        ],
        fontSize: 24,
    },
    dateAndTeam: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        width: 47,
        height: 47,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    textDate: {
        marginLeft: 14,
        justifyContent: 'space-between',
    },
    dateText: {
        marginTop: 4,
    },
    team: {
        width: 47,
        height: 47,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20,
    },
    textTeam: {
        marginLeft: 14,
        justifyContent: 'space-between',
    },
    teamMember: {
        flexDirection: 'row',
        marginTop: 4,
    },
    memberAvatar: {
        width: 20,
        height: 20,
        borderRadius: 15,
    },
    extraMembers: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        marginTop: 30,
        flex: 0.3
    },
    textDetails: {
        marginTop: 8,
        lineHeight: 20,
    },
    progress: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    completed: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    allTask: {
        marginTop: 20,
    },
    flashList: {
        flex: 1,
        marginTop: 20,
    },
    flashListContent: {
        paddingBottom: 100,
    },
    box: {
        height: 58,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 10,
    },
    boxIcon: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addTask: {
        position: 'absolute',
        bottom: 0,
        width: 410,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addTaskButton: {
        width: 318,
        height: 57,
    },
});

export default styles;