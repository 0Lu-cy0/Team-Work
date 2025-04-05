import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

interface HeadProps {
    leftIconUrl?: string;
    rightIconUrl?: string;
    onLeftPress?: () => void;
    onRightPress?: () => void;
    children: React.ReactNode;
    showRightIcon?: boolean;
}

const Head: React.FC<HeadProps> = ({
    leftIconUrl = 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/73bab2b3-7af2-4c18-8925-df3a35fd3758',
    rightIconUrl = 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/aab647bb-3d80-4f84-ae50-8dfcd9de6a7b',
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
            {leftIconUrl && (
                <TouchableOpacity style={styles.leftIcon} onPress={handleLeftPress}>
                    <Image source={{ uri: leftIconUrl }} style={styles.iconImage} />
                </TouchableOpacity>
            )}

            {/* Custom Title */}
            <View style={styles.titleContainer}>
                {children}
            </View>

            {/* Right Icon */}
            {showRightIcon && rightIconUrl && (
                <TouchableOpacity style={styles.rightIcon} onPress={onRightPress}>
                    <Image source={{ uri: rightIconUrl }} style={styles.iconImage} />
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
