import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'dark' | 'light';

interface ThemeHook {
  theme: Theme;
  toggleTheme: () => void;
}

const useTheme = (): ThemeHook => {
  const [theme, setTheme] = useState<Theme>('dark');

  // Lấy theme từ AsyncStorage khi khởi tạo
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as Theme);
        }
      } catch (error) {
        console.error('Error loading theme from AsyncStorage:', error);
        // Nếu có lỗi, giữ mặc định là 'dark'
      }
    };
    loadTheme();
  }, []);

  // Hàm toggle theme và lưu vào AsyncStorage
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  return { theme, toggleTheme };
};

export default useTheme;