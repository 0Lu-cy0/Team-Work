import { Dimensions, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212832',
        paddingHorizontal: 29,
    },
    scrollViewContent: {
        paddingBottom: 120, // Đảm bảo nội dung không bị che bởi nút Add Task
    },
    headTitle: {
        fontSize: 20,
        color: '#fff',
    },
    header: {
        marginTop: 20,
    },
    info: {
        fontSize: 24,
        color: '#fff',
    },
    dateAndTeam: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        width: 47,
        height: 47,
        backgroundColor: '#FED36A',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
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
    dueDate: {
        fontSize: 12,
        color: '#8CAAB9',
    },
    dateText: {
        fontSize: 16,
        color: '#FFFFFF',
        marginTop: 4,
    },
    team: {
        width: 47,
        height: 47,
        backgroundColor: '#FED36A',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
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
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    extraMembers: {
        backgroundColor: '#455A64',
        justifyContent: 'center',
        alignItems: 'center',
    },
    extraMembersText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'InterMedium',
    },
    details: {
        marginTop: 30,
    },
    projectDetails: {
        fontSize: 20,
        color: 'white',
    },
    textDetails: {
        marginTop: 8,
        fontSize: 14,
        color: '#BCCFD8',
        lineHeight: 20,
    },
    progress: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: 20,
        color: 'white',
    },
    completed: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    allTask: {
        marginTop: 20,
    },
    allTaskText: {
        fontSize: 20,
        color: 'white',
    },
    flashList: {
        flex: 1,
        marginTop: 20,
    },
    flashListContent: {
        paddingBottom: 20,
    },
    box: {
        height: 58,
        backgroundColor: '#455A64',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 19,
        paddingRight: 10,
        borderRadius: 8,
    },
    boxText: {
        fontSize: 16,
        color: 'white',
    },
    boxIcon: {
        height: 40,
        width: 40,
        backgroundColor: '#FED36A',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    addTask: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 100,
        backgroundColor: '#263238',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addTaskButton: {
        width: 318,
        height: 57,
        backgroundColor: '#FED36A',
        borderRadius: 8,
    },
});

export default styles;