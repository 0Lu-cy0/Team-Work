import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212832',
    },
    tabContainer: {
        marginTop: 0,
        width: '100%',
        height: 47,
        flexDirection: 'row',
    },
    chatButton: {
        marginLeft: 29,//29
        width: 175,//175
        height: 47,//47
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupsButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20,//29
        width: 175,//175
        height: 47,//47
    },
    highlightTab: {
        position: 'absolute',
        width: 175,//175
        height: 47,
        backgroundColor: '#FED36A',
    },
    groupBox: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'pink',
        marginTop: 32,
        paddingHorizontal: 29,
    },
    smallBox: {
        width: 100,
        height: 40,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#212832',
    },
    spinner: {
        width: 50,
        height: 50,
        borderWidth: 5,
        borderColor: '#FED36A',
        borderTopColor: 'transparent',
        borderRadius: 25,
    },
    inFo: {
        width: "100%",
        height: 47,
        backgroundColor: 'blue',
        flexDirection: 'row',
    },
    startChatContainer: {
        flex: 1,
        marginTop: 48,
        width: '100%',
        alignItems: 'flex-end',
    },
    startChat: {
        width: 175,
        height: 47,
        backgroundColor: '#FED36A',
        justifyContent: 'center',
        alignItems: 'center',
    }

});

export default styles;