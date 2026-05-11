import React, { useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import {
    AssetAlertPriority,
    AssetAlertStatus,
    getAssetById,
    getAssetVisionDetailById,
    WORK_ORDERS,
} from '../data/fieldDemo';
import { FONTS } from '../styles/futurist';

const priorityTone = (priority: AssetAlertPriority, colors: ReturnType<typeof useTheme>['colors']) => {
    if (priority === 'Highest') {
        return colors.primary;
    }
    if (priority === 'High') {
        return colors.danger;
    }
    return colors.warning;
};

const statusTone = (status: AssetAlertStatus, colors: ReturnType<typeof useTheme>['colors']) => {
    if (status === 'Assigned') {
        return colors.secondary;
    }
    if (status === 'Closed') {
        return colors.success;
    }
    return colors.warning;
};

export const AssetDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors } = useTheme();
    const asset = getAssetById(route.params?.assetId);
    const detail = getAssetVisionDetailById(asset.id);
    const linkedWorkOrder = useMemo(
        () => WORK_ORDERS.find((item) => item.id === asset.linkedWorkOrderId),
        [asset.linkedWorkOrderId],
    );
    const chargerMakeModel = asset.model;

    const infoRows = [
        { label: 'CPID', value: asset.cpid },
        { label: 'Serial number', value: asset.serial },
        { label: 'Make & model', value: chargerMakeModel },
        { label: 'Site location', value: linkedWorkOrder?.address ?? asset.location, accent: true },
        { label: 'Commissioned on', value: detail.commissionedOn },
        { label: 'Firmware version', value: asset.firmware },
        { label: 'Site lead', value: detail.siteLead },
        { label: 'Peak power', value: detail.peakPower },
        { label: 'Contact number', value: detail.contactNumber },
        { label: 'Voltage range', value: detail.voltageRange },
        { label: 'Current rating', value: detail.currentRating },
        { label: 'No. of connectors', value: detail.connectors },
        { label: 'Warranty till', value: detail.warrantyTill },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={22} color={colors.primary} />
                            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.hero}>
                        <Text style={[styles.pageLabel, { color: colors.primary }]}>r-vision</Text>
                        <Text style={[styles.pageTitle, { color: colors.text }]}>{detail.chargerLabel}</Text>
                        <Text style={[styles.pageMeta, { color: colors.textSecondary }]}>
                            {asset.model} • {asset.location}
                        </Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.primary }]}>General information</Text>
                            <Ionicons name="chevron-down" size={18} color={colors.primary} />
                        </View>

                        <View style={styles.infoGrid}>
                            {infoRows.map((item) => (
                                <View key={item.label} style={styles.infoRow}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: item.accent ? colors.primary : colors.text },
                                        ]}
                                    >
                                        {item.value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <Text style={[styles.blockTitle, { color: colors.text }]}>Alerts</Text>
                        <View style={[styles.tableHeaderRow, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.alertTitleCell, { color: colors.text }]}>Alert</Text>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.priorityCell, { color: colors.text }]}>Priority</Text>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.statusCell, { color: colors.text }]}>Status</Text>
                        </View>
                        {detail.alerts.map((item, index) => {
                            const priorityColor = priorityTone(item.priority, colors);
                            const statusColor = statusTone(item.status, colors);

                            return (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.tableRow,
                                        {
                                            borderBottomColor: colors.border,
                                            borderBottomWidth: index === detail.alerts.length - 1 ? 0 : StyleSheet.hairlineWidth,
                                        },
                                    ]}
                                >
                                    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.tableTitle, styles.alertTitleCell, { color: colors.primary }]}>{item.title}</Text>
                                    <View style={[styles.priorityPill, { backgroundColor: priorityColor + '18', borderColor: priorityColor }]}>
                                        <Text numberOfLines={1} style={[styles.priorityPillText, { color: priorityColor }]}>{item.priority}</Text>
                                    </View>
                                    <View style={[styles.statusPill, { backgroundColor: statusColor + '18', borderColor: statusColor }]}>
                                        <Text numberOfLines={1} style={[styles.statusPillText, { color: statusColor }]}>{item.status}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <Text style={[styles.blockTitle, { color: colors.text }]}>Work</Text>
                        <View style={[styles.tableHeaderRow, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.workTitleCell, { color: colors.text }]}>Work</Text>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.dateCell, { color: colors.text }]}>Date</Text>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.statusCell, { color: colors.text }]}>Status</Text>
                        </View>
                        {detail.workHistory.map((item, index) => {
                            const workStatusColor = statusTone(item.status, colors);
                            const rowContent = (
                                <View
                                    style={[
                                        styles.tableRow,
                                        {
                                            borderBottomColor: colors.border,
                                            borderBottomWidth: index === detail.workHistory.length - 1 ? 0 : StyleSheet.hairlineWidth,
                                        },
                                    ]}
                                >
                                    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.tableTitle, styles.workTitleCell, { color: colors.primary }]}>{item.title}</Text>
                                    <Text numberOfLines={1} style={[styles.tableMeta, styles.dateCell, { color: colors.text }]}>{item.date}</Text>
                                    <View style={[styles.statusPill, { backgroundColor: workStatusColor + '18', borderColor: workStatusColor }]}>
                                        <Text numberOfLines={1} style={[styles.statusPillText, { color: workStatusColor }]}>{item.status}</Text>
                                    </View>
                                </View>
                            );

                            if (!item.linkedWorkOrderId) {
                                return <View key={item.id}>{rowContent}</View>;
                            }

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.85}
                                    onPress={() => navigation.navigate('TaskDetails', { taskId: item.linkedWorkOrderId })}
                                >
                                    {rowContent}
                                </TouchableOpacity>
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
        paddingHorizontal: 18,
        paddingBottom: 28,
        gap: 14,
    },
    header: {
        paddingTop: 8,
        marginBottom: 6,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        marginLeft: -6,
    },
    backText: {
        ...FONTS.bodyStrong,
    },
    hero: {
        marginBottom: 4,
    },
    pageLabel: {
        ...FONTS.h2,
        marginBottom: 4,
    },
    pageTitle: {
        ...FONTS.h1,
        marginBottom: 4,
    },
    pageMeta: {
        ...FONTS.body,
    },
    card: {
        borderRadius: 20,
        padding: 16,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionTitle: {
        ...FONTS.h2,
    },
    blockTitle: {
        ...FONTS.h3,
        marginBottom: 12,
    },
    infoGrid: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    infoLabel: {
        ...FONTS.bodyStrong,
        flex: 0.9,
    },
    infoValue: {
        ...FONTS.body,
        flex: 1.1,
    },
    tableHeaderRow: {
        minHeight: 44,
        borderRadius: 14,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    tableHeaderCell: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        minWidth: 0,
    },
    tableRow: {
        minHeight: 68,
        paddingHorizontal: 4,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    tableTitle: {
        ...FONTS.bodyStrong,
        textDecorationLine: 'underline',
        minWidth: 0,
        flexShrink: 1,
    },
    tableMeta: {
        ...FONTS.body,
        minWidth: 0,
    },
    alertTitleCell: {
        flex: 1.5,
        flexShrink: 1,
    },
    workTitleCell: {
        flex: 1.45,
        flexShrink: 1,
    },
    priorityCell: {
        flex: 0.95,
    },
    dateCell: {
        flex: 0.95,
    },
    statusCell: {
        width: 96,
        alignItems: 'flex-end',
        textAlign: 'right',
    },
    priorityPill: {
        minHeight: 38,
        borderRadius: 999,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    priorityPillText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
    statusPill: {
        minHeight: 38,
        minWidth: 84,
        borderRadius: 999,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    statusPillText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
});
