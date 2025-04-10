import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Icon, { IconCategory } from './Icon'; // Giả sử Icon nằm trong file './Icon'

// Cập nhật interface HeadProps để sử dụng Icon props thay vì URL
interface HeadProps {
    leftIcon?: {
        category: IconCategory;
        name?: string; // Optional, chỉ cần nếu category không phải splash/logo/avatar
    };
    rightIcon?: {
        category: IconCategory;
        name?: string; // Optional, chỉ cần nếu category không phải splash/logo/avatar
    };
    onLeftPress?: () => void;
    onRightPress?: () => void;
    children: React.ReactNode;
    showRightIcon?: boolean;
}

const Head: React.FC<HeadProps> = ({
    leftIcon = { category: 'topTab', name: 'back' }, // Giá trị mặc định ví dụ
    rightIcon = { category: 'topTab', name: 'edit' }, // Giá trị mặc định ví dụ
    onLeftPress,
    onRightPress,
    children,
    showRightIcon = true,
}) => {
    const router = useRouter();
    const handleLeftPress = () => {
        if (onLeftPress) {
            onLeftPress();
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            {/* Left Icon */}
            {leftIcon && (
                <TouchableOpacity style={styles.leftIcon} onPress={handleLeftPress}>
                    <Icon
                        category={leftIcon.category}
                        name={leftIcon.name as any} // Type assertion vì name có thể undefined
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
            )}

            {/* Custom Title */}
            <View style={styles.titleContainer}>
                {children}
            </View>

            {/* Right Icon */}
            {showRightIcon && rightIcon && (
                <TouchableOpacity style={styles.rightIcon} onPress={onRightPress}>
                    <Icon
                        category={rightIcon.category}
                        name={rightIcon.name as any} // Type assertion vì name có thể undefined
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 5.5,
        left: 0,
        right: 0,
        height: 63,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
        zIndex: 1000,
    },
    leftIcon: {
        position: 'absolute',
        left: 41,
        top: 39 - 24 / 2, // Align vertically
    },
    rightIcon: {
        position: 'absolute',
        right: 41,
        top: 39 - 24 / 2, // Align vertically
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        top: 10,
    },
    iconImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});

export default Head;