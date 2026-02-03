import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DARK_COLORS, LIGHT_COLORS } from '../styles/futurist';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
    mode: ThemeMode;
    colors: typeof DARK_COLORS;
    setMode: (mode: ThemeMode) => void;
    isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>('system');

    const isSystemDark = systemScheme === 'dark';
    const isDark = mode === 'system' ? isSystemDark : mode === 'dark';

    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

    return (
        <ThemeContext.Provider value={{ mode, colors, setMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
