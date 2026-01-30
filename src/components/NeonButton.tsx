import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../styles/futurist';
import * as Haptics from 'expo-haptics';

interface NeonButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    variant?: 'primary' | 'secondary' | 'danger';
}

export const NeonButton: React.FC<NeonButtonProps> = ({ title, onPress, style, variant = 'primary' }) => {
    const glowOpacity = useSharedValue(0.5);

    const baseColor = variant === 'secondary' ? COLORS.secondary : variant === 'danger' ? COLORS.danger : COLORS.primary;

    useEffect(() => {
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 1500 }),
                withTiming(0.4, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedGlow = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        shadowColor: baseColor,
        shadowRadius: glowOpacity.value * 20,
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onPress();
    };

    return (
        <Animated.View style={[styles.wrapper, animatedGlow, style]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
                <LinearGradient
                    colors={[baseColor + '40', 'transparent']} // Hex+Alpha
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.container, { borderColor: baseColor }]}
                >
                    <Text style={[styles.text, { color: baseColor }]}>{title}</Text>
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
