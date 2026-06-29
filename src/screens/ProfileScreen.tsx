import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../styles/futurist';

export const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, mode, setMode } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* User Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
                                <View style={[styles.avatarInitialsCircle, { backgroundColor: colors.primary }]}>
                                    <Text style={[styles.avatarInitialsText, { color: colors.white }]}>TF</Text>
                                </View>
                            </View>
                            <View style={[styles.statusDot, { backgroundColor: colors.success, borderColor: colors.surface }]} />
                        </View>
                        <View style={styles.profileDetails}>
                            <Text style={[styles.name, { color: colors.text }]}>Timothy Field</Text>
                            <View style={styles.metaRow}>
                                <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.metaText, { color: colors.textSecondary }]}>timothy.field@example.com</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.metaText, { color: colors.textSecondary }]}>+91 98765 43210</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section: Preferences */}
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
                    <View style={styles.groupContainer}>
                        {/* Appearance Segment Selector with Map Screen styling */}
                        <View style={[styles.settingsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.rowLabelContainer}>
                                <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '12' }]}>
                                    <Ionicons name={mode === 'dark' ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Appearance</Text>
                            </View>
                            <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                <TouchableOpacity 
                                    onPress={() => setMode('light')} 
                                    style={[
                                        styles.segmentButton, 
                                        mode === 'light' && { backgroundColor: colors.primary }
                                    ]}
                                >
                                    <Ionicons name={mode === 'light' ? 'sunny' : 'sunny-outline'} size={18} color={mode === 'light' ? colors.white : colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setMode('dark')} 
                                    style={[
                                        styles.segmentButton, 
                                        mode === 'dark' && { backgroundColor: colors.primary }
                                    ]}
                                >
                                    <Ionicons name={mode === 'dark' ? 'moon' : 'moon-outline'} size={18} color={mode === 'dark' ? colors.white : colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity 
                        style={[styles.logoutCard, { backgroundColor: colors.danger + '08', borderColor: colors.danger }]}
                        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] })}
                    >
                        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                        <Text style={[styles.logoutCardText, { color: colors.danger }]}>Log Out of Account</Text>
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
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        ...FONTS.h3,
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
        fontFamily: 'RedHatDisplay_600SemiBold',
    },
    profileCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
        elevation: 3,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitialsCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    avatarInitialsText: {
        ...FONTS.h2,
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'RedHatDisplay_600SemiBold',
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    profileDetails: {
        flex: 1,
        gap: 4,
    },
    name: {
        ...FONTS.h2,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'RedHatDisplay_600SemiBold',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        ...FONTS.body,
        fontSize: 12,
    },
    sectionTitle: {
        ...FONTS.label,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 4,
        fontFamily: 'RedHatDisplay_600SemiBold',
    },
    groupContainer: {
        gap: 8,
        marginBottom: 24,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    rowLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        fontFamily: 'RedHatDisplay_500Medium',
    },
    segmentedControl: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        padding: 3,
        gap: 4,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    segmentButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 10,
    },
    logoutCardText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        fontFamily: 'RedHatDisplay_600SemiBold',
    },
});
