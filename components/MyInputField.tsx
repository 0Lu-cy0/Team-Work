// components/inputButton.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import * as Font from 'expo-font';
import { useThemeContext } from '@/context/ThemeContext'; // Import theme context

interface MyInputFieldProps {
    value: string;
    onChangeText: (text: string) => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    iconSize?: number;
    iconColor?: string;
    backgroundColor?: string; // Giữ prop này để có thể ghi đè nếu cần
    onRightIconPress?: () => void;
    secureTextEntry?: boolean;
    placeholder?: string;
    placeholderStyle?: TextStyle;
    multiline?: boolean;
    scrollEnabled?: boolean;
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'; // Thêm prop keyboardType
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; // Thêm prop autoCapitalize
    editable?: boolean;
}

const MyInputField: React.FC<MyInputFieldProps> = ({
    value,
    onChangeText,
    style,
    textStyle,
    leftIcon,
    rightIcon,
    backgroundColor,
    onRightIconPress,
    secureTextEntry,
    placeholder = 'Enter text...',
    placeholderStyle,
    multiline,
    scrollEnabled,
    textAlignVertical,
    keyboardType,
    autoCapitalize,
    editable = true,
}) => {
    const [fontLoaded, setFontLoaded] = useState(false);
    const { colors } = useThemeContext(); // Lấy colors từ theme context

    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
                InterReguler: require('../assets/fonts/Inter_28pt-Regular.ttf'),
            });
            setFontLoaded(true);
        };
        loadFonts();
    }, []);

    if (!fontLoaded) return null;

    return (
        <View
            style={[
                styles.container,
                style,
                { backgroundColor: backgroundColor || colors.box1 }, // Sử dụng backgroundColor từ prop hoặc theme
            ]}
        >
            {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

            <TextInput
                value={value}
                onChangeText={onChangeText}
                style={[styles.input, { fontFamily: 'InterReguler', color: colors.text1 }, textStyle]}
                secureTextEntry={secureTextEntry}
                placeholder={placeholder}
                placeholderTextColor={colors.text3} // Sử dụng màu placeholder từ theme
                multiline={multiline}
                scrollEnabled={scrollEnabled}
                textAlignVertical={textAlignVertical}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                editable={editable}
            />

            {rightIcon && (
                <TouchableOpacity onPress={onRightIconPress} style={styles.iconRight}>
                    {rightIcon}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 58,
        width: '100%', // Thay width cố định thành 100% để responsive
        borderRadius: 8, // Thêm borderRadius để giống thiết kế Figma
    },
    iconLeft: {
        marginRight: 20,
        marginLeft: 18,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    iconRight: {
        marginRight: 18,
    },
});

export default MyInputField;