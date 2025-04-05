import React from "react";
import { View, StyleSheet, ViewStyle, Text } from "react-native";

interface DividerWithTextProps {
  text: JSX.Element | string; // Có thể truyền string hoặc JSX.Element
  containerStyle?: ViewStyle; // Style cho toàn bộ container
  lineStyle?: ViewStyle; // Style cho line
}

const DividerWithText: React.FC<DividerWithTextProps> = ({
  text,
  containerStyle,
  lineStyle
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.line, lineStyle]} />
      <View>{typeof text === "string" ? <Text>{text}</Text> : text}</View>
      <View style={[styles.line, lineStyle]} />
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
    borderColor: "#8CAAB9",
    backgroundColor: "#8CAAB9",
    width: 111,
    height: 0,
  },
});

export default DividerWithText;
