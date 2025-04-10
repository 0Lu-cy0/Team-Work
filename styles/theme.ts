// theme.ts
export type ThemeType = 'dark' | 'light';

interface ThemeColors {
    backgroundColor: string;
    box1: string;
    box2: string;
    box3: string;
    boxMenu: string;
    boxAdd: string;
    border: string;
    text1: string;
    text2: string;
    text3: string;
    text4: string;
    text5: string;
    text6: string;
    textChat: string;
    textNoti: string;
    loading: string;
}

interface Themes {
    dark: ThemeColors;
    light: ThemeColors;
}

const themes: Themes = {
    dark: {
        backgroundColor: '#212832', // Màu nền tối
        box1: '#FED36A', //
        box2: '#455A64',
        box3: '#263238',
        boxMenu: '#263238',
        boxAdd: '#FED36A',
        border: '#FFFFFF',
        text1: '#FFFFFF',
        text2: '#FED36A',
        text3: '#BCCFD8',
        text4: '#000000',
        text5: '#FFFFFF',
        text6: '#212832',
        textChat: '#B8B8B8',
        textNoti: '#8CAAB9',
        loading: '#887036'
    },
    light: {
        backgroundColor: '#FFE9B2', // Màu nền sáng
        box1: '#FBC02F',
        box2: '#FFFFFF',
        box3: '#FFFFFF',
        boxMenu: '#FFBF33',
        boxAdd: '#E6A400',
        border: '#000000',
        text1: '#2C4653',
        text2: '#FBC02F',
        text3: '#204A5E',
        text4: '#FFFFFF',
        text5: '#000000',
        text6: '#FFFFFF',
        textChat: '#204A5E',
        textNoti: '#204A5E',
        loading: '#BA8F24'
    },
};

export default themes;