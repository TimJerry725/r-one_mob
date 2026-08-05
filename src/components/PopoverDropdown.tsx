import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Dimensions } from 'react-native';
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
    onDone?: () => void;
    placement?: 'bottom' | 'top';
}

export const PopoverDropdown: React.FC<PopoverDropdownProps> = ({
    label,
    placeholder,
    options,
    value,
    onSelect,
    isMulti = false,
    onDone,
    placement = 'bottom',
}) => {
    const { colors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = React.useRef<any>(null);
    const [dropdownLayout, setDropdownLayout] = useState<{x: number, y: number, width: number, height: number} | null>(null);

    const toggleOpen = () => {
        if (!isOpen) {
            buttonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
                setDropdownLayout({ x, y, width, height });
                setIsOpen(true);
            });
        } else {
            setIsOpen(false);
        }
    };

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
                ref={buttonRef}
                style={[styles.dropdownButton, getInputShellStyle(colors), { marginBottom: 12 }]} 
                onPress={toggleOpen}
            >
                <Text style={{ color: hasValue ? colors.text : colors.textSecondary, ...FONTS.body }}>
                    {getDisplayText()}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {isOpen && dropdownLayout && (
                <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
                    <TouchableOpacity
                        style={[styles.overlay, { backgroundColor: 'transparent', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }]}
                        activeOpacity={1}
                        onPress={() => setIsOpen(false)}
                    />
                    <View style={[
                        styles.dropdownMenu, 
                        { 
                            position: 'absolute',
                            left: dropdownLayout.x,
                            width: dropdownLayout.width,
                            ...(placement === 'top' 
                                ? { bottom: Dimensions.get('window').height - dropdownLayout.y + 4 } 
                                : { top: dropdownLayout.y + dropdownLayout.height + 4 }
                            ),
                            backgroundColor: colors.surfaceHighlight, 
                            borderColor: colors.border, 
                            shadowColor: colors.shadow 
                        }
                    ]}>
                        <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
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
                        {onDone && (
                            <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                                <TouchableOpacity 
                                    style={{ 
                                        backgroundColor: colors.primary, 
                                        minHeight: 40,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingHorizontal: 16
                                    }} 
                                    onPress={() => {
                                        setIsOpen(false);
                                        onDone();
                                    }}
                                >
                                    <Text style={{ color: colors.white || '#FFFFFF', ...FONTS.bodyStrong, fontSize: 14 }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Modal>
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
        minHeight: 40,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    overlay: {
        position: 'absolute',
        top: -3000,
        bottom: -3000,
        left: -3000,
        right: -3000,
        zIndex: 999,
    },
    dropdownMenu: {
        borderRadius: 12,
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
        padding: 8,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    }
});
