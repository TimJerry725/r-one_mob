import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Animated, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStatusColor } from '../styles/statusColors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';
import { useTheme } from '../context/ThemeContext';
import { FONTS, getInputShellStyle } from '../styles/futurist';
import { getServiceTypeColors } from '../styles/workTypeColors';
import { WORK_ORDERS, WorkOrder, WorkOrderStatus, STATION_BUSINESS_IMPACT } from '../data/fieldDemo';

const STATUS_TABS: WorkOrderStatus[] = ['Unassigned', 'Assigned', 'Working', 'Under Review', 'Completed'];

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

export const OrderCard = ({
    item,
    colors,
    isDark,
    onOpen,
    hideTypeChip,
    hideStationChip,
}: {
    item: WorkOrder;
    colors: ReturnType<typeof useTheme>['colors'];
    isDark: boolean;
    onOpen: () => void;
    hideTypeChip?: boolean;
    hideStationChip?: boolean;
}) => {
    const [cardRequested, setCardRequested] = useState(item.status === 'Requested' || item.isRequested);

    const handleSendRequestClick = (e: any) => {
        e.stopPropagation();
        item.status = 'Requested';
        item.isRequested = true;
        setCardRequested(true);
        Alert.alert(
            'Request Sent',
            `Preventive maintenance request for "${item.title}" at ${item.siteName} has been sent to Central Team.`,
            [{ text: 'OK' }]
        );
    };

    const isPreventive = item.type === 'Preventive';
    const isCurrentlyRequested = cardRequested || item.status === 'Requested' || item.isRequested;

    const actionConfig = isPreventive
        ? (isCurrentlyRequested
            ? { secondaryLabel: 'Details', primaryLabel: 'Requested', isRequestedState: true }
            : { secondaryLabel: 'Details', primaryLabel: 'Send Request', isSendRequest: true })
        : (item.status === 'Unassigned' || item.status === 'Assigned')
            ? { secondaryLabel: 'Forward', primaryLabel: 'Accept Work' }
            : item.status === 'Under Review'
                ? { secondaryLabel: 'Reject', primaryLabel: 'Review Work' }
                : null;
    const typeColors = getServiceTypeColors(item.type, isDark);
    const priorityColor = item.priority === 'High' ? colors.danger : item.priority === 'Medium' ? colors.secondary : colors.textSecondary;

    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={onOpen}
            style={[styles.orderCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
                <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.orderTitle, { color: colors.text, marginBottom: 0 }]}>{item.title}</Text>
                    <Text style={{ ...FONTS.caption, color: colors.textSecondary }}>
                        {!hideTypeChip && (
                            <>
                                <Text style={{ color: isDark ? typeColors.background : typeColors.tintText, fontWeight: '600' }}>{item.type}</Text>
                                {' • '}
                            </>
                        )}
                        {item.type === 'Installation' && (
                            <>
                                <Text style={{ color: isDark ? colors.primaryLight : colors.primary, fontWeight: '600' }}>{item.stage}</Text>
                                {' • '}
                            </>
                        )}
                        <Text style={{ color: priorityColor, fontWeight: '600' }}>{item.priority} Priority</Text>
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6, marginTop: 2 }}>
                    <View style={[
                        styles.statusBadgeInline, 
                        { 
                            backgroundColor: getStatusColor(isCurrentlyRequested ? 'Requested' : item.status, colors, isDark) + '15',
                            borderColor: getStatusColor(isCurrentlyRequested ? 'Requested' : item.status, colors, isDark)
                        }
                    ]}>
                        <Text style={[
                            styles.statusBadgeTextInline, 
                            { color: getStatusColor(isCurrentlyRequested ? 'Requested' : item.status, colors, isDark) }
                        ]}>{isCurrentlyRequested ? 'Requested' : item.status}</Text>
                    </View>
                    <Text style={[{ ...FONTS.caption, fontSize: 11, color: colors.danger }]}>
                        {new Date(item.targetTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
            </View>

            {!hideStationChip && (
                <View style={{ marginBottom: 12 }}>
                    <Text style={{ ...FONTS.caption, color: colors.textSecondary }}>
                        Station: <Text style={{ color: colors.text }}>{item.siteName}</Text>
                    </Text>
                </View>
            )}

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

            {actionConfig ? (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        onPress={onOpen}
                        style={[styles.actionButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                    >
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>{actionConfig.secondaryLabel}</Text>
                    </TouchableOpacity>
                    {actionConfig.isSendRequest ? (
                        <TouchableOpacity
                            onPress={handleSendRequestClick}
                            style={[styles.actionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        >
                            <Ionicons name="paper-plane" size={14} color={colors.white} />
                            <Text style={[styles.primaryActionText, { color: colors.white }]}>{actionConfig.primaryLabel}</Text>
                        </TouchableOpacity>
                    ) : actionConfig.isRequestedState ? (
                        <View style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255, 183, 77, 0.18)' : 'rgba(230, 81, 0, 0.12)', borderColor: isDark ? '#FFB74D' : '#E65100' }]}>
                            <Ionicons name="checkmark-circle" size={14} color={isDark ? '#FFB74D' : '#E65100'} />
                            <Text style={[styles.primaryActionText, { color: isDark ? '#FFB74D' : '#E65100' }]}>{actionConfig.primaryLabel}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={onOpen}
                            style={[styles.actionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        >
                            <Text style={[styles.primaryActionText, { color: colors.white }]}>{actionConfig.primaryLabel}</Text>
                        </TouchableOpacity>
                    )}
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
    const [selectedTypes, setSelectedTypes] = useState<string[]>(route.params?.typeFilter ? [route.params.typeFilter] : []);
    const [selectedSite, setSelectedSite] = useState<string | null>(route.params?.stationFilter ?? null);
    const [selectedProject, setSelectedProject] = useState<string | null>(route.params?.projectFilter ?? null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stationView, setStationView] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [tempSelectedStatuses, setTempSelectedStatuses] = useState<WorkOrderStatus[]>([]);
    const [tempSelectedTypes, setTempSelectedTypes] = useState<string[]>([]);

    useEffect(() => {
        if (route.params?.stationFilter !== undefined) {
            setSelectedSite(route.params?.stationFilter);
        }
        if (route.params?.typeFilter !== undefined) {
            setSelectedTypes([route.params?.typeFilter]);
        }
        if (route.params?.projectFilter !== undefined) {
            setSelectedProject(route.params?.projectFilter);
        }
    }, [route.params?.stationFilter, route.params?.typeFilter, route.params?.projectFilter]);

    const calculateSmartRouteScore = (item: WorkOrder): number => {
        if (item.id === 'wo-pm-infra-01') return 1000000;
        if (item.id === 'wo-pm-ht-yard-01') return 999000;
        let score = 0;
        
        // 1. Station Business Impact (Highest Priority)
        const impact = STATION_BUSINESS_IMPACT[item.siteName] || 'Medium';
        if (impact === 'High') score += 20000;
        else if (impact === 'Medium') score += 10000;
        
        // 2. Task Priority
        if (item.priority === 'High') score += 5000;
        else if (item.priority === 'Medium') score += 2500;
        
        // 3. Deadline Proximity
        const hoursFromNow = (item.targetTime - Date.now()) / (1000 * 60 * 60);
        score -= hoursFromNow * 100;
        
        // 4. Route / Distance Proximity
        const distanceKm = parseFloat(item.distance.split(' ')[0]) || 0;
        score -= distanceKm * 50;
        
        return score;
    };

    const visibleOrders = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const filtered = WORK_ORDERS.filter((item) => {
            const matchesStatus = selectedStatuses.length === 0 ? true : selectedStatuses.includes(item.status);
            const matchesType = selectedTypes.length === 0 ? true : selectedTypes.includes(item.type);
            const matchesSite = selectedSite ? item.siteName === selectedSite : true;
            const matchesProject = selectedProject ? item.projectId === selectedProject : true;
            const haystack = `${item.title} ${item.siteName} ${item.address} ${item.type} ${item.stage}`.toLowerCase();
            const matchesSearch = query.length === 0 ? true : haystack.includes(query);
            return matchesStatus && matchesType && matchesSite && matchesProject && matchesSearch;
        });

        return filtered.sort((a, b) => {
            return calculateSmartRouteScore(b) - calculateSmartRouteScore(a);
        });
    }, [searchQuery, selectedSite, selectedStatuses, selectedTypes]);

    const toggleStatus = (status: WorkOrderStatus) => {
        setTempSelectedStatuses((current) =>
            current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
        );
    };

    const toggleType = (type: string) => {
        setTempSelectedTypes((current) =>
            current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
        );
    };

    const [slideAnim] = useState(() => new Animated.Value(320));

    useEffect(() => {
        if (showFilterMenu) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [showFilterMenu]);

    const closeFilterMenu = () => {
        Animated.timing(slideAnim, {
            toValue: 320,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setShowFilterMenu(false);
        });
    };

    const openFilters = () => {
        setTempSelectedStatuses([...selectedStatuses]);
        setTempSelectedTypes([...selectedTypes]);
        setShowFilterMenu(true);
    };

    const applyFilters = () => {
        setSelectedStatuses([...tempSelectedStatuses]);
        setSelectedTypes([...tempSelectedTypes]);
        closeFilterMenu();
    };

    const clearTempFilters = () => {
        setTempSelectedStatuses([]);
        setTempSelectedTypes([]);
    };

    const clearAllFilters = () => {
        setSelectedStatuses([]);
        setSelectedTypes([]);
        setSelectedSite(null);
        setSelectedProject(null);
        setSearchQuery('');
    };

    const hasAppliedFilters = Boolean(selectedSite) || Boolean(selectedProject) || selectedStatuses.length > 0 || selectedTypes.length > 0;

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
    
    const filterCounts = useMemo(() => {
        const counts: Record<string, number> = { 
            'Unassigned': 0, 'Assigned': 0, 'Working': 0, 'Under Review': 0, 'Completed': 0,
            'Installation': 0, 'Service': 0, 'Preventive': 0
        };
        WORK_ORDERS.forEach((item) => {
            const matchesStatus = selectedStatuses.length === 0 ? true : selectedStatuses.includes(item.status);
            const matchesType = selectedTypes.length === 0 ? true : selectedTypes.includes(item.type);
            const matchesSite = selectedSite ? item.siteName === selectedSite : true;
            const matchesProject = selectedProject ? item.projectId === selectedProject : true;
            
            // For status counts, we check if it matches type, site, project
            if (matchesType && matchesSite && matchesProject && counts[item.status] !== undefined) {
                counts[item.status]++;
            }
            // For type counts, we check if it matches status, site, project
            if (matchesStatus && matchesSite && matchesProject && counts[item.type] !== undefined) {
                counts[item.type]++;
            }
        });
        return counts;
    }, [selectedTypes, selectedStatuses, selectedSite, selectedProject]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.searchBar, getInputShellStyle(colors)]}>
                        <Ionicons name="search" size={18} color={colors.textSecondary} />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search works or stations"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.searchInput, { color: colors.text }]}
                        />
                    </View>

                    <View style={styles.typeMetricsContainer}>
                        <View style={[styles.typeMetricBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                            <Text style={[styles.typeMetricCount, { color: colors.primary }]}>{filterCounts['Installation'] || 0}</Text>
                            <Text style={[styles.typeMetricLabel, { color: colors.textSecondary }]} numberOfLines={1}>Installation</Text>
                        </View>
                        <View style={[styles.typeMetricBox, { backgroundColor: colors.secondary + '15', borderColor: colors.secondary }]}>
                            <Text style={[styles.typeMetricCount, { color: colors.secondary }]}>{filterCounts['Service'] || 0}</Text>
                            <Text style={[styles.typeMetricLabel, { color: colors.textSecondary }]} numberOfLines={1}>Service</Text>
                        </View>
                        <View style={[styles.typeMetricBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
                            <Text style={[styles.typeMetricCount, { color: colors.warning }]}>{filterCounts['Preventive'] || 0}</Text>
                            <Text style={[styles.typeMetricLabel, { color: colors.textSecondary }]} numberOfLines={1}>Preventive</Text>
                        </View>
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
                            onPress={openFilters}
                            style={[styles.filterDropdown, { backgroundColor: colors.surface, borderColor: colors.border, justifyContent: 'center' }]}
                        >
                            <View style={styles.filterDropdownContent}>
                                <Ionicons name="filter" size={16} color={colors.textSecondary} />
                                <Text style={[styles.filterDropdownText, { color: colors.text }]}>
                                    {selectedStatuses.length + selectedTypes.length === 0 ? 'All' : `${selectedStatuses.length + selectedTypes.length} selected`}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Modal
                        visible={showFilterMenu}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={closeFilterMenu}
                    >
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'stretch' }}
                            activeOpacity={1}
                            onPress={closeFilterMenu}
                        >
                            <Animated.View
                                style={[
                                    styles.sideSlider,
                                    {
                                        backgroundColor: colors.surface,
                                        transform: [{ translateX: slideAnim }]
                                    }
                                ]}
                            >
                                <View style={{ flex: 1 }}>
                                    <View style={styles.bottomSheetHeader}>
                                        <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>Filters</Text>
                                        <TouchableOpacity onPress={closeFilterMenu}>
                                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                                        <Text style={[styles.filterHeader, { color: colors.textSecondary }]}>STATUS</Text>

                                        {STATUS_TABS.map((status) => {
                                            const isSelected = tempSelectedStatuses.includes(status);
                                            return (
                                                <TouchableOpacity
                                                    key={status}
                                                    onPress={() => toggleStatus(status)}
                                                    style={[
                                                        styles.filterMenuItem,
                                                        isSelected && { backgroundColor: colors.primary + '15' }
                                                    ]}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={[styles.filterMenuText, { color: isSelected ? colors.primary : colors.text }]}>{status}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                        <Text style={{ ...FONTS.h3, color: colors.primary, fontSize: 16 }}>{filterCounts[status] || 0}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}

                                        <View style={[styles.filterDivider, { backgroundColor: colors.border, marginTop: 16 }]} />
                                        <Text style={[styles.filterHeader, { color: colors.textSecondary }]}>TYPE</Text>
                                        {['Installation', 'Service', 'Preventive'].map((type) => {
                                            const isSelected = tempSelectedTypes.includes(type);
                                            return (
                                                <TouchableOpacity
                                                    key={type}
                                                    onPress={() => toggleType(type)}
                                                    style={[
                                                        styles.filterMenuItem,
                                                        isSelected && { backgroundColor: colors.primary + '15' }
                                                    ]}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={[styles.filterMenuText, { color: isSelected ? colors.primary : colors.text }]}>{type}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                        <Text style={{ ...FONTS.h3, color: colors.primary, fontSize: 16 }}>{filterCounts[type] || 0}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>

                                    <View style={[styles.stickyFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                                        <TouchableOpacity
                                            onPress={clearTempFilters}
                                            style={[styles.footerButton, { backgroundColor: colors.surfaceHighlight }]}
                                        >
                                            <Text style={[styles.footerButtonText, { color: colors.text }]}>Clear All</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={applyFilters}
                                            style={[styles.footerButton, { backgroundColor: colors.primary }]}
                                        >
                                            <Text style={[styles.footerButtonText, { color: colors.white }]}>Apply Filters</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>
                        </TouchableOpacity>
                    </Modal>

                    {hasAppliedFilters ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.selectedFilterRow}
                        >
                            {selectedProject ? (
                                <TouchableOpacity
                                    onPress={() => setSelectedProject(null)}
                                    style={[styles.siteFilter, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                >
                                    <Ionicons name="folder" size={16} color={colors.primary} />
                                    <Text style={[styles.siteFilterText, { color: colors.text }]}>{selectedProject}</Text>
                                    <Ionicons name="close" size={16} color={colors.textSecondary} />
                                </TouchableOpacity>
                            ) : null}
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
                            {selectedStatuses.map((status) => (
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
                            ))}
                            {selectedTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => toggleType(type)}
                                    style={[
                                        styles.selectedChip,
                                        { backgroundColor: colors.primary + '14', borderColor: colors.primary },
                                    ]}
                                >
                                    <Text style={[styles.selectedChipText, { color: colors.primary }]}>{type}</Text>
                                    <Ionicons name="close" size={14} color={colors.primary} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
                                <EmptyStateIllustration width={196} style={{ marginBottom: 12 }} />
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
        padding: 12,
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
    typeMetricsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
    },
    typeMetricBox: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    typeMetricCount: {
        ...FONTS.h3,
    },
    typeMetricLabel: {
        ...FONTS.bodyStrong,
        fontSize: 12,
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
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    filterMenuText: {
        ...FONTS.bodyStrong,
        fontSize: 16,
    },
    filterHeader: {
        ...FONTS.label,
        fontSize: 10,
        letterSpacing: 1.5,
        marginLeft: 16,
        marginTop: 8,
        marginBottom: 4,
    },
    filterDivider: {
        height: 1,
        marginVertical: 4,
    },
    bottomSheet: {
        width: '100%',
        maxHeight: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 16,
    },
    sideSlider: {
        width: '80%',
        maxWidth: 320,
        height: '100%',
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        overflow: 'hidden',
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    bottomSheetTitle: {
        ...FONTS.h3,
    },
    stickyFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        gap: 12,
        paddingBottom: 36, // For safe area
    },
    footerButton: {
        flex: 1,
        minHeight: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerButtonText: {
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
        paddingHorizontal: 14,
        gap: 8,
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
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadgeInline: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        minHeight: 20,
        justifyContent: 'center',
    },
    statusBadgeTextInline: {
        ...FONTS.label,
        fontSize: 8,
        letterSpacing: 0.5,
        fontWeight: '700',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        gap: 6,
    },
    actionButtonText: {
        ...FONTS.bodyStrong,
        textAlign: 'center',
    },
    primaryActionText: {
        ...FONTS.bodyStrong,
        textAlign: 'center',
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
        alignItems: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    emptyTitle: {
        ...FONTS.h3,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyCopy: {
        ...FONTS.body,
        textAlign: 'center',
    },
});
