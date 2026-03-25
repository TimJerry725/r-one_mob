import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../styles/futurist';
import { getServiceTypeColors } from '../styles/workTypeColors';
import { WORK_ORDERS, WorkOrder, WorkOrderStatus } from '../data/fieldDemo';

const STATUS_TABS: WorkOrderStatus[] = ['To-Do', 'Working', 'Under Review', 'Completed'];

type StationSummary = {
    id: string;
    siteName: string;
    address: string;
    count: number;
};

const getInitials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .join('')
        .slice(0, 2) || '?';

const OrderCard = ({
    item,
    colors,
    isDark,
    onOpen,
}: {
    item: WorkOrder;
    colors: ReturnType<typeof useTheme>['colors'];
    isDark: boolean;
    onOpen: () => void;
}) => {
    const showActions = item.status === 'To-Do';
    const typeColors = getServiceTypeColors(item.type, isDark);

    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={onOpen}
            style={[styles.orderCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
        >
            <View style={styles.chipRow}>
                <View style={[styles.typeBadge, { backgroundColor: typeColors.tint, borderColor: typeColors.border }]}>
                    <Text style={[styles.typeBadgeText, { color: typeColors.tintText }]}>{item.type}</Text>
                </View>
                {item.type === 'Installation' ? (
                    <View style={[styles.typeBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                        <Text style={[styles.typeBadgeText, { color: colors.primary }]}>{item.stage}</Text>
                    </View>
                ) : null}
            </View>

            <Text style={[styles.orderTitle, { color: colors.text }]}>{item.title}</Text>
            <View style={styles.infoChipRow}>
                <View style={[styles.infoChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                    <Text style={[styles.infoChipText, { color: colors.textSecondary }]}>CPID:</Text>
                    <Text style={[styles.infoChipValue, { color: colors.text }]}>{item.assetId}</Text>
                </View>
                <View style={[styles.infoChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                    <Text style={[styles.infoChipText, { color: colors.textSecondary }]}>Station:</Text>
                    <Text style={[styles.infoChipValue, { color: colors.text }]}>{item.siteName}</Text>
                </View>
            </View>

            <View style={styles.metaList}>
                <View style={styles.assigneeRow}>
                    <Text style={[styles.assigneeLabel, { color: colors.textSecondary }]}>Assignee</Text>
                    <View style={styles.avatarGroup}>
                        {item.technicians.slice(0, 3).map((technician, index) => (
                            <View
                                key={technician}
                                style={[
                                    styles.avatarBadge,
                                    {
                                        backgroundColor: index === 0 ? colors.primary : colors.surfaceHighlight,
                                        borderColor: colors.surface,
                                        marginLeft: index === 0 ? 0 : -8,
                                    },
                                ]}
                            >
                                <Text style={[styles.avatarBadgeText, { color: index === 0 ? colors.white : colors.text }]}>
                                    {getInitials(technician)}
                                </Text>
                            </View>
                        ))}
                        {item.technicians.length > 3 ? (
                            <View
                                style={[
                                    styles.avatarBadge,
                                    {
                                        backgroundColor: colors.cardAlt,
                                        borderColor: colors.surface,
                                        marginLeft: -8,
                                    },
                                ]}
                            >
                                <Text style={[styles.avatarBadgeText, { color: colors.text }]}>+{item.technicians.length - 3}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>

            {showActions ? (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                    >
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>Forward</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onOpen}
                        style={[styles.actionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    >
                        <Text style={[styles.primaryActionText, { color: colors.white }]}>Accept Work</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </TouchableOpacity>
    );
};

const StationCard = ({
    item,
    colors,
    onOpen,
}: {
    item: StationSummary;
    colors: ReturnType<typeof useTheme>['colors'];
    onOpen: () => void;
}) => (
    <TouchableOpacity
        activeOpacity={0.92}
        onPress={onOpen}
        style={[styles.stationCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
    >
        <View style={{ flex: 1 }}>
            <Text style={[styles.stationName, { color: colors.text }]}>{item.siteName}</Text>
            <Text style={[styles.stationAddress, { color: colors.textSecondary }]}>{item.address}</Text>
        </View>
        <View style={[styles.stationCountBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.stationCountText, { color: colors.white }]}>{item.count}</Text>
        </View>
    </TouchableOpacity>
);

export const ProjectDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const [selectedStatuses, setSelectedStatuses] = useState<WorkOrderStatus[]>([]);
    const [selectedSite, setSelectedSite] = useState<string | null>(route.params?.stationFilter ?? null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stationView, setStationView] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    useEffect(() => {
        setSelectedSite(route.params?.stationFilter ?? null);
    }, [route.params?.stationFilter]);

    const visibleOrders = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return WORK_ORDERS.filter((item) => {
            const matchesStatus = selectedStatuses.length === 0 ? true : selectedStatuses.includes(item.status);
            const matchesSite = selectedSite ? item.siteName === selectedSite : true;
            const haystack = `${item.title} ${item.siteName} ${item.address} ${item.type} ${item.stage}`.toLowerCase();
            const matchesSearch = query.length === 0 ? true : haystack.includes(query);
            return matchesStatus && matchesSite && matchesSearch;
        });
    }, [searchQuery, selectedSite, selectedStatuses]);

    const toggleStatus = (status: WorkOrderStatus) => {
        setSelectedStatuses((current) =>
            current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
        );
    };

    const stations = useMemo<StationSummary[]>(() => {
        const grouped = new Map<string, StationSummary>();
        visibleOrders.forEach((item) => {
            const current = grouped.get(item.siteName);
            if (current) {
                current.count += 1;
                return;
            }
            grouped.set(item.siteName, {
                id: item.siteName,
                siteName: item.siteName,
                address: item.address,
                count: 1,
            });
        });
        return Array.from(grouped.values());
    }, [visibleOrders]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <Ionicons name="search" size={18} color={colors.textSecondary} />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search works or stations"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.searchInput, { color: colors.text }]}
                        />
                    </View>

                    <View style={styles.controlRow}>
                        <TouchableOpacity
                            onPress={() => setStationView((current) => !current)}
                            style={[styles.stationToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <Text style={[styles.stationToggleText, { color: colors.text }]}>Station View</Text>
                            <View
                                style={[
                                    styles.switchOuter,
                                    { backgroundColor: stationView ? colors.primary : colors.surfaceHighlight },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.switchInner,
                                        {
                                            backgroundColor: colors.white,
                                            transform: [{ translateX: stationView ? 16 : 2 }],
                                        },
                                    ]}
                                />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowFilterMenu((current) => !current)}
                            style={[styles.filterDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <View style={styles.filterDropdownContent}>
                                <Ionicons name="filter" size={16} color={colors.textSecondary} />
                                <Text style={[styles.filterDropdownText, { color: colors.text }]}>
                                    {selectedStatuses.length === 0 ? 'All' : `${selectedStatuses.length} selected`}
                                </Text>
                            </View>
                            <Ionicons
                                name={showFilterMenu ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {showFilterMenu ? (
                        <View style={[styles.filterMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <TouchableOpacity
                                onPress={() => setSelectedStatuses([])}
                                style={styles.filterMenuItem}
                            >
                                <Text style={[styles.filterMenuText, { color: colors.text }]}>All</Text>
                                {selectedStatuses.length === 0 ? (
                                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                                ) : null}
                            </TouchableOpacity>
                            {STATUS_TABS.map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    onPress={() => toggleStatus(status)}
                                    style={styles.filterMenuItem}
                                >
                                    <Text style={[styles.filterMenuText, { color: colors.text }]}>{status}</Text>
                                    {selectedStatuses.includes(status) ? (
                                        <Ionicons name="checkmark" size={18} color={colors.primary} />
                                    ) : null}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.selectedFilterRow}
                    >
                        {selectedStatuses.length === 0 ? (
                            <View
                                style={[
                                    styles.selectedChip,
                                    { backgroundColor: colors.primary + '14', borderColor: colors.primary },
                                ]}
                            >
                                <Text style={[styles.selectedChipText, { color: colors.primary }]}>All</Text>
                            </View>
                        ) : (
                            selectedStatuses.map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    onPress={() => toggleStatus(status)}
                                    style={[
                                        styles.selectedChip,
                                        { backgroundColor: colors.primary + '14', borderColor: colors.primary },
                                    ]}
                                >
                                    <Text style={[styles.selectedChipText, { color: colors.primary }]}>{status}</Text>
                                    <Ionicons name="close" size={14} color={colors.primary} />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    {selectedSite ? (
                        <TouchableOpacity
                            onPress={() => setSelectedSite(null)}
                            style={[styles.siteFilter, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                        >
                            <Ionicons name="location" size={16} color={colors.primary} />
                            <Text style={[styles.siteFilterText, { color: colors.text }]}>{selectedSite}</Text>
                            <Ionicons name="close" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ) : null}

                    <View style={styles.listColumn}>
                        {stationView
                            ? stations.map((item) => (
                                <StationCard
                                    key={item.id}
                                    item={item}
                                    colors={colors}
                                    onOpen={() => {
                                        setSelectedSite(item.siteName);
                                        setStationView(false);
                                    }}
                                />
                            ))
                            : visibleOrders.map((item) => (
                                <OrderCard
                                    key={item.id}
                                    item={item}
                                    colors={colors}
                                    isDark={isDark}
                                    onOpen={() => navigation.navigate('TaskDetails', { taskId: item.id })}
                                />
                            ))}

                        {((stationView && stations.length === 0) || (!stationView && visibleOrders.length === 0)) ? (
                            <View style={[styles.emptyCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>No results</Text>
                                <Text style={[styles.emptyCopy, { color: colors.textSecondary }]}>
                                    Try another search term, toggle station view, or adjust the filters.
                                </Text>
                            </View>
                        ) : null}
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
    searchBar: {
        minHeight: 54,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        marginBottom: 14,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    searchInput: {
        ...FONTS.body,
        flex: 1,
        paddingVertical: 0,
    },
    controlRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    stationToggle: {
        flex: 1,
        minHeight: 54,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    stationToggleText: {
        ...FONTS.bodyStrong,
    },
    switchOuter: {
        width: 36,
        height: 20,
        borderRadius: 8,
        justifyContent: 'center',
    },
    switchInner: {
        width: 16,
        height: 16,
        borderRadius: 6,
    },
    filterDropdown: {
        minWidth: 132,
        minHeight: 54,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        gap: 10,
    },
    filterDropdownContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filterDropdownText: {
        ...FONTS.bodyStrong,
    },
    filterMenu: {
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 8,
        marginBottom: 14,
    },
    filterMenuItem: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    filterMenuText: {
        ...FONTS.bodyStrong,
    },
    selectedFilterRow: {
        gap: 8,
        marginBottom: 14,
    },
    selectedChip: {
        minHeight: 36,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 6,
    },
    selectedChipText: {
        ...FONTS.label,
    },
    siteFilter: {
        minHeight: 46,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        gap: 8,
        marginBottom: 14,
    },
    siteFilterText: {
        ...FONTS.bodyStrong,
    },
    listColumn: {
        gap: 12,
    },
    orderCard: {
        borderRadius: 14,
        padding: 12,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    typeBadge: {
        minHeight: 24,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    typeBadgeText: {
        ...FONTS.label,
        fontSize: 9,
    },
    orderTitle: {
        ...FONTS.h3,
        fontSize: 16,
        marginBottom: 4,
    },
    infoChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 6,
    },
    infoChip: {
        minHeight: 24,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        gap: 4,
    },
    infoChipText: {
        ...FONTS.label,
        fontSize: 9,
    },
    infoChipValue: {
        ...FONTS.caption,
        fontSize: 11,
    },
    metaList: {
        marginBottom: 8,
    },
    assigneeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    assigneeLabel: {
        ...FONTS.caption,
    },
    avatarGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
    },
    avatarBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarBadgeText: {
        ...FONTS.label,
        fontSize: 9,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    actionButtonText: {
        ...FONTS.bodyStrong,
    },
    primaryActionText: {
        ...FONTS.bodyStrong,
    },
    stationCard: {
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    stationName: {
        ...FONTS.h3,
        marginBottom: 4,
    },
    stationAddress: {
        ...FONTS.body,
    },
    stationCountBadge: {
        width: 52,
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stationCountText: {
        ...FONTS.h3,
    },
    emptyCard: {
        borderRadius: 16,
        padding: 20,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    emptyTitle: {
        ...FONTS.h3,
        marginBottom: 8,
    },
    emptyCopy: {
        ...FONTS.body,
    },
});
