import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useFonts } from 'expo-font';
import { useThemeContext } from '@/context/ThemeContext';

interface CustomTextProps extends TextProps {
    fontFamily?: 'Inter' | 'Montserrat' | 'InterMedium' | 'InterRegular' | 'InterSemiBold' | 'InterThin';
    fontSize?: number;
    style?: TextStyle | TextStyle[] | undefined;
    children: React.ReactNode;
}

const CustomText: React.FC<CustomTextProps> = ({
    fontFamily = 'Inter',
    fontSize = 16,
    style,
    children,
    ...props
}) => {
    const { colors } = useThemeContext(); // Access theme colors
    const [fontLoaded] = useFonts({
        Inter: require('../assets/fonts/Inter_28pt-SemiBold.ttf'),
        InterRegular: require('../assets/fonts/Inter_28pt-Regular.ttf'),
        InterMedium: require('../assets/fonts/Inter_28pt-Medium.ttf'),
        Montserrat: require('../assets/fonts/Montserrat-SemiBold.ttf'),
        InterSemiBold: require('../assets/fonts/Inter_28pt-SemiBold.ttf'),
        InterThin: require('../assets/fonts/Inter_28pt-Thin.ttf'),
    });

    if (!fontLoaded) {
        // Return null or a minimal fallback to avoid FOUT
        return null;
    }

    // Flatten the styles, ensuring only valid style objects are included
    const validStyles = Array.isArray(style)
        ? style.filter((s): s is TextStyle => s !== null && typeof s === 'object')
        : style && typeof style === 'object'
            ? [style]
            : [];
    const flattenedStyle = StyleSheet.flatten([
        { fontFamily, fontSize },
        ...validStyles,
    ]);

    // Use a default color from the theme if none is provided
    const textColor = flattenedStyle.color || colors.text5 || '#000000';

    return (
        <Text style={[flattenedStyle, { color: textColor }]} {...props}>
            {children}
        </Text>
    );
};

export default CustomText;