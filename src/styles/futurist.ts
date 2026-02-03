import { StyleSheet, Platform } from 'react-native';

export const DARK_COLORS = {
    background: '#0D0D12',
    surface: '#1A1A24',
    surfaceHighlight: '#262636',
    primary: '#E23151',
    primaryLight: '#FF4D6D',
    secondary: '#C4D661',
    danger: '#FF6B6B',
    success: '#4ADE80',
    warning: '#FFD166',
    text: '#FFFFFF',
    textSecondary: '#A0A0B0',
    border: 'rgba(255, 255, 255, 0.1)',
    white: '#FFFFFF',
    black: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
};

export const LIGHT_COLORS = {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceHighlight: '#E5E5EA',
    primary: '#E23151',
    primaryLight: '#FF4D6D',
    secondary: '#C4D661',
    danger: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: 'rgba(0, 0, 0, 0.1)',
    white: '#FFFFFF',
    black: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
};

export const COLORS = DARK_COLORS; // Fallback


export const FONTS = {
    h1: {
        fontSize: 28,
        fontWeight: '700' as '700',
        color: '#FFFFFF',
    },
    h2: {
        fontSize: 20,
        fontWeight: '600' as '600',
        color: '#FFFFFF',
    },
    body: {
        fontSize: 14,
        color: '#A0A0B0',
    },
    label: {
        fontSize: 12,
        fontWeight: '700' as '700',
        color: '#A0A0B0',
        textTransform: 'uppercase' as 'uppercase',
    },
};

export const COMMON_STYLES = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    glassCard: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
    },
});
