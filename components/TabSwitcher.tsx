import React, { useRef, useState } from 'react';
import { View, Pressable, Animated, Dimensions } from 'react-native';
import CustomText from '../constants/CustomText';
import styles from '../styles/messages';
// import responsive from './reponsive';

type TabType = 'chat' | 'groups';
const { width } = Dimensions.get('window');

interface TabSwitcherProps {
    selected: TabType;
    setSelected: (tab: TabType) => void;
    onSwitchTab: (tab: TabType) => void;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ selected, setSelected, onSwitchTab }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const translateX = useRef(new Animated.Value(29)).current;

    const switchTab = (tab: TabType) => {
        if (selected !== tab && !isAnimating) {
            setIsAnimating(true);
            const isChat = tab === 'chat';

            // Đồng bộ cả hai animation
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: isChat ? 29 : 224,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setSelected(tab);
                setIsAnimating(false);
            });
            onSwitchTab(tab);
        }
    };
    return (
        <View style={styles.tabContainer}>
            <Animated.View style={[styles.highlightTab, { transform: [{ translateX }] }]} />
            <Pressable style={styles.chatButton} onPress={() => switchTab('chat')}>
                <CustomText fontFamily="InterMedium" fontSize={14} style={selected === 'chat' ? { color: 'black' } : { color: 'white' }}>
                    Chat
                </CustomText>
            </Pressable>
            <Pressable style={styles.groupsButton} onPress={() => switchTab('groups')}>
                <CustomText fontFamily="InterMedium" fontSize={14} style={selected === 'groups' ? { color: 'black' } : { color: 'white' }}>
                    Groups
                </CustomText>
            </Pressable>
        </View>
    );
};


export default TabSwitcher;
