import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import CustomText from "../constants/CustomText";
import { useThemeContext } from '../context/ThemeContext';
export default function ResizableLogoBox() {
    const route = useRoute();
    const { colors } = useThemeContext();

    // Xác định kích thước hộp dựa trên route
    const getBoxStyle = () => {
        if (route.name === "index") {
            return {
                width: 94.06,
                height: 61.5,
            };
        } else if (route.name === "(auth)/login" || route.name === "(auth)/register") {
            return {
                width: 139,
                height: 91.92,
            };
        }
        return {};
    };

    const boxStyle = getBoxStyle();

    // Tỷ lệ ảnh và dòng chữ
    const imageWidthRatio = 91.22 / 139; // ~0.656
    const imageHeightRatio = 71.38 / 91.22; // ~0.783
    const textFontRatio = 14 / 139; // FontSize dòng chữ

    // Tính kích thước ảnh và font size dòng chữ dựa trên tỷ lệ
    const imageWidth = (boxStyle.width || 0) * imageWidthRatio;
    const imageHeight = imageWidth * imageHeightRatio;
    const fontSize = (boxStyle.width || 0) * textFontRatio;
    const textFontSize = (boxStyle.width || 0) * 0.255; // Font size lớn hơn cho DayTask

    return (
        <View style={[styles.box, boxStyle]}>
            {/* Ảnh */}
            <Image
                source={require("@/assets/images/Logo/LogoSplash.png")}
                style={{
                    width: imageWidth,
                    height: imageHeight,
                }}
            />
            {/* Dòng chữ */}
            <Text
                style={{
                    width: boxStyle.width, // Chiều ngang bằng hộp
                    textAlign: "center",
                    fontSize: fontSize, // Responsive fontSize
                    fontFamily: 'Montserrat', // Font chung cho cả chữ
                    transform: [{ scaleX: 1.3 }, { translateX: 0 }],
                }}
            >
                <CustomText fontSize={textFontSize} >
                    <Text style={{ color: colors.textColor, fontWeight: '600' }}>Day</Text>
                    <Text style={{ color: '#FED36A', fontWeight: '600' }}>Task</Text>
                </CustomText>
            </Text>
        </View>
    );
}


const styles = StyleSheet.create({
    box: {
        justifyContent: "center",
        alignItems: "center",
    }
});
