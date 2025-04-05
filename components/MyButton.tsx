import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle, View, Text } from 'react-native';

interface MyButtonProps {
    title?: JSX.Element | string;
    onPress: () => void;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle;
    backgroundColor?: string;
    disabled?: boolean;
}

const MyButton: React.FC<MyButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    backgroundColor = "#FED36A",
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={onPress}
            style={[
                styles.button,
                style,
                { backgroundColor },
            ]}
        >
            <View style={styles.content}>
                {title && <Text style={[textStyle]}>{title}</Text>}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
});

export default MyButton;
