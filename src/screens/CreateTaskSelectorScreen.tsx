import React, { useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../styles/futurist';
import { getSelectorOptions, SelectorResult, SelectorSheetType } from '../data/createTaskOptions';

export const CreateTaskSelectorScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const selectorType = (route.params?.selectorType ?? 'station') as SelectorSheetType;
    const selectedValue = (route.params?.selectedValue ?? '') as string;
    const returnScreen = (route.params?.returnScreen ?? 'CreateTask') as string;

    const selectorConfig = useMemo(() => getSelectorOptions(selectorType), [selectorType]);

    const handleSelect = (value: string) => {
        const selectorResult: SelectorResult = {
            type: selectorType,
            value,
            token: Date.now(),
        };

        navigation.navigate({
            name: returnScreen,
            params: { selectorResult },
            merge: true,
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => navigation.goBack()} />
            <View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: colors.background,
                        paddingBottom: Math.max(insets.bottom, 12),
                        shadowColor: colors.shadow,
                    },
                ]}
            >
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>{selectorConfig.title}</Text>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.closeButton, { backgroundColor: colors.surfaceHighlight }]}
                    >
                        <Ionicons name="close" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                    {selectorConfig.options.map((option) => {
                        const isSelected = selectedValue === option.value;

                        return (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.option,
                                    {
                                        backgroundColor: isSelected ? colors.surfaceHighlight : 'transparent',
                                        borderBottomColor: colors.border,
                                    },
                                ]}
                                onPress={() => handleSelect(option.value)}
                            >
                                <View style={styles.optionContent}>
                                    <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                                    {option.meta ? (
                                        <View style={[styles.metaChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{option.meta}</Text>
                                        </View>
                                    ) : null}
                                </View>
                                {isSelected ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        maxHeight: '62%',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 14,
    },
    handle: {
        width: 44,
        height: 4,
        borderRadius: 999,
        alignSelf: 'center',
        marginBottom: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    title: {
        ...FONTS.h3,
    },
    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    option: {
        minHeight: 56,
        borderRadius: 14,
        borderBottomWidth: 1,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingRight: 12,
    },
    optionText: {
        ...FONTS.bodyStrong,
    },
    metaChip: {
        minHeight: 28,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaText: {
        ...FONTS.label,
        fontSize: 10,
    },
});
