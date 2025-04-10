import Box from '@/components/Box';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Message = () => (
    <View style={styles.container}>
        <Box style={styles.box1}> Box 1 </Box>
        <Box style={styles.box1}> Box 2 </Box>
        <Box style={styles.box1}> Box 3 </Box>
        <Box style={styles.box1}> Box 4 </Box>
        <Box style={styles.box1}> Box 5 </Box>
        <Box style={styles.box1}> Box 6 </Box>
    </View>
);

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    box1: {
        backgroundColor: 'red',
    }
});

export default Message;