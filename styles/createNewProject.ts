
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212832',
    },
    title1: {
        fontSize: 20,
        color: '#fff',
        marginLeft: 41,
    },
    input1: {
        marginTop: 13,
        marginLeft: 41,
        paddingLeft: 25.5,
        paddingRight: 25.5,
        width: 358,
        height: 48,
    },
    title2: {
        fontSize: 20,
        color: '#fff',
        marginTop: 29,
        marginLeft: 41,
    },
    input2: {
        marginTop: 20,
        marginLeft: 41,
        paddingLeft: 25.5,
        paddingRight: 25.5,
        paddingBottom: 9,
        width: 358,
        height: 82,
    },
    box1: {
        marginTop: 20,
        marginLeft: 41,
        width: 358,
        height: 41,
        flexDirection: "row",
    },
    temMember: {
        width: 309,
        height: "100%",
    },
    addTeamMember: {
        marginLeft: 8,
        width: 41,
        paddingVertical: 0,
        paddingHorizontal: 0,
        height: "100%",
        backgroundColor: "#FED36A",
        justifyContent: 'center',
        alignItems: 'center',
    },
    box2: {
        marginTop: 20,
        marginLeft: 41,
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
    createBox: {
        marginTop: 63,
        marginLeft: 41,
        marginRight: 29,
        height: 67,
    }
});
export default styles;