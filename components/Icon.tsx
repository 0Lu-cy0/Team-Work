import React from 'react';
import { Image, ImageProps, ImageStyle } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import icons, { Icons, IconGroup, IconItem } from '../styles/icons';

type IconCategory = keyof Icons;

interface IconProps<T extends IconCategory> extends Partial<ImageProps> {
    category: T;
    name?: T extends 'splash' | 'logo' | 'avatar' ? never : keyof IconGroup;
    style?: ImageStyle;
}

// Type guard để kiểm tra IconItem
const isIconItem = (item: IconGroup | IconItem): item is IconItem => {
    return 'light' in item && 'dark' in item && Object.keys(item).length === 2;
};

const Icon = <T extends IconCategory>({
    category,
    name,
    style = { width: 24, height: 24 }, // Giá trị mặc định
    ...rest
}: IconProps<T>) => {
    const { theme = 'light' } = useThemeContext(); // Fallback nếu theme undefined

    const iconSet: IconGroup | IconItem = icons[category];

    // Kiểm tra nếu category không tồn tại
    if (!iconSet) {
        console.warn(`Icon category "${category}" not found in icons`);
        return null; // Trả về null nếu không tìm thấy category
    }

    let iconSource;
    if (isIconItem(iconSet)) {
        // Trường hợp IconItem (splash, logo, avatar)
        iconSource = iconSet[theme];
    } else {
        // Trường hợp IconGroup (screens, v.v.)
        if (!name || !iconSet[name as keyof IconGroup]) {
            console.warn(`Icon name "${name}" not found in category "${category}"`);
            return null; // Trả về null nếu name không hợp lệ
        }
        iconSource = (iconSet as IconGroup)[name as keyof IconGroup][theme];
    }

    // Kiểm tra nếu iconSource không hợp lệ
    if (!iconSource) {
        console.warn(`Icon source not found for category "${category}", name "${name}", theme "${theme}"`);
        return null; // Trả về null nếu không tìm thấy source
    }

    return <Image source={iconSource} style={style} {...rest} />;
};

export default Icon;
export { IconCategory };