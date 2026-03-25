import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LANGUAGE_OPTIONS, useLanguage } from '../context/LanguageContext';
import { NeonButton } from '../components/NeonButton';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../styles/futurist';

export const LanguageScreen = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { language, setLanguage } = useLanguage();
    const [selectedCode, setSelectedCode] = useState(language.code);

    const handleSave = () => {
        setLanguage(selectedCode);
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Language</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.groupList}>
                        {LANGUAGE_OPTIONS.map((item) => {
                            const isSelected = selectedCode === item.code;
                            return (
                                <TouchableOpacity
                                    key={item.code}
                                    activeOpacity={0.9}
                                    onPress={() => setSelectedCode(item.code)}
                                    style={[
                                        styles.languageRow,
                                        {
                                            backgroundColor: colors.surface,
                                            shadowColor: colors.shadow,
                                        },
                                    ]}
                                >
                                    <View style={styles.languageLeft}>
                                        <Text style={styles.flag}>{item.flag}</Text>
                                        <Text style={[styles.languageText, { color: colors.text }]}>{item.label}</Text>
                                    </View>
                                    {isSelected ? (
                                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                    ) : (
                                        <Ionicons name="ellipse-outline" size={20} color={colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <NeonButton title="Save" onPress={handleSave} />
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    backButton: {
        minWidth: 28,
        minHeight: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -6,
    },
    headerTitle: {
        ...FONTS.h3,
    },
    content: {
        padding: 24,
        paddingBottom: 36,
    },
    groupList: {
        gap: 10,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 8,
    },
    languageRow: {
        minHeight: 64,
        borderRadius: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    languageLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flag: {
        fontSize: 24,
    },
    languageText: {
        ...FONTS.bodyStrong,
    },
});
