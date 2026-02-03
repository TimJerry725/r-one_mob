import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../styles/futurist';

export const ProfileScreen = () => {
    const { colors, mode, setMode } = useTheme();

    const ThemeOption = ({ label, value, icon }: { label: string, value: 'light' | 'dark' | 'system', icon: any }) => (
        <TouchableOpacity
            style={[
                styles.themeOption,
                {
                    backgroundColor: mode === value ? colors.primary : colors.surfaceHighlight,
                    borderColor: colors.border
                }
            ]}
            onPress={() => setMode(value)}
        >
            <Ionicons
                name={icon}
                size={20}
                color={mode === value ? colors.white : colors.textSecondary}
            />
            <Text style={[
                styles.themeOptionText,
                { color: mode === value ? colors.white : colors.textSecondary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* User Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.avatar, { backgroundColor: colors.surfaceHighlight }]}>
                            <Ionicons name="person" size={40} color={colors.primary} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.name, { color: colors.text }]}>Tim User</Text>
                            <Text style={[styles.email, { color: colors.textSecondary }]}>tim@irissuite.com</Text>
                        </View>
                    </View>

                    {/* Appearance Section */}
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>

                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.cardLabel, { color: colors.text }]}>Theme</Text>

                        <View style={styles.themeSelector}>
                            <ThemeOption label="Light" value="light" icon="sunny" />
                            <ThemeOption label="Dark" value="dark" icon="moon" />
                            <ThemeOption label="System" value="system" icon="phone-portrait" />
                        </View>
                    </View>

                    {/* Other Settings placeholders */}
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>GENERAL</Text>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.menuRow}>
                            <Ionicons name="notifications-outline" size={22} color={colors.text} />
                            <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.menuRow}>
                            <Ionicons name="shield-checkmark-outline" size={22} color={colors.text} />
                            <Text style={[styles.menuText, { color: colors.text }]}>Privacy & Security</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.danger }]}>
                        <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
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
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0)', // Invisible for now
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
        borderWidth: 1,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
        marginLeft: 4,
        letterSpacing: 1,
    },
    card: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    themeSelector: {
        flexDirection: 'row',
        gap: 10,
    },
    themeOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    themeOptionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    logoutText: {
        fontWeight: '600',
        fontSize: 16,
    },
});
