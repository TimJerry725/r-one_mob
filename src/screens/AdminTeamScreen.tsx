import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { WORK_ORDERS } from '../data/fieldDemo';
import { FONTS } from '../styles/futurist';
import { getStatusColor } from '../styles/statusColors';

export const AdminTeamScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const [filterTab, setFilterTab] = useState<'All' | 'Requested' | 'Pending Request' | 'Completed'>('All');

    // Filter preventive work orders
    const preventiveOrders = WORK_ORDERS.filter((item) => item.type === 'Preventive');

    const filteredOrders = preventiveOrders.filter((item) => {
        if (filterTab === 'Requested') return item.status === 'Requested' || item.isRequested;
        if (filterTab === 'Pending Request') return item.status !== 'Requested' && !item.isRequested && item.status !== 'Completed';
        if (filterTab === 'Completed') return item.status === 'Completed';
        return true;
    });

    const totalCount = preventiveOrders.length;
    const requestedCount = preventiveOrders.filter((i) => i.status === 'Requested' || i.isRequested).length;
    const pendingCount = preventiveOrders.filter((i) => i.status !== 'Requested' && !i.isRequested && i.status !== 'Completed').length;
    const completedCount = preventiveOrders.filter((i) => i.status === 'Completed').length;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin / Central Team</Text>
                        <Text style={{ ...FONTS.caption, color: colors.textSecondary }}>Preventive Maintenance Control</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
                    {/* Stats Overview Grid */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.statNumber, { color: colors.text }]}>{totalCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total PM</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255, 183, 77, 0.12)' : 'rgba(230, 81, 0, 0.08)', borderColor: isDark ? '#FFB74D' : '#E65100' }]}>
                            <Text style={[styles.statNumber, { color: isDark ? '#FFB74D' : '#E65100' }]}>{requestedCount}</Text>
                            <Text style={[styles.statLabel, { color: isDark ? '#FFB74D' : '#E65100' }]}>Requested</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.statNumber, { color: colors.secondary }]}>{pendingCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.statNumber, { color: colors.success }]}>{completedCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Done</Text>
                        </View>
                    </View>

                    {/* Filter Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {(['All', 'Requested', 'Pending Request', 'Completed'] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setFilterTab(tab)}
                                style={[
                                    styles.filterTab,
                                    {
                                        backgroundColor: filterTab === tab ? colors.primary : colors.surfaceHighlight,
                                        borderColor: filterTab === tab ? colors.primary : colors.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterTabText,
                                        { color: filterTab === tab ? colors.white : colors.text },
                                    ]}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Work Orders List */}
                    <View style={{ gap: 12 }}>
                        {filteredOrders.length === 0 ? (
                            <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Ionicons name="shield-checkmark-outline" size={42} color={colors.textSecondary} />
                                <Text style={{ color: colors.text, ...FONTS.bodyStrong, marginTop: 8 }}>No Preventive Works Found</Text>
                                <Text style={{ color: colors.textSecondary, ...FONTS.body, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                                    All preventive maintenance works under this status filter are up to date.
                                </Text>
                            </View>
                        ) : (
                            filteredOrders.map((item) => {
                                const isRequested = item.status === 'Requested' || item.isRequested;
                                return (
                                    <View
                                        key={item.id}
                                        style={[styles.workCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                            <View style={{ flex: 1, gap: 4 }}>
                                                <Text style={[styles.workTitle, { color: colors.text }]}>{item.title}</Text>
                                                <Text style={{ color: colors.textSecondary, ...FONTS.caption }}>
                                                    Station: <Text style={{ color: colors.text, fontWeight: '600' }}>{item.siteName}</Text>
                                                </Text>
                                                <Text style={{ color: colors.textSecondary, ...FONTS.caption }}>
                                                    CPID: <Text style={{ color: colors.primary, fontWeight: '700' }}>[{item.assetId}]</Text>
                                                </Text>
                                            </View>
                                            
                                            {/* Status Tag */}
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor: getStatusColor(item.status, colors, isDark) + '1F',
                                                        borderColor: getStatusColor(item.status, colors, isDark),
                                                    },
                                                ]}
                                            >
                                                <Ionicons
                                                    name={isRequested ? "paper-plane" : "time-outline"}
                                                    size={12}
                                                    color={getStatusColor(item.status, colors, isDark)}
                                                    style={{ marginRight: 4 }}
                                                />
                                                <Text style={[styles.statusText, { color: getStatusColor(item.status, colors, isDark) }]}>
                                                    {item.status}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

                                        {/* Card Meta & Action Row */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                            <View style={{ gap: 2 }}>
                                                <Text style={{ color: colors.textSecondary, ...FONTS.caption }}>
                                                    Assignee: <Text style={{ color: colors.text, fontWeight: '600' }}>{item.technicians.join(', ') || 'Unassigned'}</Text>
                                                </Text>
                                                <Text style={{ color: colors.textSecondary, ...FONTS.caption }}>
                                                    Due: <Text style={{ color: colors.text, fontWeight: '600' }}>{item.dueWindow}</Text>
                                                </Text>
                                            </View>

                                            {/* Requested work keeps its status badge; other work has no secondary action. */}
                                            {isRequested ? (
                                                <View style={[styles.requestedBadge, { backgroundColor: isDark ? 'rgba(255, 183, 77, 0.15)' : 'rgba(230, 81, 0, 0.1)', borderColor: isDark ? '#FFB74D' : '#E65100' }]}>
                                                    <Ionicons name="checkmark-circle" size={14} color={isDark ? '#FFB74D' : '#E65100'} />
                                                    <Text style={[styles.requestedBadgeText, { color: isDark ? '#FFB74D' : '#E65100' }]}>
                                                        Requested
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                );
                            })
                        )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        ...FONTS.h3,
        fontSize: 17,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        padding: 10,
        alignItems: 'center',
    },
    statNumber: {
        ...FONTS.h2,
        fontSize: 18,
    },
    statLabel: {
        ...FONTS.caption,
        fontSize: 10,
        marginTop: 2,
    },
    filterTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterTabText: {
        ...FONTS.label,
        fontSize: 12,
    },
    workCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        gap: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    workTitle: {
        ...FONTS.bodyStrong,
        fontSize: 15,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        ...FONTS.label,
        fontSize: 11,
        fontWeight: '700',
    },
    cardDivider: {
        height: 1,
        marginVertical: 2,
    },
    requestedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 10,
        borderWidth: 1,
    },
    requestedBadgeText: {
        ...FONTS.label,
        fontSize: 12,
        fontWeight: '700',
    },
    emptyContainer: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
