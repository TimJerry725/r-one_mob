import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
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

    const [ocppModalVisible, setOcppModalVisible] = useState(false);
    const [callsModalVisible, setCallsModalVisible] = useState(false);
    const [aiModalVisible, setAiModalVisible] = useState(false);

    // Mock data for calls
    const mockCalls = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
        id: `call-${i}`,
        date: `0${(i % 9) + 1} Apr 2026 14:0${i}`,
        caller: `+91 98${Math.floor(1000000 + Math.random() * 9000000)}`,
        duration: `${Math.floor(Math.random() * 10) + 1}m ${Math.floor(Math.random() * 60)}s`,
        reason: i % 3 === 0 ? 'Payment failed' : i % 3 === 1 ? 'Charger won\'t start' : 'Cable stuck',
    })), []);

    const openWorkOrders = detail.workHistory.filter(item => item.status !== 'Closed');
    const completedWorkOrders = detail.workHistory.filter(item => item.status === 'Closed').slice(-3);

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

                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={() => setOcppModalVisible(true)} style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="document-text" size={16} color={colors.primary} />
                            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Fetch OCPP logs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCallsModalVisible(true)} style={[styles.actionButton, { backgroundColor: colors.secondary + '15' }]}>
                            <Ionicons name="call" size={16} color={colors.secondary} />
                            <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Last 10 calls</Text>
                        </TouchableOpacity>
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
                                    <View style={styles.alertTitleCell}>
                                        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.tableTitle, { color: colors.primary }]}>{item.title}</Text>
                                        {item.date ? <Text numberOfLines={1} style={[styles.tableMeta, { color: colors.textSecondary, marginTop: 4 }]}>{item.date}</Text> : null}
                                    </View>
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
                        <Text style={[styles.blockTitle, { color: colors.text }]}>Open Work Orders</Text>
                        <View style={[styles.tableHeaderRow, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.workTitleCell, { color: colors.text }]}>Work</Text>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.dateCell, { color: colors.text }]}>Date</Text>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.statusCell, { color: colors.text }]}>Status</Text>
                        </View>
                        {openWorkOrders.length === 0 ? (
                            <Text style={[{ color: colors.textSecondary, paddingVertical: 12, textAlign: 'center' }, FONTS.body]}>No open work orders.</Text>
                        ) : null}
                        {openWorkOrders.map((item, index) => {
                            const workStatusColor = statusTone(item.status, colors);
                            const rowContent = (
                                <View
                                    style={[
                                        styles.tableRow,
                                        {
                                            borderBottomColor: colors.border,
                                            borderBottomWidth: index === openWorkOrders.length - 1 ? 0 : StyleSheet.hairlineWidth,
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

                    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <Text style={[styles.blockTitle, { color: colors.text }]}>Completed Work Orders</Text>
                        <View style={[styles.tableHeaderRow, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.workTitleCell, { color: colors.text }]}>Work</Text>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.dateCell, { color: colors.text }]}>Date</Text>
                            <Text numberOfLines={1} style={[styles.tableHeaderCell, styles.statusCell, { color: colors.text }]}>Status</Text>
                        </View>
                        {completedWorkOrders.length === 0 ? (
                            <Text style={[{ color: colors.textSecondary, paddingVertical: 12, textAlign: 'center' }, FONTS.body]}>No recently completed work.</Text>
                        ) : null}
                        {completedWorkOrders.map((item, index) => {
                            const workStatusColor = statusTone(item.status, colors);
                            const rowContent = (
                                <View
                                    style={[
                                        styles.tableRow,
                                        {
                                            borderBottomColor: colors.border,
                                            borderBottomWidth: index === completedWorkOrders.length - 1 ? 0 : StyleSheet.hairlineWidth,
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

            {/* OCPP Logs Modal */}
            <Modal visible={ocppModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setOcppModalVisible(false)} />
                    <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>OCPP Log (JSON Format)</Text>
                                <Text style={[styles.modalSub, { color: colors.textSecondary, marginTop: 4 }]}>Log entry for occurrence #1</Text>
                            </View>
                            <TouchableOpacity onPress={() => setOcppModalVisible(false)} style={styles.modalClose}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <View style={[styles.ocppHeaderCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                <View style={styles.ocppHeaderRow}>
                                    <View style={styles.ocppHeaderCol}>
                                        <Text style={[styles.ocppLabel, { color: colors.textSecondary }]}>Message ID</Text>
                                        <Text style={[styles.ocppValue, { color: colors.text }]}>occurrence-1</Text>
                                    </View>
                                    <View style={styles.ocppHeaderCol}>
                                        <Text style={[styles.ocppLabel, { color: colors.textSecondary }]}>Timestamp</Text>
                                        <Text style={[styles.ocppValue, { color: colors.text }]}>6/15/2024, 2:15:00 AM</Text>
                                    </View>
                                </View>
                                <View style={[styles.ocppHeaderCol, { marginTop: 12 }]}>
                                    <Text style={[styles.ocppLabel, { color: colors.textSecondary }]}>Call Action</Text>
                                    <Text style={[styles.ocppValue, { color: colors.text }]}>Charging completed successfully with minor wear</Text>
                                </View>
                            </View>

                            <View style={[styles.ocppTable, { borderColor: colors.border }]}>
                                {[
                                    { label: 'Alert Id', value: '1001' },
                                    { label: 'Occurrence Number', value: '1' },
                                    { label: 'Timestamp', value: '2024-06-14T20:45:00.000Z' },
                                    { label: 'Transaction Id', value: 'TRX-2024-001' },
                                    { label: 'Customer Id', value: 'CUST-8248829188' },
                                    { label: 'Vehicle', value: 'Tata Nexon' },
                                    { label: 'Error Code', value: 'Connection Lost: WebSocket timeout after 30s' },
                                    { label: 'Connector Id', value: '1' },
                                    { label: 'Charge Point Vendor', value: 'Tesla' },
                                    { label: 'Charge Point Model', value: 'Supercharger V3' },
                                    { label: 'Firmware Version', value: '1.2.3' },
                                    { label: 'Iccid', value: '89445001021234567890' },
                                    { label: 'Imsi', value: '310150123456789' },
                                    { label: 'Meter Serial Number', value: '2190192948213221' },
                                    { label: 'Meter Type', value: 'AC Smart Meter' },
                                    { label: 'Status', value: 'Faulted' },
                                ].map((row, idx) => (
                                    <View key={row.label} style={[styles.ocppTableRow, { borderTopColor: colors.border, borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth }]}>
                                        <Text style={[styles.ocppTableLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                                        <Text style={[styles.ocppTableValue, { color: colors.text }]}>{row.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Customer Calls Modal */}
            <Modal visible={callsModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setCallsModalVisible(false)} />
                    <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Last 10 Customer Calls</Text>
                            <TouchableOpacity onPress={() => setCallsModalVisible(false)} style={styles.modalClose}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {mockCalls.map((call, index) => (
                                <View key={call.id} style={[styles.modalItem, { borderBottomColor: colors.border, borderBottomWidth: index === mockCalls.length - 1 ? 0 : StyleSheet.hairlineWidth }]}>
                                    <View style={styles.modalItemHeader}>
                                        <Text style={[styles.modalItemTitle, { color: colors.secondary }]}>{call.reason}</Text>
                                        <Text style={[styles.modalItemMeta, { color: colors.textSecondary }]}>{call.duration}</Text>
                                    </View>
                                    <Text style={[styles.modalItemMeta, { color: colors.text }]}>{call.caller}</Text>
                                    <Text style={[styles.modalItemMeta, { color: colors.textSecondary }]}>{call.date}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* AI Summary Modal */}
            <Modal visible={aiModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setAiModalVisible(false)} />
                    <View style={[styles.aiCompactSheet, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="sparkles" size={24} color={colors.primary} />
                                <Text style={[styles.modalTitle, { color: colors.text }]}>AI Summary</Text>
                            </View>
                            <TouchableOpacity onPress={() => setAiModalVisible(false)} style={styles.modalClose}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={[styles.aiChatBubble, { backgroundColor: colors.surfaceHighlight }]}>
                                <Text style={[styles.aiChatText, { color: colors.text }]}>
                                    Here's a quick overview of this charging station:
                                </Text>
                                <View style={{ marginTop: 12, gap: 12 }}>
                                    <Text style={[styles.aiChatBullet, { color: colors.text }]}>• The <Text style={{ fontWeight: 'bold' }}>{asset.model}</Text> is currently <Text style={{ fontWeight: 'bold' }}>{asset.status}</Text>.</Text>
                                    <Text style={[styles.aiChatBullet, { color: colors.text }]}>• There are {openWorkOrders.length} open work orders requiring attention.</Text>
                                    {detail.alerts.length > 0 && (
                                        <Text style={[styles.aiChatBullet, { color: colors.text }]}>• Active alert: {detail.alerts[0].title} ({detail.alerts[0].priority} priority).</Text>
                                    )}
                                    <Text style={[styles.aiChatBullet, { color: colors.text }]}>• No critical OCPP errors; last 10 support calls mostly report minor payment or cable issues.</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* AI Summarize FAB */}
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
                onPress={() => setAiModalVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="sparkles" size={20} color="#FFF" />
                <Text style={[styles.fabText, { color: '#FFF' }]}>AI Summary</Text>
            </TouchableOpacity>
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
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        height: 46,
        borderRadius: 14,
        gap: 6,
        flex: 1,
    },
    actionButtonText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '70%',
        padding: 24,
        paddingBottom: 40,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalTitle: {
        ...FONTS.h2,
    },
    modalSub: {
        ...FONTS.body,
    },
    modalClose: {
        padding: 4,
        marginRight: -4,
    },
    modalScroll: {
        flex: 1,
    },
    modalItem: {
        paddingVertical: 14,
        gap: 4,
    },
    modalItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemTitle: {
        ...FONTS.bodyStrong,
    },
    modalItemMeta: {
        ...FONTS.body,
    },
    ocppHeaderCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    ocppHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ocppHeaderCol: {
        flex: 1,
    },
    ocppLabel: {
        ...FONTS.label,
        marginBottom: 4,
    },
    ocppValue: {
        ...FONTS.bodyStrong,
    },
    ocppTable: {
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    ocppTableRow: {
        flexDirection: 'row',
        padding: 12,
    },
    ocppTableLabel: {
        ...FONTS.bodyStrong,
        flex: 1,
    },
    ocppTableValue: {
        ...FONTS.body,
        flex: 1.5,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        height: 56,
        paddingHorizontal: 20,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        ...FONTS.bodyStrong,
        fontSize: 15,
    },
    aiCompactSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 12,
    },
    aiChatBubble: {
        borderRadius: 16,
        borderTopLeftRadius: 4,
        padding: 16,
        marginVertical: 8,
    },
    aiChatText: {
        ...FONTS.body,
        fontSize: 15,
        lineHeight: 22,
    },
    aiChatBullet: {
        ...FONTS.body,
        fontSize: 14,
        lineHeight: 20,
        paddingLeft: 4,
    },
});
