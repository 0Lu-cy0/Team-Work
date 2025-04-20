// components/ThemeToggleButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme, colors } = useThemeContext();

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.box1 }]}
            onPress={toggleTheme}
        >
            <Text style={[styles.buttonText, { color: colors.text4 }]}>
                {theme === 'dark' ? 'Light' : 'Dark'}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        right: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ThemeToggleButton;