import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useThemeContext } from '@/context/ThemeContext';

interface CompletedLineProps {
    progress: number; // Giá trị phần trăm từ 0 đến 100
    containerStyle?: ViewStyle; // Style tùy chỉnh
}


const CompletedLine: React.FC<CompletedLineProps> = ({ progress, containerStyle }) => {
    const { colors } = useThemeContext();
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={[styles.percentLineSelected, { width: `${progress}%`, backgroundColor: colors.backgroundColor }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 163,
        height: 6,
        borderRadius: 8,
        overflow: "hidden", // Đảm bảo không bị tràn ra ngoài
    },
    percentLineSelected: {
        height: "100%",
        borderRadius: 8,
    },
});

export default CompletedLine;
