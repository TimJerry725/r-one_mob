import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, FONTS } from '../styles/futurist';

import { useTheme } from '../context/ThemeContext';

interface NeonInputProps {
    label: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const NeonInput: React.FC<NeonInputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    style
}) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <View style={[
                styles.inputWrapper,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                },
                isFocused && {
                    ...styles.inputWrapperFocused, // Keep static shadow logic
                    borderColor: colors.primary, // Override with theme color
                    shadowColor: colors.primary
                }
            ]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary + '80'}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        ...FONTS.body,
        fontSize: 14,
        color: COLORS.white,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        height: 50,
        justifyContent: 'center',
    },
    inputWrapperFocused: {
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    input: {
        ...FONTS.body,
        color: COLORS.white,
        paddingHorizontal: 16,
        height: '100%',
    }
});
