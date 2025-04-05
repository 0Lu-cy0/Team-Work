import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212832', // Dark background color as seen in the UI
        paddingHorizontal: 20,
        paddingTop: 40, // Space for the header
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF', // White text color for the header
        marginLeft: 10,
    },
    title1: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF', // White text for section titles
        marginBottom: 8,
    },
    title2: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF', // White text for section titles
        marginTop: 15,
        marginBottom: 8,
    },
    input1: {
        backgroundColor: '#455A64', // Gray background for inputs
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#FFFFFF', // White text color for input
        marginBottom: 15,
    },
    input2: {
        backgroundColor: '#455A64', // Gray background for the multiline input
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#FFFFFF', // White text color for input
        minHeight: 80, // Height for the multiline input
        textAlignVertical: 'top', // Align text to the top for multiline
        marginBottom: 15,
    },
    box1: {
        backgroundColor: '#455A64', // Gray background for the team members section
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    temMember: {
        flexGrow: 0, // Prevent FlatList from growing unnecessarily
    },
    addTeamMember: {
        backgroundColor: '#FED36A', // Yellow background for the add button
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    box2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    Time: {
        flex: 1,
        backgroundColor: '#455A64', // Gray background for time picker
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginRight: 10,
    },
    Date: {
        flex: 1,
        backgroundColor: '#455A64', // Gray background for date picker
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    timeIcon: {
        marginRight: 10,
    },
    dateIcon: {
        marginRight: 10,
    },
    timeView: {
        flex: 1,
    },
    dateView: {
        flex: 1,
    },
    deleteChange: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 30, // Space at the bottom
    },
    Delete: {
        flex: 1,
        backgroundColor: '#455A64', // Gray background for DELETE button
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginRight: 10,
    },
    Change: {
        flex: 1,
        backgroundColor: '#FED36A', // Yellow background for CHANGE button
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
    },
});

export default styles;