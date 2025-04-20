import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Icon, { IconCategory } from './Icon';

interface HeadProps {
    leftIcon?: {
        category: IconCategory;
        name?: string;
    };
    rightIcon?: {
        category: IconCategory;
        name?: string;
    };
    onLeftPress?: () => void;
    onRightPress?: () => void;
    children: React.ReactNode;
    showRightIcon?: boolean;
}

const Head: React.FC<HeadProps> = ({
    leftIcon = { category: 'topTab', name: 'back' },
    rightIcon = { category: 'topTab', name: 'edit' },
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
            {leftIcon && (
                <TouchableOpacity onPress={handleLeftPress}>
                    <Icon
                        category={leftIcon.category}
                        name={leftIcon.name as any}
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
            )}

            <View style={styles.titleContainer}>
                {children}
            </View>
            {showRightIcon && rightIcon && (
                <TouchableOpacity onPress={onRightPress}>
                    <Icon
                        category={rightIcon.category}
                        name={rightIcon.name as any}
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        top: 5.5,
        height: 63,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    iconImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});

export default Head;