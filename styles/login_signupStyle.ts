import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#212832",
        paddingHorizontal: 26,
    },
    text1: {
        fontSize: 26,
        lineHeight: 26,
        color: "#FFFFFF",
        marginTop: 43,
    },
    text2: {
        fontSize: 18,
        lineHeight: 18,
        color: "#8CAAB9",
        marginTop: 23,
    },
    text3: {
        fontSize: 18,
        lineHeight: 18,
        color: "#8CAAB9",
        marginTop: 30,
    },
    text4: {
        fontSize: 16,
        lineHeight: 16,
        color: "#8CAAB9",
        textAlign: "right",
        marginTop: 14,
    },
    text7: {
        fontSize: 14,
        lineHeight: 20.5,
        color: "#8CAAB9",
    },
    inputEmailAndPassword: {
        marginTop: 16,
    },
    termsContainer: {
        flexDirection: "row",
        marginTop: 18,
    },
    textTermsContainer: {
        position: "absolute",
        flexDirection: "row",
        marginLeft: 36,
    },
    loginButton: {
        width: '100%',
        height: 67,
        marginTop: 34,
        justifyContent: "center",
        alignItems: "center",
    },
    signUpButton: {
        width: "100%",
        height: 67,
        marginTop: 52,
        justifyContent: "center",
        alignItems: "center",
    },
    lineSignIn_Up: {
        marginTop: 35,
    },
    googleButton: {
        width: "100%",
        height: 67,
        marginTop: 38,
        borderWidth: 1,
        borderColor: '#FFFFFF'
    },
    googleIconStyle: {
        width: 24,
        height: 24,
        left: -13,
    },
    PageTransition: {
        width: '100%',
        justifyContent: 'center',
        flexDirection: "row",
        marginTop: 24,
    },
});

export default styles;
