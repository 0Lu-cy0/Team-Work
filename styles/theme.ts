// theme.ts
export type ThemeType = 'dark' | 'light';

interface ThemeColors {
    backgroundColor: string;
    button: string;
    input: string;
    border: string;
    tittle: string;
    // textColor: string;
    // secondaryTextColor: string;
    // accentColor: string;
    // cardBackground: string;
    // borderColor: string;
}

interface Themes {
    dark: ThemeColors;
    light: ThemeColors;
}

const themes: Themes = {
    dark: {
        backgroundColor: '#212832', // Màu nền tối
        textColor: '#000',
        secondaryTextColor: '#b0b0b0', // Màu chữ phụ
        accentColor: '#f5c518', // Màu vàng làm điểm nhấn
        cardBackground: '#2a2a2a', // Màu nền cho card
        borderColor: '#444444', // Màu viền
    },
    light: {
        backgroundColor: '#f5f5f5', // Màu nền sáng
        textColor: '#fff',
        secondaryTextColor: '#666666', // Màu chữ phụ
        accentColor: '#f5c518', // Màu vàng giữ nguyên làm điểm nhấn
        cardBackground: '#ffffff', // Màu nền cho card
        borderColor: '#dddddd', // Màu viền
    },
};

export default themes;