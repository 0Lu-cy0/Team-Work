import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import CustomText from '@/constants/CustomText'; // Import CustomText
import { useThemeContext } from '@/context/ThemeContext';

interface CompletedCircleProps {
    radius?: number; // Bán kính hình tròn (mặc định 24)
    strokeWidth?: number; // Độ dày đường viền (mặc định 2)
    progress: number; // % hoàn thành
    size?: number; // Kích thước tổng của SVG (mặc định 59)
    containerStyle?: ViewStyle; // Style tùy chỉnh cho container bên ngoài
}

const CompletedCircle: React.FC<CompletedCircleProps> = ({
    radius = 24,
    strokeWidth = 2,
    progress,
    size = 59,
    containerStyle,
}) => {
    const circumference = 2 * Math.PI * radius; // Chu vi hình tròn
    const offset = circumference - (progress / 100) * circumference; // Tính toán độ lệch của vòng cung
    const rotationAngle = progress; // Tính toán góc xoay dựa trên phần trăm hoàn thành
    const { colors } = useThemeContext();

    return (
        <View style={[{ width: size, height: size }, containerStyle]}>
            <Svg height={size} width={size}>
                {/* Nền vòng tròn */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.circle2}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Vòng cung */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.circle1}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    rotation={rotationAngle} // Góc xoay dựa trên phần trăm hoàn thành
                    origin={`${size / 2}, ${size / 2}`} // Đặt tâm vòng tròn
                />
            </Svg>
            {/* Hiển thị phần trăm */}
            <CustomText
                fontFamily="Inter"
                fontSize={radius * 0.4}
                style={{
                    color: colors.text5,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: [{ translateX: -radius * 0.4 }, { translateY: -radius * 0.3 }],
                }}
            >
                {`${progress}%`}
            </CustomText>
        </View>
    );
};

export default CompletedCircle;
