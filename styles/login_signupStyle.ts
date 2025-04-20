import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#212832",
        paddingHorizontal: 26,
        paddingBottom: 10,
        paddingTop: 37,
    },
    text1: {
        lineHeight: 32,
        marginTop: 46,
    },
    text2: {
        lineHeight: 21,
        marginTop: 21,
    },
    text4: {
        lineHeight: 21,
        textAlign: "right",
        marginTop: 14,
    },
    text7: {
        fontSize: 14,
        lineHeight: 20.5,
        color: "#8CAAB9",
    },
    inputEmailAndPassword: {
        marginTop: 14,
        paddingVertical: 10,
    },
    termsContainer: {
        flexDirection: "row",
        marginTop: 18,
    },
    textTermsContainer: {
        flexDirection: "row",
        marginLeft: 15,
    },
    loginButton: {
        width: '100%',
        marginTop: 34,
        justifyContent: "center",
        paddingVertical: 22,
    },
    signUpButton: {
        width: "100%",
        marginTop: 38,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 22,
    },
    lineSignIn_Up: {
        marginTop: 32,
    },
    googleButton: {
        width: "100%",
        paddingVertical: 25,
        marginTop: 32,
        borderWidth: 1,
        borderColor: '#FFFFFF'
    },
    PageTransition: {
        width: '100%',
        justifyContent: 'center',
        flexDirection: "row",
        marginTop: 22,
    },
});

export default styles;
