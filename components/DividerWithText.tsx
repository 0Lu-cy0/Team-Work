import React from "react";
import { View, StyleSheet, ViewStyle, Text } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";

interface DividerWithTextProps {
  text: JSX.Element | string; // Có thể truyền string hoặc JSX.Element
  containerStyle?: ViewStyle; // Style cho toàn bộ container
  lineStyle?: ViewStyle; // Style cho line
}
const DividerWithText: React.FC<DividerWithTextProps> = ({
  text,
  containerStyle,
}) => {

  const { colors } = useThemeContext();
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.line, { backgroundColor: colors.border, borderColor: colors.border }]} />
      <View>{typeof text === "string" ? <Text>{text}</Text> : text}</View>
      <View style={[styles.line, { backgroundColor: colors.border, borderColor: colors.border }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Hiển thị ngang
    alignItems: "center", // Căn giữa theo chiều dọc
    justifyContent: "space-between", // Đẩy 2 line về 2 bên
    width: "100%", // Chiếm toàn bộ chiều rộng
  },
  line: {
    borderWidth: 1,
    width: 100,
    height: 0,
  },
});

export default DividerWithText;
