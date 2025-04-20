import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    searchContainer: {
        paddingVertical: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    tabChat: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        marginRight: 10,
    },
    tabGroup: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        marginLeft: 10,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
    },
    startChatContainer: {
        alignItems: 'flex-end',
    },
    startChatButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    startChatButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E2A44',
    },
});

export default styles;