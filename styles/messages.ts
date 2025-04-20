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
    tab: {
        flex: 1,
        // paddingVertical: 12,
        alignItems: 'center',
        // backgroundColor: '#2A3A5A',
        // borderRadius: 8,
        // marginHorizontal: 4,
    },
    activeTab: {
        backgroundColor: '#FFC107',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    activeTabText: {
        color: '#1E2A44',
    },
    emptyText: {
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
    },
    startChatContainer: {
        padding: 16,
        alignItems: 'center',
    },
    startChatButton: {
        backgroundColor: '#FFC107',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    startChatButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E2A44',
    },
});

export default styles;