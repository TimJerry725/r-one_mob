import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, getInputShellStyle } from '../styles/futurist';

interface PopoverDropdownProps {
    label: string;
    placeholder: string;
    options: { label: string; value: string }[];
    value: string | string[];
    onSelect: (value: string | string[]) => void;
    isMulti?: boolean;
}

export const PopoverDropdown: React.FC<PopoverDropdownProps> = ({
    label,
    placeholder,
    options,
    value,
    onSelect,
    isMulti = false,
}) => {
    const { colors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const getDisplayText = () => {
        if (isMulti && Array.isArray(value)) {
            if (value.length === 0) return placeholder;
            const labels = value.map(v => options.find(o => o.value === v)?.label || v);
            return labels.join(', ');
        }
        if (!isMulti && typeof value === 'string' && value !== '') {
            return options.find(o => o.value === value)?.label || value;
        }
        return placeholder;
    };

    const hasValue = isMulti && Array.isArray(value) ? value.length > 0 : value !== '';

    return (
        <View style={{ zIndex: isOpen ? 1000 : 1 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {label.startsWith('*') ? (
                    <>
                        <Text style={{ color: colors.danger }}>* </Text>
                        {label.substring(1).trim()}
                    </>
                ) : (
                    label
                )}
            </Text>
            <TouchableOpacity 
                style={[styles.dropdownButton, getInputShellStyle(colors), { marginBottom: 12 }]} 
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={{ color: hasValue ? colors.text : colors.textSecondary, ...FONTS.body }}>
                    {getDisplayText()}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {isOpen && (
                <View style={[
                    styles.dropdownMenu, 
                    { 
                        backgroundColor: colors.surfaceHighlight, 
                        borderColor: colors.primary, 
                        shadowColor: colors.primary 
                    }
                ]}>
                    <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                        {options.map((option, idx, arr) => {
                            const isSelected = isMulti && Array.isArray(value)
                                ? value.includes(option.value)
                                : value === option.value;
                            
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.dropdownItem,
                                        isSelected && { backgroundColor: 'rgba(255,255,255,0.03)' }
                                    ]}
                                    onPress={() => {
                                        if (isMulti && Array.isArray(value)) {
                                            onSelect(isSelected ? value.filter(v => v !== option.value) : [...value, option.value]);
                                        } else {
                                            onSelect(option.value);
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    <Text style={{ color: colors.text, ...FONTS.body }}>{option.label}</Text>
                                    {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputLabel: {
        ...FONTS.label,
        marginBottom: 8,
        marginTop: 6,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 52,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 74,
        left: 0,
        right: 0,
        borderRadius: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        zIndex: 1000,
        paddingVertical: 8,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    }
});
