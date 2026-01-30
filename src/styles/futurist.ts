import { StyleSheet, Platform } from 'react-native';

export const COLORS = {
    background: '#050510',
    surface: 'rgba(20, 20, 40, 0.7)',
    surfaceHighlight: 'rgba(40, 40, 80, 0.5)',
    primary: '#00F0FF', // Cyber Cyan
    secondary: '#FF00FF', // Neon Magenta
    onBackground: '#FFFFFF',
    onSurface: '#E0E0E0',
    success: '#00FF9D',
    warning: '#FFEA00',
    danger: '#FF2A6D',
    border: 'rgba(0, 240, 255, 0.3)',
};

export const FONTS = {
    h1: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 32,
        fontWeight: '700' as '700',
        color: COLORS.onBackground,
        letterSpacing: 1.5,
    },
    h2: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 24,
        fontWeight: '600' as '600',
        color: COLORS.primary,
        letterSpacing: 1.2,
        textTransform: 'uppercase' as 'uppercase',
    },
    body: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontSize: 16,
        color: COLORS.onSurface,
    },
    label: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        fontWeight: '700' as '700',
        color: 'rgba(255, 255, 255, 0.6)',
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    glowBox: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
});
