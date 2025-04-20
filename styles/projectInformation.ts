import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    title1: {
        marginTop: 33,
        marginBottom: 8,
    },
    title2: {
        marginTop: 20,
        marginBottom: 8,
    },
    box1: {
        flex: 7,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    temMember: {
        flexGrow: 0,
    },
    addTeamMember: {
        flex: 1,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    box2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        width: '100%',
        height: 40,
    },
    Time: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 10,
    },
    Date: {
        flex: 1,
        flexDirection: 'row',
    },
    dateIcon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeView: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateView: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteChange: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    Delete: {
        flex: 1,
        paddingVertical: 15,
        marginRight: 10,
    },
    Change: {
        flex: 1,
        paddingVertical: 15,
    },
});

export default styles;