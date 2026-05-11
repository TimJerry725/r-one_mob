import { StyleSheet } from 'react-native';

export const DARK_COLORS = {
    background: '#0B141B',
    surface: '#13202A',
    surfaceHighlight: '#1C2D3A',
    inputBorder: 'rgba(244, 247, 251, 0.28)',
    primary: '#E23151',
    primaryLight: '#FF4D6D',
    secondary: '#4CA7FF',
    danger: '#FF6B57',
    success: '#43D39E',
    warning: '#FFD166',
    text: '#F4F7FB',
    textSecondary: '#9CB0C2',
    border: '#243645',
    white: '#FFFFFF',
    black: '#000000',
    onBackground: '#F4F7FB',
    onSurface: '#F4F7FB',
    muted: '#6F8393',
    overlay: 'rgba(8, 12, 16, 0.82)',
    overlayStrong: 'rgba(8, 12, 16, 0.92)',
    cardAlt: '#172631',
    shadow: '#000000',
};

export const LIGHT_COLORS = {
    background: '#EDF2F6',
    surface: '#FFFFFF',
    surfaceHighlight: '#E0E8EF',
    inputBorder: '#CDD8E1',
    primary: '#E23151',
    primaryLight: '#FF4D6D',
    secondary: '#005EB8',
    danger: '#C2382A',
    success: '#1A8C5F',
    warning: '#9A6500',
    text: '#14212B',
    textSecondary: '#5E7385',
    border: '#C8D4DE',
    white: '#FFFFFF',
    black: '#000000',
    onBackground: '#14212B',
    onSurface: '#14212B',
    muted: '#7A8C9B',
    overlay: 'rgba(237, 242, 246, 0.9)',
    overlayStrong: 'rgba(237, 242, 246, 0.96)',
    cardAlt: '#F5F8FB',
    shadow: '#0C141A',
};

export const COLORS = DARK_COLORS;

export const getInputShellStyle = (colors: typeof DARK_COLORS) => ({
    backgroundColor: 'transparent' as const,
    borderWidth: 0.5,
    borderColor: colors.inputBorder,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
});

export const SPACING = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 18,
    pill: 999,
};

export const FONTS = {
    h1: {
        fontFamily: 'RedHatDisplay_700Bold',
        fontSize: 30,
        lineHeight: 36,
    },
    h2: {
        fontFamily: 'RedHatDisplay_700Bold',
        fontSize: 22,
        lineHeight: 28,
    },
    h3: {
        fontFamily: 'RedHatDisplay_600SemiBold',
        fontSize: 18,
        lineHeight: 24,
    },
    body: {
        fontFamily: 'RedHatDisplay_400Regular',
        fontSize: 15,
        lineHeight: 22,
    },
    bodyStrong: {
        fontFamily: 'RedHatDisplay_600SemiBold',
        fontSize: 15,
        lineHeight: 22,
    },
    label: {
        fontFamily: 'RedHatDisplay_700Bold',
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.8,
        textTransform: 'uppercase' as const,
    },
    caption: {
        fontFamily: 'RedHatDisplay_500Medium',
        fontSize: 13,
        lineHeight: 18,
    },
};

export const COMMON_STYLES = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    screenPadding: {
        paddingHorizontal: SPACING.xl,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
});
