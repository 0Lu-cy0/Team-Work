// import { styles } from './../../../../styles/signupStyles';
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212832',
        paddingHorizontal: 22,
    },
    containerHeader: {
        width: "100%",
        top: 0,
        left: 5,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    headerText1: {
        fontSize: 14,
        left: 0,
    },
    headerText2: {
        // transform: [
        //     { scaleX: 2.6 },
        //     { translateX: 27 }
        // ],
        fontSize: 22.29,
    },
    headerRight: {
        width: 48,
        height: 48,
    },
    searchAndSetting: {
        marginTop: 13,
        width: "100%",
        height: 58,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    search: {
        height: '100%',
        flex: 7,
    },
    setting: {
        flex: 1.4,
        marginLeft: 16,
        height: "100%",
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    settingImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    completedProject: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ongoingProject: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title1: {
        fontSize: 26,
        lineHeight: 26,
        color: 'white',
    },
    title2: {
        fontSize: 20,
        lineHeight: 25,
        color: '#FED36A',
    },
    title3: {
        position: 'absolute',
        fontSize: 20,
        color: 'white',
        top: 390,
        left: 22,
    },
    title4: {
        position: 'absolute',
        fontSize: 16,
        lineHeight: 26,
        color: '#FED36A',
        top: 390,
        left: 356,
    },
    scrollViewContent: {
        marginTop: 16,
    },
    box: {
        flex: 1,
        width: 183,
        height: 175,
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'space-between',

    },
    titleBoxSelectedBox: {
        transform: [
            { scaleX: 1.63 },     // Kéo dài theo chiều ngang
            { translateX: 31.6 }   // Dịch lại vị trí ban đầu
        ],
        fontSize: 21,
        color: '#000000',
    },
    titleBoxUnSelected: {
        transform: [
            { scaleX: 1.59 },     // Kéo dài theo chiều ngang
            { translateX: 68 }   // Dịch lại vị trí ban đầu
        ],
        fontSize: 21,
        color: '#FFFFFF',
    },
    teamMemberConntainer: {
        flexDirection: 'row', // Xếp theo chiều ngang
        alignItems: 'center',
    },
    teamMember: {
        marginLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBox: {
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    scrollViewContentVertically: {
        marginTop: 16,
        paddingBottom: 20,
    },
    box1: {
        width: 384,
        height: 125,
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'space-between',
    },
    box2: {
        marginTop: 4,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    teamMemberProject: {
        height: 45,
        width: '100%',
        justifyContent: 'space-between',
    },
    memberAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginLeft: -8, // Để các avatar chồng lên nhau một chút
    },
})

export default styles;
