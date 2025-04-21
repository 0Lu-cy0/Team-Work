import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2A44',
    },
    headerRight: {
        marginRight: 16,
        marginBottom: 20,
    },
    calendar: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    month: {
        color: '#A0AEC0',
        marginBottom: 8,
    },
    day: {
        alignItems: 'center',
        padding: 8,
        marginRight: 8,
        borderRadius: 8,
    },
    selectedDay: {
        backgroundColor: '#FFC107',
    },
    dayText: {
        color: '#A0AEC0',
    },
    selectedDayText: {
        color: '#1E2A44',
    },
    dateText: {
        color: '#FFFFFF',
    },
    selectedDateText: {
        color: '#1E2A44',
    },
    sectionHeader: {
        color: '#A0AEC0',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    emptyText: {
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#2A3A5A',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
    },
    modalTitle: {
        color: '#FFFFFF',
        textAlign: 'center',
    },
    monthItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#A0AEC0',
    },
    monthText: {
        color: '#FFFFFF',
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: '#FFC107',
        paddingVertical: 12,
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#1E2A44',
        textAlign: 'center',
    },
});

export default styles;