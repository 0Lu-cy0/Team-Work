import { StyleSheet, StatusBar } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 26,
        paddingBottom: 45,
        paddingTop: 30,
    },
    viewLogo: {
        flex: 1,
        width: "100%",
        justifyContent: "flex-start",
    },
    viewImage: {
        flex: 3,
        width: "100%",
        height: 330,
    },
    image: {
        resizeMode: "contain",
        width: "100%",
        height: "100%",
    },
    viewText: {
        flex: 3,
        width: "100%",
        justifyContent: "flex-end",
    },
    text: {
        lineHeight: 70,
    },
    viewLetstart: {
        width: "100%",
        flex: 1.5,
        justifyContent: 'flex-end',
    },
    letStartBox: {
        width: "100%",
        height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default styles;
