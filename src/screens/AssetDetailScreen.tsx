import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import {
    AssetAlertPriority,
    AssetAlertStatus,
    getAssetById,
    getAssetVisionDetailById,
    WORK_ORDERS,
    requestPM,
} from '../data/fieldDemo';
import { FONTS } from '../styles/futurist';

const CCS2_SVG = `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.0004 25.6269C21.7323 25.6269 28.0002 18.8483 28.0002 10.4864C28.0002 6.73964 26.1584 3.31079 23.9809 0.667169C23.6257 0.235924 23.0904 0 22.5317 0H5.46902C4.91032 0 4.37502 0.235924 4.01981 0.667169C1.84232 3.31079 0.000488281 6.73964 0.000488281 10.4864C0.000488281 18.8483 6.26845 25.6269 14.0004 25.6269Z" fill="none"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.0004 23.672C20.5113 23.672 26.0453 17.9156 26.0453 10.4864C26.0453 7.39127 24.5192 4.40929 22.5088 1.95492H5.49191C3.48149 4.40929 1.9554 7.39127 1.9554 10.4864C1.9554 17.9156 7.48947 23.672 14.0004 23.672ZM28.0002 10.4864C28.0002 18.8483 21.7323 25.6269 14.0004 25.6269C6.26845 25.6269 0.000488281 18.8483 0.000488281 10.4864C0.000488281 6.73964 1.84232 3.31079 4.01981 0.667169C4.37502 0.235924 4.91032 0 5.46902 0H22.5317C23.0904 0 23.6257 0.235924 23.9809 0.667169C26.1584 3.31079 28.0002 6.73964 28.0002 10.4864Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9998 10.7179C13.76 10.7179 13.5656 10.9123 13.5656 11.152C13.5656 11.3918 13.76 11.5862 13.9998 11.5862C14.2395 11.5862 14.4339 11.3918 14.4339 11.152C14.4339 10.9123 14.2395 10.7179 13.9998 10.7179ZM13.9998 14.2368C15.7034 14.2368 17.0845 12.8557 17.0845 11.152C17.0845 9.4484 15.7034 8.06732 13.9998 8.06732C12.2961 8.06732 10.915 9.4484 10.915 11.152C10.915 12.8557 12.2961 14.2368 13.9998 14.2368Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.40698 10.718C6.16722 10.718 5.97286 10.9124 5.97286 11.1522C5.97286 11.3919 6.16722 11.5863 6.40698 11.5863C6.64675 11.5863 6.84111 11.3919 6.84111 11.1522C6.84111 10.9124 6.64675 10.718 6.40698 10.718ZM6.40698 14.2369C8.11063 14.2369 9.4917 12.8558 9.4917 11.1522C9.4917 9.44852 8.11063 8.06744 6.40698 8.06744C4.70334 8.06744 3.32227 9.44852 3.32227 11.1522C3.32227 12.8558 4.70334 14.2369 6.40698 14.2369Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M21.5935 10.7178C21.3537 10.7178 21.1594 10.9122 21.1594 11.1519C21.1594 11.3917 21.3537 11.586 21.5935 11.586C21.8333 11.586 22.0276 11.3917 22.0276 11.1519C22.0276 10.9122 21.8333 10.7178 21.5935 10.7178ZM21.5935 14.2366C23.2972 14.2366 24.6782 12.8556 24.6782 11.1519C24.6782 9.44828 23.2972 8.0672 21.5935 8.0672C19.8899 8.0672 18.5088 9.44828 18.5088 11.1519C18.5088 12.8556 19.8899 14.2366 21.5935 14.2366Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.2034 17.3624C9.96361 17.3624 9.76924 17.5568 9.76924 17.7966C9.76924 18.0363 9.96361 18.2307 10.2034 18.2307C10.4431 18.2307 10.6375 18.0363 10.6375 17.7966C10.6375 17.5568 10.4431 17.3624 10.2034 17.3624ZM10.2034 20.8813C11.907 20.8813 13.2881 19.5002 13.2881 17.7966C13.2881 16.0929 11.907 14.7119 10.2034 14.7119C8.49973 14.7119 7.11865 16.0929 7.11865 17.7966C7.11865 19.5002 8.49973 20.8813 10.2034 20.8813Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.7966 17.3627C17.5569 17.3627 17.3625 17.5571 17.3625 17.7968C17.3625 18.0366 17.5569 18.2309 17.7966 18.2309C18.0364 18.2309 18.2308 18.0366 18.2308 17.7968C18.2308 17.5571 18.0364 17.3627 17.7966 17.3627ZM17.7966 20.8815C19.5003 20.8815 20.8814 19.5005 20.8814 17.7968C20.8814 16.0932 19.5003 14.7121 17.7966 14.7121C16.093 14.7121 14.7119 16.0932 14.7119 17.7968C14.7119 19.5005 16.093 20.8815 17.7966 20.8815Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.3011 7.38392C11.1029 7.38392 11.7529 6.73393 11.7529 5.93213C11.7529 5.13032 11.1029 4.48033 10.3011 4.48033C9.49934 4.48033 8.84935 5.13032 8.84935 5.93213C8.84935 6.73393 9.49934 7.38392 10.3011 7.38392ZM10.3011 8.16589C11.5348 8.16589 12.5349 7.1658 12.5349 5.93213C12.5349 4.69845 11.5348 3.69836 10.3011 3.69836C9.06747 3.69836 8.06738 4.69845 8.06738 5.93213C8.06738 7.1658 9.06747 8.16589 10.3011 8.16589Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M17.6161 7.38392C18.4179 7.38392 19.0679 6.73393 19.0679 5.93213C19.0679 5.13032 18.4179 4.48033 17.6161 4.48033C16.8143 4.48033 16.1643 5.13032 16.1643 5.93213C16.1643 6.73393 16.8143 7.38392 17.6161 7.38392ZM17.6161 8.16589C18.8498 8.16589 19.8498 7.1658 19.8498 5.93213C19.8498 4.69845 18.8498 3.69836 17.6161 3.69836C16.3824 3.69836 15.3823 4.69845 15.3823 5.93213C15.3823 7.1658 16.3824 8.16589 17.6161 8.16589Z" fill="currentColor"/>
<path d="M0 32.8018C0 29.3047 2.83495 26.4698 6.33204 26.4698H21.6677C25.1648 26.4698 27.9997 29.3047 27.9997 32.8018C27.9997 36.2989 25.1648 39.1339 21.6677 39.1339H6.33204C2.83495 39.1339 0 36.2989 0 32.8018Z" fill="none"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M21.6677 27.3076H6.33204C3.29767 27.3076 0.837821 29.7675 0.837821 32.8018C0.837821 35.8362 3.29767 38.296 6.33204 38.296H21.6677C24.7021 38.296 27.1619 35.8362 27.1619 32.8018C27.1619 29.7675 24.7021 27.3076 21.6677 27.3076ZM6.33204 26.4698C2.83495 26.4698 0 29.3047 0 32.8018C0 36.2989 2.83495 39.1339 6.33204 39.1339H21.6677C25.1648 39.1339 27.9997 36.2989 27.9997 32.8018C27.9997 29.3047 25.1648 26.4698 21.6677 26.4698H6.33204Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.40677 34.7965C7.50851 34.7965 8.40165 33.9033 8.40165 32.8016C8.40165 31.6999 7.50851 30.8067 6.40677 30.8067C5.30503 30.8067 4.4119 31.6999 4.4119 32.8016C4.4119 33.9033 5.30503 34.7965 6.40677 34.7965ZM6.40677 37.3099C8.89666 37.3099 10.9151 35.2915 10.9151 32.8016C10.9151 30.3117 8.89666 28.2933 6.40677 28.2933C3.91689 28.2933 1.89844 30.3117 1.89844 32.8016C1.89844 35.2915 3.91689 37.3099 6.40677 37.3099Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M21.5933 34.7965C22.695 34.7965 23.5882 33.9033 23.5882 32.8016C23.5882 31.6999 22.695 30.8067 21.5933 30.8067C20.4916 30.8067 19.5984 31.6999 19.5984 32.8016C19.5984 33.9033 20.4916 34.7965 21.5933 34.7965ZM21.5933 37.3099C24.0832 37.3099 26.1016 35.2915 26.1016 32.8016C26.1016 30.3117 24.0832 28.2933 21.5933 28.2933C19.1034 28.2933 17.085 30.3117 17.085 32.8016C17.085 35.2915 19.1034 37.3099 21.5933 37.3099Z" fill="currentColor"/>
</svg>`;

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
    const { colors, isDark } = useTheme();
    const asset = getAssetById(route.params?.assetId);
    const detail = getAssetVisionDetailById(asset.id);
    const linkedWorkOrder = useMemo(
        () => WORK_ORDERS.find((item) => item.id === asset.linkedWorkOrderId),
        [asset.linkedWorkOrderId],
    );

    const [activeTab, setActiveTab] = useState<'alerts' | 'history'>('alerts');
    const [specsModalVisible, setSpecsModalVisible] = useState(false);

    const [ocppModalVisible, setOcppModalVisible] = useState(false);
    const [callsModalVisible, setCallsModalVisible] = useState(false);
    const [aiModalVisible, setAiModalVisible] = useState(false);
    
    const [pmModalVisible, setPmModalVisible] = useState(false);
    const [pmNotes, setPmNotes] = useState('');
    const [pmAttachment, setPmAttachment] = useState(false);
    
    const handleRequestPM = () => {
        requestPM(asset.id, pmNotes, pmAttachment, 'Tim (Current User)');
        setPmModalVisible(false);
        setPmNotes('');
        setPmAttachment(false);
    };

    // Mock data for calls
    const mockCalls = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
        id: `call-${i}`,
        date: `0${(i % 9) + 1} Apr 2026 14:0${i}`,
        caller: `+91 98${Math.floor(1000000 + Math.random() * 9000000)}`,
        duration: `${Math.floor(Math.random() * 10) + 1}m ${Math.floor(Math.random() * 60)}s`,
        reason: i % 3 === 0 ? 'Payment failed' : i % 3 === 1 ? 'Charger won\'t start' : 'Cable stuck',
    })), []);

    const openWorkOrders = detail.workHistory.filter(item => item.status !== 'Closed');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 4;

    const completedWorkOrdersAll = useMemo(() => {
        const closedFromData = detail.workHistory.filter(item => item.status === 'Closed');
        if (closedFromData.length < 10) {
            const list = [...closedFromData];
            const tasks = [
                'Filter kit replacement',
                'Cabinet cleaning & inspection',
                'Emergency button reset check',
                'Connector lock motor lubrication',
                'Isolation resistance check',
                'Firmware upgrade validation',
                'Grid synchronization test',
                'Power terminal retorque',
                'Auxiliary battery replacement',
                'Display screen calibration',
            ];
            for (let i = 0; i < 8; i++) {
                const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12];
                list.push({
                    id: `work-mock-${i}`,
                    title: tasks[i % tasks.length],
                    date: `1${i % 9} ${month} 2025`,
                    status: 'Closed',
                });
            }
            return list;
        }
        return closedFromData;
    }, [detail.workHistory]);

    const totalPages = Math.ceil(completedWorkOrdersAll.length / PAGE_SIZE);
    const completedWorkOrdersPaginated = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return completedWorkOrdersAll.slice(startIndex, startIndex + PAGE_SIZE);
    }, [completedWorkOrdersAll, currentPage]);

    const specFields = useMemo(() => [
        { label: 'CPID', value: asset.cpid, icon: 'barcode-outline', color: colors.primary },
        { label: 'Serial No', value: asset.serial, icon: 'key-outline', color: colors.primary },
        { label: 'Firmware', value: asset.firmware, icon: 'code-working-outline', color: colors.primary },
        { label: 'Connectors', value: `${detail.connectors}`, icon: CCS2_SVG, color: colors.primary, isSvg: true },
        { label: 'Voltage', value: detail.voltageRange, icon: 'speedometer-outline', color: colors.secondary },
        { label: 'Current', value: detail.currentRating, icon: 'pulse-outline', color: colors.secondary },
        { label: 'Commissioned', value: detail.commissionedOn, icon: 'calendar-outline', color: colors.success },
        { label: 'Warranty', value: detail.warrantyTill, icon: 'shield-checkmark-outline', color: colors.success },
        { label: 'Site Lead', value: detail.siteLead, icon: 'person-outline', color: colors.warning },
        { label: 'Contact', value: detail.contactNumber, icon: 'call-outline', color: colors.warning },
    ], [asset.cpid, asset.serial, asset.firmware, detail.connectors, detail.voltageRange, detail.currentRating, detail.commissionedOn, detail.warrantyTill, detail.siteLead, detail.contactNumber, colors]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>r-vision detail</Text>
                    <View style={{ width: 36 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Hero Display */}
                    <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.heroRow}>
                            <View style={styles.heroMain}>
                                <View style={styles.badgeRow}>
                                    <View style={[styles.statusBadge, { backgroundColor: colors.success + '15' }]}>
                                        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                                        <Text style={[styles.statusBadgeText, { color: colors.success }]}>Online</Text>
                                    </View>
                                    <Text style={[styles.makeBadge, { color: colors.textSecondary, backgroundColor: colors.surfaceHighlight }]}>
                                        {asset.model.split(' ')[0]}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <Text style={[styles.heroTitle, { color: colors.text, marginBottom: 0 }]}>{detail.chargerLabel}</Text>
                                    <TouchableOpacity onPress={() => setSpecsModalVisible(true)}>
                                        <Ionicons name="information-circle" size={22} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.heroMeta, { color: colors.textSecondary }]}>
                                    {asset.model} • {asset.location}
                                </Text>
                            </View>

                            <View style={[styles.powerGauge, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25' }]}>
                                <Ionicons name="flash" size={24} color={colors.primary} />
                                <Text style={[styles.gaugeValue, { color: colors.primary }]}>{detail.peakPower}</Text>
                                <Text style={[styles.gaugeLabel, { color: colors.textSecondary }]}>Capacity</Text>
                            </View>
                        </View>
                    </View>

                    {/* Navigation Tabs */}
                    <View style={[styles.tabsContainer, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                        <TouchableOpacity
                            onPress={() => setActiveTab('alerts')}
                            style={[styles.tabButton, activeTab === 'alerts' && { backgroundColor: colors.primary }]}
                        >
                            <Text style={[styles.tabText, { color: activeTab === 'alerts' ? '#FFF' : colors.textSecondary }]}>Logs & Alerts</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setActiveTab('history')}
                            style={[styles.tabButton, activeTab === 'history' && { backgroundColor: colors.primary }]}
                        >
                            <Text style={[styles.tabText, { color: activeTab === 'history' ? '#FFF' : colors.textSecondary }]}>History</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab 2: Logs & Alerts */}
                    {activeTab === 'alerts' && (
                        <View style={styles.tabContent}>
                            {/* Compressed Action Grid */}
                            <View style={styles.actionGrid}>
                                <TouchableOpacity onPress={() => setOcppModalVisible(true)} style={[styles.diagCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                                    <Text style={[styles.diagTitle, { color: colors.text }]}>OCPP logs</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setCallsModalVisible(true)} style={[styles.diagCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Ionicons name="call-outline" size={16} color={colors.secondary} />
                                    <Text style={[styles.diagTitle, { color: colors.text }]}>10 calls</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Alerts section */}
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 8 }]}>Active Alerts ({detail.alerts.length})</Text>
                                {detail.alerts.length === 0 ? (
                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active alerts found.</Text>
                                ) : (
                                    detail.alerts.map((item, idx) => {
                                        const priorityColor = priorityTone(item.priority, colors);
                                        const statusColor = statusTone(item.status, colors);

                                        return (
                                            <View
                                                key={item.id}
                                                style={[
                                                    styles.alertRow,
                                                    { borderBottomColor: colors.border },
                                                    idx !== detail.alerts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth }
                                                ]}
                                            >
                                                <View style={styles.alertRowHeader}>
                                                    <View style={styles.alertMetaWrap}>
                                                        <Text style={[styles.alertRowTitle, { color: colors.text }]}>{item.title}</Text>
                                                        {item.date && <Text style={[styles.alertRowDate, { color: colors.textSecondary }]}>{item.date}</Text>}
                                                    </View>
                                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                                        <View style={[styles.pillBadge, { backgroundColor: priorityColor + '12', borderColor: priorityColor }]}>
                                                            <Text style={[styles.pillText, { color: priorityColor }]}>{item.priority}</Text>
                                                        </View>
                                                        <View style={[styles.pillBadge, { backgroundColor: statusColor + '12', borderColor: statusColor }]}>
                                                            <Text style={[styles.pillText, { color: statusColor }]}>{item.status}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </View>
                        </View>
                    )}

                    {/* Tab 3: History */}
                    {activeTab === 'history' && (
                        <View style={styles.tabContent}>
                            {/* Request PM Action Card */}
                            <TouchableOpacity 
                                onPress={() => setPmModalVisible(true)} 
                                style={[
                                    styles.diagCard, 
                                    { 
                                        backgroundColor: colors.surface, 
                                        borderColor: colors.border, 
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: 10,
                                        minHeight: 52,
                                        borderRadius: 16,
                                        marginBottom: 16,
                                    }
                                ]}
                            >
                                <Ionicons name="build-outline" size={18} color={colors.warning} />
                                <Text style={[styles.diagTitle, { color: colors.text, ...FONTS.bodyStrong }]}>Request PM</Text>
                            </TouchableOpacity>

                            {/* Open Work Orders */}
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 8 }]}>Open Work Orders ({openWorkOrders.length})</Text>
                                {openWorkOrders.length === 0 ? (
                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No open work orders.</Text>
                                ) : (
                                    openWorkOrders.map((item, index) => {
                                        const workStatusColor = statusTone(item.status, colors);
                                        const cardContent = (
                                            <View style={[styles.historyRow, index !== openWorkOrders.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                                <View style={styles.historyLeft}>
                                                    <Text style={[styles.historyTitle, { color: colors.text }]}>{item.title}</Text>
                                                    <Text style={[styles.historyMeta, { color: colors.textSecondary }]}>{item.date}</Text>
                                                </View>
                                                <View style={[styles.pillBadge, { backgroundColor: workStatusColor + '12', borderColor: workStatusColor }]}>
                                                    <Text style={[styles.pillText, { color: workStatusColor }]}>{item.status}</Text>
                                                </View>
                                            </View>
                                        );

                                        if (!item.linkedWorkOrderId) {
                                            return <View key={item.id}>{cardContent}</View>;
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                activeOpacity={0.85}
                                                onPress={() => navigation.navigate('TaskDetails', { taskId: item.linkedWorkOrderId })}
                                            >
                                                {cardContent}
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </View>

                            {/* Completed Work Orders */}
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 8 }]}>Recently Completed ({completedWorkOrdersAll.length})</Text>
                                {completedWorkOrdersPaginated.length === 0 ? (
                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No completed work orders.</Text>
                                ) : (
                                    completedWorkOrdersPaginated.map((item, index) => {
                                        const workStatusColor = statusTone(item.status, colors);
                                        const cardContent = (
                                            <View style={[styles.historyRow, index !== completedWorkOrdersPaginated.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                                <View style={styles.historyLeft}>
                                                    <Text style={[styles.historyTitle, { color: colors.text }]}>{item.title}</Text>
                                                    <Text style={[styles.historyMeta, { color: colors.textSecondary }]}>{item.date}</Text>
                                                </View>
                                                <View style={[styles.pillBadge, { backgroundColor: workStatusColor + '12', borderColor: workStatusColor }]}>
                                                    <Text style={[styles.pillText, { color: workStatusColor }]}>{item.status}</Text>
                                                </View>
                                            </View>
                                        );

                                        if (!item.linkedWorkOrderId) {
                                            return <View key={item.id}>{cardContent}</View>;
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                activeOpacity={0.85}
                                                onPress={() => navigation.navigate('TaskDetails', { taskId: item.linkedWorkOrderId })}
                                            >
                                                {cardContent}
                                            </TouchableOpacity>
                                        );
                                    })
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 16,
                                        marginTop: 16,
                                        paddingTop: 16,
                                        borderTopWidth: 1,
                                        borderTopColor: colors.border
                                    }}>
                                        <TouchableOpacity
                                            disabled={currentPage === 1}
                                            onPress={() => {
                                                setCurrentPage(prev => Math.max(1, prev - 1));
                                            }}
                                            style={{
                                                padding: 8,
                                                borderRadius: 8,
                                                backgroundColor: colors.surfaceHighlight,
                                                opacity: currentPage === 1 ? 0.4 : 1
                                            }}
                                        >
                                            <Ionicons name="chevron-back" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                        
                                        <Text style={[{ color: colors.text }, FONTS.bodyStrong]}>
                                            Page {currentPage} of {totalPages}
                                        </Text>
                                        
                                        <TouchableOpacity
                                            disabled={currentPage === totalPages}
                                            onPress={() => {
                                                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                            }}
                                            style={{
                                                padding: 8,
                                                borderRadius: 8,
                                                backgroundColor: colors.surfaceHighlight,
                                                opacity: currentPage === totalPages ? 0.4 : 1
                                            }}
                                        >
                                            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Specs Modal */}
            <Modal visible={specsModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setSpecsModalVisible(false)} />
                    <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Asset Specifications</Text>
                            <TouchableOpacity onPress={() => setSpecsModalVisible(false)} style={styles.modalClose}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {/* Technical specifications */}
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 0, paddingHorizontal: 0, paddingTop: 0, shadowOpacity: 0 }]}>
                                <View style={styles.specGridCompact}>
                                    {specFields.map((field) => (
                                        <View key={field.label} style={[styles.specItemCompact, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                            <View style={[styles.specIconCompact, { backgroundColor: field.color + '12' }]}>
                                                {field.isSvg ? (
                                                    <SvgXml xml={field.icon} width={13} height={18} color={field.color} />
                                                ) : (
                                                    <Ionicons name={field.icon as any} size={14} color={field.color} />
                                                )}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.specLabelCompact, { color: colors.textSecondary }]}>{field.label}</Text>
                                                <Text style={[styles.specValueCompact, { color: colors.text }]} numberOfLines={1}>{field.value}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Site Location */}
                            <View style={[styles.card, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, marginTop: 16 }]}>
                                <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 8 }]}>Installation site</Text>
                                <View style={styles.siteCardCompact}>
                                    <Ionicons name="location" size={16} color={colors.secondary} style={{ marginTop: 2 }} />
                                    <View style={{ flex: 1, marginLeft: 6, marginRight: 8 }}>
                                        <Text style={[styles.siteName, { color: colors.text }]}>{linkedWorkOrder?.siteName ?? 'Primary Station Hub'}</Text>
                                        <Text style={[styles.siteAddress, { color: colors.textSecondary }]}>{linkedWorkOrder?.address ?? asset.location}</Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* OCPP Logs Modal */}
            <Modal visible={ocppModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setOcppModalVisible(false)} />
                    <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>OCPP Log packet</Text>
                                <Text style={[styles.modalSub, { color: colors.textSecondary, marginTop: 2 }]}>WebSocket occurrence #1</Text>
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
                                        <Text style={[styles.ocppValue, { color: colors.text }]}>6/15/2026, 2:15:00 AM</Text>
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
                                    { label: 'Timestamp', value: '2026-06-14T20:45:00.000Z' },
                                    { label: 'Transaction Id', value: 'TRX-2026-001' },
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
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Last 10 Support Calls</Text>
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
                                    Overview summary for this charger installation:
                                </Text>
                                <View style={{ marginTop: 12, gap: 12 }}>
                                    <Text style={[styles.aiChatBullet, { color: colors.text }]}>• Charger Model <Text style={{ fontWeight: 'bold' }}>{asset.model}</Text> is status <Text style={{ fontWeight: 'bold' }}>{asset.status}</Text> and operating normally.</Text>
                                    <Text style={[styles.aiChatBullet, { color: colors.text }]}>• There are {openWorkOrders.length} active open work order assignments currently in progress.</Text>
                                    {detail.alerts.length > 0 && (
                                        <Text style={[styles.aiChatBullet, { color: colors.text }]}>• Active alert flag: {detail.alerts[0].title} ({detail.alerts[0].priority} priority level).</Text>
                                    )}
                                    <Text style={[styles.aiChatBullet, { color: colors.text }]}>• Live health score is nominal. Support calls indicate only minor connectivity issues.</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Request PM Modal */}
            <Modal visible={pmModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPmModalVisible(false)} />
                    <View style={[styles.modalSheet, { backgroundColor: colors.surface, height: 'auto', paddingBottom: 40 }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Request PM Issuance</Text>
                                <Text style={[styles.modalSub, { color: colors.textSecondary, marginTop: 4 }]}>Enter technical reason/justification.</Text>
                            </View>
                            <TouchableOpacity onPress={() => setPmModalVisible(false)} style={styles.modalClose}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ gap: 16 }}>
                            <TextInput
                                style={[{ minHeight: 100, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, textAlignVertical: 'top' }, FONTS.body]}
                                placeholder="Enter reason for PM request..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                value={pmNotes}
                                onChangeText={setPmNotes}
                            />
                            <TouchableOpacity onPress={() => setPmAttachment(!pmAttachment)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: pmAttachment ? colors.primary + '15' : colors.surfaceHighlight }}>
                                <Ionicons name={pmAttachment ? "checkmark-circle" : "attach"} size={20} color={pmAttachment ? colors.primary : colors.textSecondary} />
                                <Text style={[{ color: pmAttachment ? colors.primary : colors.text }, FONTS.bodyStrong]}>{pmAttachment ? 'Attachment Added' : 'Add Attachment'}</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={handleRequestPM} style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 }}>
                                <Text style={[{ color: '#FFF' }, FONTS.bodyStrong]}>Submit PM Request</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* AI Summary FAB */}
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
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingRight: 12,
    },
    backText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        marginLeft: 2,
    },
    headerTitle: {
        ...FONTS.h3,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100,
    },
    heroCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    heroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroMain: {
        flex: 1,
        marginRight: 16,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusBadgeText: {
        ...FONTS.label,
        fontSize: 11,
        fontWeight: 'bold',
    },
    makeBadge: {
        ...FONTS.caption,
        fontSize: 11,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        fontWeight: 'bold',
    },
    heroTitle: {
        ...FONTS.h2,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    heroMeta: {
        ...FONTS.caption,
    },
    powerGauge: {
        width: 80,
        height: 80,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
    },
    gaugeValue: {
        ...FONTS.bodyStrong,
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 2,
    },
    gaugeLabel: {
        ...FONTS.label,
        fontSize: 11,
        marginTop: 2,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        padding: 3,
        marginBottom: 16,
        gap: 4,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 9,
        gap: 6,
    },
    tabText: {
        fontFamily: 'RedHatDisplay_600SemiBold',
        fontSize: 11,
    },
    tabContent: {
        gap: 14,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    specGridCompact: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    specItemCompact: {
        width: '48.6%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    specIconCompact: {
        width: 28,
        height: 28,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    specLabelCompact: {
        fontFamily: 'RedHatDisplay_500Medium',
        fontSize: 11,
        textTransform: 'uppercase',
    },
    specValueCompact: {
        ...FONTS.bodyStrong,
        fontSize: 12,
        marginTop: 1,
    },
    siteCardCompact: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    siteName: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
    navButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    siteAddress: {
        ...FONTS.caption,
        marginTop: 2,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    diagCard: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    diagTitle: {
        fontFamily: 'RedHatDisplay_600SemiBold',
        fontSize: 11,
        textAlign: 'center',
    },
    emptyText: {
        ...FONTS.body,
        fontSize: 13,
        textAlign: 'center',
        paddingVertical: 12,
    },
    alertRow: {
        paddingVertical: 12,
    },
    alertRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    alertMetaWrap: {
        flex: 1,
        marginRight: 12,
    },
    alertRowTitle: {
        ...FONTS.bodyStrong,
        fontSize: 13,
    },
    alertRowDate: {
        ...FONTS.caption,
        fontSize: 11,
        marginTop: 4,
    },
    pillBadge: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillText: {
        ...FONTS.label,
        fontSize: 11,
        fontWeight: 'bold',
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    historyLeft: {
        flex: 1,
        marginRight: 12,
    },
    historyTitle: {
        ...FONTS.bodyStrong,
        fontSize: 13,
    },
    historyMeta: {
        ...FONTS.caption,
        marginTop: 4,
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
        fontWeight: '700',
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
