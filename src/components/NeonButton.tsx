import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FONTS, RADIUS } from '../styles/futurist';
import { useTheme } from '../context/ThemeContext';

interface NeonButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    variant?: 'primary' | 'secondary' | 'danger';
    animate?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
    title,
    onPress,
    style,
    variant = 'primary',
}) => {
    const { colors } = useTheme();

    const variantStyles = {
        primary: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            textColor: colors.white,
        },
        secondary: {
            backgroundColor: colors.surfaceHighlight,
            borderColor: colors.border,
            textColor: colors.text,
        },
        danger: {
            backgroundColor: colors.danger,
            borderColor: colors.danger,
            textColor: colors.white,
        },
    }[variant];

    const handlePress = () => {
        Haptics.selectionAsync();
        onPress();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePress}
            style={[
                styles.container,
                {
                    backgroundColor: variantStyles.backgroundColor,
                    borderColor: variantStyles.borderColor,
                },
                style,
            ]}
        >
            <Text style={[styles.text, { color: variantStyles.textColor }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 56,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    text: {
        ...FONTS.h3,
    },
});
