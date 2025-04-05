// import { styles } from './../../../../styles/signupStyles';
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212832',
        paddingHorizontal: 22,
    },
    containerHeader: {
        position: 'absolute',
        width: 300,
        top: 0,
        left: 5,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    headerText1: {
        fontSize: 12.7,
        color: '#FED36A',
        left: 0,
    },
    headerText2: {
        transform: [
            { scaleX: 1.31 },     // Kéo dài theo chiều ngang
            { translateX: 12.5 }   // Dịch lại vị trí ban đầu
        ],
        fontSize: 22.29,
        color: 'white',
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
        width: 311,
        height: '100%'
    },
    setting: {
        width: 58,
        height: "100%",
        backgroundColor: '#FED36A',
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
        marginTop: -134,
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
        backgroundColor: '#FED36A',
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'space-between',

    },
    titleBoxSelectedBox: {
        transform: [
            { scaleX: 1.63 },     // Kéo dài theo chiều ngang
            { translateX: 27.5 }   // Dịch lại vị trí ban đầu
        ],
        fontSize: 21,
        color: '#000000',
    },
    titleBoxUnSelected: {
        transform: [
            { scaleX: 1.59 },     // Kéo dài theo chiều ngang
            { translateX: 60.6 }   // Dịch lại vị trí ban đầu
        ],
        fontSize: 21,
        color: '#FFFFFF',
    },
    teamMemberConntainer: {
        flexDirection: 'row', // Xếp theo chiều ngang
        alignItems: 'center',
    },
    teamMember: {
        width: 71,
        height: 20,
        marginLeft: 10,
        flexDirection: 'row' as const,
        alignItems: 'center',
    },
    circle1: {
        width: 20, // Kích thước đường kính hình tròn
        height: 20,
        borderRadius: 50, // Biến hình vuông thành hình tròn
        backgroundColor: 'blue',
    },
    circle2: {
        position: 'absolute',
        width: 20, // Kích thước đường kính hình tròn
        height: 20,
        borderRadius: 50,
        backgroundColor: 'green',
        marginLeft: 13,
    },
    circle3: {
        position: 'absolute',
        width: 20, // Kích thước đường kính hình tròn
        height: 20,
        borderRadius: 50,
        backgroundColor: 'yellow',
        marginLeft: 26,
    },
    circle4: {
        position: 'absolute',
        width: 20, // Kích thước đường kính hình tròn
        height: 20,
        borderRadius: 50,
        backgroundColor: 'white',
        marginLeft: 39,
    },
    circle5: {
        position: 'absolute',
        width: 20, // Kích thước đường kính hình tròn
        height: 20,
        borderRadius: 50,
        backgroundColor: 'green',
        marginLeft: 52,
    },
    progressBox: {
        width: 164,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    scrollViewContentVertically: {
        marginTop: 16,
        paddingBottom: 20, // Để tạo không gian dưới cùng
    },
    box1: {
        width: 384,
        height: 125,
        backgroundColor: '#455A64',
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        justifyContent: 'space-between',
    },
    box2: {
        height: 67,
    },
    teamMemberProject: {
        height: 45,
        width: 84,
        justifyContent: 'space-between'
    },
    completed: {
        position: 'absolute',
        left: 303,
        top: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginLeft: -8, // Để các avatar chồng lên nhau một chút
    },
})

export default styles;
