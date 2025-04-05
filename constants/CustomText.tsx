import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useFonts } from 'expo-font';

interface CustomTextProps extends TextProps {
    fontFamily?: 'Inter' | 'Montserrat' | 'InterMedium' | 'InterReguler' | 'InterSemiBold' | 'InterThin';
    fontSize?: number;
    style?: TextStyle | TextStyle[];
    children: React.ReactNode;
}

const CustomText: React.FC<CustomTextProps> = ({
    fontFamily = 'Inter',
    fontSize = 16,
    style,
    children,
    ...props
}) => {
    const [fontLoaded] = useFonts({
        Inter: require('../assets/fonts/Inter_28pt-SemiBold.ttf'),
        InterReguler: require('../assets/fonts/Inter_28pt-Regular.ttf'),
        InterMedium: require('../assets/fonts/Inter_28pt-Medium.ttf'),
        Montserrat: require('../assets/fonts/Montserrat-SemiBold.ttf'),
        InterSemiBold: require('../assets/fonts/Inter_28pt-SemiBold.ttf'),
        InterThin: require('../assets/fonts/Inter_28pt-Thin.ttf'),
    });

    if (!fontLoaded) {
        return <Text>Loading...</Text>;
    }

    const flattenedStyle = StyleSheet.flatten(style || {}); // Đảm bảo style không undefined
    const textColor = flattenedStyle.color || 'black'; // Giá trị mặc định

    return (
        <Text
            style={[{ fontFamily, fontSize }, style]}
            {...props}
        >
            {React.Children.map(children, (child) => {
                if (typeof child === 'string') {
                    return (
                        <Text style={{ fontFamily, fontSize, color: textColor }}>
                            {child}
                        </Text>
                    );
                }
                return child;
            })}
        </Text>
    );
};

export default CustomText;