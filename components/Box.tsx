import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface BoxProps {
    children: React.ReactNode;
    style?: ViewStyle; // ✅ Thêm style vào props
}

const Box: React.FC<BoxProps> = ({ children, style }) => {
    return (
        <View style={[style, styles.box]}>
            <Text>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        width: '100%',
        alignItems: 'center'
    }
});

export default Box;
