import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ASSETS } from '../data/fieldDemo';
import { FONTS, getInputShellStyle } from '../styles/futurist';

const statusTone = (status: string, colors: ReturnType<typeof useTheme>['colors']) => {
    if (status === 'Healthy') {
        return colors.success;
    }
    if (status === 'Service Due') {
        return colors.primary;
    }
    return colors.danger;
};

export const ProjectListScreen = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const [query, setQuery] = useState('');

    const visibleAssets = ASSETS.filter((item) => {
        const haystack = `${item.cpid} ${item.serial} ${item.location} ${item.model}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.pageLabel, { color: colors.textSecondary }]}>Asset Management</Text>
                            <Text style={[styles.pageTitle, { color: colors.text }]}>Chargers and service history</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AssetScan')}
                            style={[styles.scanButton, { backgroundColor: colors.primary }]}
                        >
                            <Ionicons name="qr-code" size={24} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.syncCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <Ionicons name="cloud-done-outline" size={20} color={colors.success} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.syncTitle, { color: colors.text }]}>Recent asset data available offline</Text>
                            <Text style={[styles.syncCopy, { color: colors.textSecondary }]}>
                                Service logs, firmware, and last known status are cached on-device for 24 hours.
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.searchBar, getInputShellStyle(colors)]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search CPID, serial, or location"
                            placeholderTextColor={colors.textSecondary}
                            value={query}
                            onChangeText={setQuery}
                        />
                    </View>

                    <View style={styles.listColumn}>
                        {visibleAssets.map((item) => {
                            const tone = statusTone(item.status, colors);
                            return (
                                <View key={item.id} style={[styles.assetCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                                    <View style={styles.assetHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.assetModel, { color: colors.text }]}>{item.model}</Text>
                                            <Text style={[styles.assetLocation, { color: colors.textSecondary }]}>{item.location}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: tone + '20', borderColor: tone }]}>
                                            <Text style={[styles.statusBadgeText, { color: tone }]}>{item.status}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={styles.infoItem}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CPID</Text>
                                            <Text style={[styles.infoValue, { color: colors.text }]}>{item.cpid}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Serial</Text>
                                            <Text style={[styles.infoValue, { color: colors.text }]}>{item.serial}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={styles.infoItem}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Last service</Text>
                                            <Text style={[styles.infoValue, { color: colors.text }]}>{item.lastService}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Firmware</Text>
                                            <Text style={[styles.infoValue, { color: colors.text }]}>{item.firmware}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                        >
                                            <Text style={[styles.actionButtonText, { color: colors.text }]}>History</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (item.linkedWorkOrderId) {
                                                    navigation.navigate('TaskDetails', { taskId: item.linkedWorkOrderId });
                                                    return;
                                                }
                                                navigation.navigate('AssetScan');
                                            }}
                                            style={[styles.actionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                        >
                                            <Text style={[styles.primaryActionText, { color: colors.white }]}>
                                                {item.linkedWorkOrderId ? 'Open Work' : 'Scan Again'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 18,
    },
    pageLabel: {
        ...FONTS.label,
        marginBottom: 6,
    },
    pageTitle: {
        ...FONTS.h1,
    },
    scanButton: {
        width: 56,
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncCard: {
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    syncTitle: {
        ...FONTS.bodyStrong,
        marginBottom: 6,
    },
    syncCopy: {
        ...FONTS.body,
    },
    searchBar: {
        minHeight: 56,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    searchInput: {
        ...FONTS.body,
        flex: 1,
    },
    listColumn: {
        gap: 14,
    },
    assetCard: {
        borderRadius: 18,
        padding: 18,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    assetHeader: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    assetModel: {
        ...FONTS.h2,
        marginBottom: 4,
    },
    assetLocation: {
        ...FONTS.body,
    },
    statusBadge: {
        minHeight: 34,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    statusBadgeText: {
        ...FONTS.label,
        fontSize: 11,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        ...FONTS.label,
        marginBottom: 6,
    },
    infoValue: {
        ...FONTS.bodyStrong,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        ...FONTS.bodyStrong,
    },
    primaryActionText: {
        ...FONTS.bodyStrong,
    },
});
