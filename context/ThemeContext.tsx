// context/ThemeContext.tsx
import React, { createContext, useContext } from 'react';
import useTheme from '../hooks/useTheme';
import themes, { ThemeType } from '../styles/theme';

interface ThemeContextType {
    theme: ThemeType;
    toggleTheme: () => void;
    colors: typeof themes.dark;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const colors = themes[theme];

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};