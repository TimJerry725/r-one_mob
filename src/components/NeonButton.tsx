import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../styles/futurist';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

interface NeonButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    variant?: 'primary' | 'secondary' | 'danger';
    animate?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ title, onPress, style, variant = 'primary', animate = true }) => {
    const { colors } = useTheme();
    const glowOpacity = useRef(new Animated.Value(0.5)).current;

    const baseColor = variant === 'secondary' ? colors.secondary : variant === 'danger' ? colors.danger : colors.primary;

    useEffect(() => {
        if (!animate) {
            glowOpacity.setValue(1);
            return;
        }

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowOpacity, {
                    toValue: 0.8,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 0.4,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [animate]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onPress();
    };

    return (
        <Animated.View style={[
            styles.wrapper,
            style,
            {
                opacity: glowOpacity,
                shadowColor: baseColor,
                shadowRadius: 10,
            }
        ]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
                <LinearGradient
                    colors={[baseColor, baseColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.container, { borderColor: baseColor }]}
                >
                    <Text style={[styles.text, { color: colors.white }]}>{title}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        elevation: 8,
    },
    container: {
        borderWidth: 2,
        borderRadius: 8, // Sharper corners for sci-fi look
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    text: {
        ...FONTS.h2,
        fontSize: 16,
        letterSpacing: 2,
    },
});
