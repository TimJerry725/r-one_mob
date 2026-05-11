import React from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { FONTS, RADIUS, getInputShellStyle } from '../styles/futurist';
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
    style,
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <View style={[styles.inputWrapper, getInputShellStyle(colors)]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 18,
    },
    label: {
        ...FONTS.label,
        marginBottom: 8,
    },
    inputWrapper: {
        minHeight: 56,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 8 },
    },
    input: {
        ...FONTS.body,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
});
