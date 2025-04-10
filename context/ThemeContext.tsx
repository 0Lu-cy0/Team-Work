import React, { createContext, useContext } from 'react';
import useTheme from '../hooks/useTheme';
import themes, { ThemeType } from '../styles/theme';
import * as icons from '../styles/icons';

interface ThemeContextType {
    theme: ThemeType;
    toggleTheme: () => void;
    colors: typeof themes.dark;
    icons: typeof icons;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const colors = themes[theme];

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors, icons }}>
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