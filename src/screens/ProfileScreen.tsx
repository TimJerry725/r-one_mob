import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../styles/futurist';

export const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, mode, setMode } = useTheme();
    const { language } = useLanguage();

    const ThemeOption = ({ label, value, icon }: { label: string; value: 'light' | 'dark'; icon: any }) => (
        <TouchableOpacity
            onPress={() => setMode(value)}
            style={[
                styles.themeOption,
                {
                    backgroundColor: mode === value ? colors.primary : colors.surfaceHighlight,
                    borderColor: mode === value ? colors.primary : colors.border,
                },
            ]}
        >
            <Ionicons name={icon} size={20} color={mode === value ? colors.white : colors.text} />
            <Text style={[styles.themeOptionText, { color: mode === value ? colors.white : colors.text }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.pageTitle, { color: colors.text }]}>Profile</Text>

                    <View style={[styles.profileCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.avatarText, { color: colors.white }]}>T</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.name, { color: colors.text }]}>Timothy</Text>
                            <Text style={[styles.role, { color: colors.textSecondary }]}>Field technician</Text>
                        </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
                        <View style={styles.themeRow}>
                            <ThemeOption label="Light" value="light" icon="sunny-outline" />
                            <ThemeOption label="Dark" value="dark" icon="moon-outline" />
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Language')}
                        style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                    >
                        <View style={styles.languageRow}>
                            <View>
                                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 4 }]}>Language</Text>
                                <Text style={[styles.languageValue, { color: colors.textSecondary }]}>
                                    {language.flag} {language.label}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.logoutButton, { borderColor: colors.danger }]}
                        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] })}
                    >
                        <Text style={[styles.logoutText, { color: colors.danger }]}>Log out</Text>
                    </TouchableOpacity>
                </ScrollView>
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
    content: {
        padding: 24,
        paddingBottom: 36,
    },
    pageTitle: {
        ...FONTS.h1,
        marginBottom: 18,
    },
    profileCard: {
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        gap: 14,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    avatar: {
        width: 68,
        height: 68,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...FONTS.h2,
        fontSize: 28,
    },
    name: {
        ...FONTS.h2,
        marginBottom: 4,
    },
    role: {
        ...FONTS.body,
        marginBottom: 6,
    },
    card: {
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    sectionTitle: {
        ...FONTS.h3,
        marginBottom: 14,
    },
    themeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    languageValue: {
        ...FONTS.body,
    },
    themeOption: {
        flex: 1,
        minHeight: 70,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    themeOptionText: {
        ...FONTS.caption,
        fontSize: 12,
    },
    logoutButton: {
        minHeight: 56,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    logoutText: {
        ...FONTS.bodyStrong,
    },
});
