import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS } from '../styles/futurist';

import { useTheme } from '../context/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = 20 }) => {
    const { colors, isDark } = useTheme();

    return (
        <View style={[
            styles.container,
            {
                borderColor: colors.border,
                backgroundColor: isDark ? 'rgba(10, 10, 20, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            },
            style
        ]}>
            <BlurView intensity={intensity} tint={isDark ? "dark" : "light"} style={styles.blur}>
                <View style={styles.content}>
                    {children}
                </View>
                {/* Corner Accents */}
                <View style={[styles.cornerTopLeft, { borderColor: colors.primary }]} />
                <View style={[styles.cornerBottomRight, { borderColor: colors.primary }]} />
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        backgroundColor: 'rgba(10, 10, 20, 0.6)',
    },
    blur: {
        padding: 0,
    },
    content: {
        padding: 20,
        zIndex: 1,
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 20,
        height: 20,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderColor: COLORS.primary,
        borderTopLeftRadius: 16,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: COLORS.primary,
        borderBottomRightRadius: 16,
    },
});
