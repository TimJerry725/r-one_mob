import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../styles/futurist';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const TABS = ['Kanban', 'List'];
const STATUS_TABS = ['To-Do', 'Working', 'Approvals', 'Completed'];

const TASKS = [
    {
        id: '1',
        title: 'Crimson Moon - DC installation',
        cpid: 'CP-100239',
        stationName: 'Pune Central Station',
        stage: 'installation',
        type: 'Installation',
        startDate: 'Oct 01, 2024',
        endDate: 'Oct 31, 2024',
        assignees: ['Tony Ware', 'Sarah J.', 'Mike B.'],
        status: 'To-Do'
    },
    {
        id: '2',
        title: 'Solar Grid - Site Survey',
        cpid: 'CP-200451',
        stationName: 'Mumbai Highway Point',
        stage: 'technical-site-survey',
        type: 'Installation',
        startDate: 'Oct 05, 2024',
        endDate: 'Oct 15, 2024',
        assignees: ['Cynthia Wolf', 'Tony W.'],
        status: 'Working'
    },
    {
        id: '3',
        title: 'Periodic Maintenance - Unit 4',
        cpid: 'CP-100102',
        stationName: 'Skyline Mall Parking',
        stage: 'commissioning',
        type: 'Maintenance',
        startDate: 'Oct 10, 2024',
        endDate: 'Oct 12, 2024',
        assignees: ['Alex Smith'],
        status: 'Approvals'
    },
    {
        id: '4',
        title: 'Grid Connection Setup',
        cpid: 'CP-300182',
        stationName: 'Industrial Zone B',
        stage: 'grid-connection-waiting',
        type: 'Installation',
        startDate: 'Oct 20, 2024',
        endDate: 'Nov 05, 2024',
        assignees: ['Sarah Jones', 'Alex S.', 'Cynthia W.'],
        status: 'Completed'
    },
    {
        id: '5',
        title: 'Emergency Repair',
        cpid: 'CP-100555',
        stationName: 'City Square Terminal',
        stage: 'installation-planning',
        type: 'Maintenance',
        startDate: 'Oct 25, 2024',
        endDate: 'Oct 26, 2024',
        assignees: ['Mike Brown', 'Tony W.'],
        status: 'To-Do'
    },
    {
        id: '6',
        title: 'Preliminary Quote - Station 8',
        cpid: 'CP-400912',
        stationName: 'North Tech Park',
        stage: 'preliminary-quotation',
        type: 'Installation',
        startDate: 'Nov 01, 2024',
        endDate: 'Nov 10, 2024',
        assignees: ['Sarah Jones', 'Mike B.'],
        status: 'Approvals'
    },
    {
        id: '7',
        title: 'Executive Design Review',
        cpid: 'CP-100882',
        stationName: 'East Coast Marina',
        stage: 'executive-design',
        type: 'Installation',
        startDate: 'Nov 05, 2024',
        endDate: 'Nov 20, 2024',
        assignees: ['Cynthia Wolf', 'Alex S.'],
        status: 'Working'
    },
    {
        id: '8',
        title: 'Permitting - West Sector',
        cpid: 'CP-500213',
        stationName: 'West Sector Hub',
        stage: 'permitting',
        type: 'Installation',
        startDate: 'Nov 10, 2024',
        endDate: 'Dec 05, 2024',
        assignees: ['Tony Ware'],
        status: 'Approvals'
    },
    {
        id: '9',
        title: 'Quotation Refactoring',
        cpid: 'CP-200331',
        stationName: 'South Gate Center',
        stage: 'quotation',
        type: 'Installation',
        startDate: 'Nov 15, 2024',
        endDate: 'Nov 25, 2024',
        assignees: ['Alex Smith', 'Tony W.'],
        status: 'To-Do'
    },
    {
        id: '10',
        title: 'Station Commissioning',
        cpid: 'CP-600442',
        stationName: 'Central Plaza Apex',
        stage: 'commissioning',
        type: 'Installation',
        startDate: 'Dec 01, 2024',
        endDate: 'Dec 15, 2024',
        assignees: ['Mike Brown', 'Sarah J.'],
        status: 'Completed'
    }
];

const MOCK_STATIONS = [
    {
        id: 's1',
        title: 'Pune Central Station',
        address: 'Shivajinagar, Pune, Maharashtra',
        projectCount: '05'
    },
    {
        id: 's2',
        title: 'Mumbai Highway Point',
        address: 'Panvel, Mumbai, Maharashtra',
        projectCount: '15'
    },
    {
        id: 's3',
        title: 'Skyline Mall Parking',
        address: 'MG Road, Bangalore, Karnataka',
        projectCount: '10'
    },
    {
        id: 's4',
        title: 'Industrial Zone B',
        address: 'Peenya, Bangalore, Karnataka',
        projectCount: '08'
    },
    {
        id: 's5',
        title: 'City Square Terminal',
        address: 'T. Nagar, Chennai, Tamil Nadu',
        projectCount: '12'
    }
];

import { useTheme } from '../context/ThemeContext';

// ... (keep constants)

const TaskCard = ({ item, onPress, style }: { item: any, onPress: (id: string) => void, style?: any }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.taskCard, { backgroundColor: colors.surface }, style]}
            onPress={() => onPress(item.id)}
        >
            <View style={styles.taskHeader}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
            </View>


            <View style={styles.idRow}>
                <View style={[styles.idBadge, { backgroundColor: colors.surfaceHighlight }]}>
                    <Text style={[styles.idText, { color: colors.textSecondary }]}>CPID: </Text>
                    <Text style={[styles.idValue, { color: colors.text }]}>{item.cpid}</Text>
                </View>
                <View style={[styles.idBadge, { backgroundColor: colors.surfaceHighlight }]}>
                    <Text style={[styles.idText, { color: colors.textSecondary }]}>Station: </Text>
                    <Text style={[styles.idValue, { color: colors.text }]}>{item.stationName}</Text>
                </View>
            </View>

            <View style={styles.tagRow}>
                <View style={[styles.tag, { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }]}>
                    <Text style={[styles.tagText, { color: colors.primary, fontSize: 11 }]}>{item.stage?.replace(/-/g, ' ').toUpperCase()}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: item.type === 'Installation' ? colors.success + '20' : colors.warning + '20' }]}>
                    <Text style={[styles.tagText, { color: item.type === 'Installation' ? colors.success : colors.warning, fontSize: 11 }]}>{item.type}</Text>
                </View>
            </View>



            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.startDate} - {item.endDate}</Text>
                </View>
            </View>

            <View style={styles.assigneeRow}>
                <View style={styles.assigneeSection}>
                    <View style={styles.avatarGroup}>
                        {item.assignees?.map((name: string, index: number) => (
                            <View
                                key={index}
                                style={[
                                    styles.avatar,
                                    {
                                        backgroundColor: colors.primary,
                                        marginLeft: index === 0 ? 0 : -8,
                                        borderWidth: 2,
                                        borderColor: colors.surface
                                    }
                                ]}
                            >
                                <Text style={[styles.avatarText, { color: colors.white }]}>{name[0]}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.leadInfo}>
                        <Text style={[styles.assigneeName, { color: colors.text }]}>{item.assignees[0]}</Text>
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.success + '15' }]}
                        onPress={() => { }}
                    >
                        <Ionicons name="checkmark" size={22} color={colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.warning + '15' }]}
                        onPress={() => onPress(item.id)}
                    >
                        <Ionicons name="arrow-redo" size={22} color={colors.warning} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const StationCard = ({ item, onPress }: { item: any, onPress: (title: string) => void }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.stationCard, { backgroundColor: colors.surface }]}
            onPress={() => onPress(item.title)}
        >
            <View style={styles.stationInfo}>
                <Text style={[styles.stationName, { color: colors.primary }]}>{item.title}</Text>
                <Text style={[styles.stationAddress, { color: colors.textSecondary }]}>{item.address}</Text>
            </View>
            <View style={styles.stationCountContainer}>
                <Text style={[styles.stationCount, { color: colors.primary }]}>{item.projectCount}</Text>
            </View>
        </TouchableOpacity>
    );
};

export const ProjectDetailScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('List');
    const [activeStatus, setActiveStatus] = useState('To-Do');
    const [activeFilter, setActiveFilter] = useState('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [isGroupingEnabled, setIsGroupingEnabled] = useState(false);
    const [selectedStation, setSelectedStation] = useState<string | null>(null);

    const handleStationPress = (stationName: string) => {
        setSelectedStation(stationName);
        setIsGroupingEnabled(false);
    };

    const handleTaskPress = (id: string) => {
        navigation.navigate('TaskDetails', { taskId: id });
    };

    const renderKanbanBoard = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kanbanContainer}
        >
            {STATUS_TABS.map(status => {
                const statusTasks = TASKS.filter(t => t.status === status);
                return (
                    <View key={status} style={[styles.kanbanColumn, { backgroundColor: isDark ? 'rgba(26, 26, 36, 0.5)' : colors.surfaceHighlight }]}>
                        <View style={styles.kanbanHeader}>
                            <Text style={[styles.kanbanTitle, { color: colors.text }]}>{status}</Text>
                            <View style={[styles.kanbanBadge, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.kanbanBadgeText, { color: colors.textSecondary }]}>{statusTasks.length}</Text>
                            </View>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {statusTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    item={task}
                                    onPress={handleTaskPress}
                                    style={styles.kanbanCard}
                                />
                            ))}
                            {statusTasks.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No tasks</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                );
            })}
        </ScrollView>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Header removed as per user request */}

                {/* View Toggles */}
                <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && { backgroundColor: isDark ? colors.white : colors.primary }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <View style={styles.tabContent}>
                                {tab === 'List' && (
                                    <Ionicons
                                        name="list"
                                        size={18}
                                        color={activeTab === tab ? (isDark ? colors.black : colors.white) : colors.textSecondary}
                                        style={{ marginRight: 6 }}
                                    />
                                )}
                                {tab === 'Kanban' && (
                                    <Ionicons
                                        name="grid"
                                        size={18}
                                        color={activeTab === tab ? (isDark ? colors.black : colors.white) : colors.textSecondary}
                                        style={{ marginRight: 6 }}
                                    />
                                )}
                                <Text style={[
                                    styles.tabText,
                                    activeTab === tab && { color: isDark ? colors.black : colors.white, fontWeight: '700' }
                                ]}>
                                    {tab}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Filter & Program View Section */}
                <View style={[styles.filterSection, { marginTop: 12 }]}>
                    <View style={[styles.filterRow, { gap: 12 }]}>
                        <TouchableOpacity
                            style={[styles.filterDropdown, { backgroundColor: colors.surface, borderColor: colors.border, flex: 1 }]}
                            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                        >
                            <View style={styles.filterDropdownContent}>
                                <Ionicons name="filter" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                                <Text style={[styles.filterDropdownText, { color: colors.text }]}>{activeFilter}</Text>
                            </View>
                            <Ionicons name={showFilterDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.groupSwitch,
                                { backgroundColor: colors.surface, borderColor: colors.border, flex: 1 },
                                isGroupingEnabled && { borderColor: colors.primary }
                            ]}
                            onPress={() => setIsGroupingEnabled(!isGroupingEnabled)}
                        >
                            <Text style={[styles.groupSwitchText, { color: isGroupingEnabled ? colors.primary : colors.textSecondary }]}>Station View</Text>
                            <View style={[
                                styles.switchOuter,
                                { backgroundColor: isGroupingEnabled ? colors.primary : colors.textSecondary + '40' }
                            ]}>
                                <View style={[
                                    styles.switchInner,
                                    { transform: [{ translateX: isGroupingEnabled ? 16 : 2 }] }
                                ]} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {showFilterDropdown && (
                        <View style={[styles.filterMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {['All', 'High Priority', 'Medium', 'Low', 'Recent'].map((filter) => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[
                                        styles.filterMenuItem,
                                        activeFilter === filter && { backgroundColor: isDark ? colors.surfaceHighlight : colors.background }
                                    ]}
                                    onPress={() => {
                                        setActiveFilter(filter);
                                        setShowFilterDropdown(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.filterMenuText,
                                        { color: colors.textSecondary },
                                        activeFilter === filter && { color: colors.primary, fontWeight: '700' }
                                    ]}>{filter}</Text>
                                    {activeFilter === filter && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Conditionally Render List Status Pills OR Kanban Board */}
                {activeTab === 'List' ? (
                    <>
                        {selectedStation && (
                            <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
                                <TouchableOpacity
                                    style={[styles.activeStationChip, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                                    onPress={() => setSelectedStation(null)}
                                >
                                    <Ionicons name="location" size={14} color={colors.primary} />
                                    <Text style={[styles.activeStationText, { color: colors.primary }]}>{selectedStation}</Text>
                                    <View style={[styles.closeCircle, { backgroundColor: colors.primary }]}>
                                        <Ionicons name="close" size={10} color={colors.white} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={styles.statusTabContainer}>
                            {STATUS_TABS.map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusTab,
                                        { backgroundColor: colors.surface },
                                        activeStatus === status && { backgroundColor: isDark ? colors.white : colors.primary }
                                    ]}
                                    onPress={() => setActiveStatus(status)}
                                >
                                    <Text style={[
                                        styles.statusTabText,
                                        activeStatus === status && { color: isDark ? colors.black : colors.white, fontWeight: '700' }
                                    ]}>{status}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={(isGroupingEnabled
                                    ? MOCK_STATIONS
                                    : TASKS.filter(task =>
                                        task.status === activeStatus &&
                                        (!selectedStation || task.stationName === selectedStation)
                                    )
                                ) as any[]}
                                renderItem={({ item }) => (
                                    isGroupingEnabled
                                        ? <StationCard item={item} onPress={handleStationPress} />
                                        : <TaskCard item={item} onPress={handleTaskPress} />
                                )}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.taskList}
                                ListEmptyComponent={
                                    <View style={styles.emptyList}>
                                        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                                            {isGroupingEnabled ? 'No stations found' : 'No tasks in this stage'}
                                        </Text>
                                    </View>
                                }
                            />
                        </View>
                    </>
                ) : (
                    <View style={{ flex: 1, marginTop: 20 }}>
                        {renderKanbanBoard()}
                    </View>
                )}

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: 24,
        borderRadius: 30,
        padding: 4,
        marginTop: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12, // Standardized 12px
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: COLORS.white,
    },
    tabText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: COLORS.black,
    },
    filterSection: {
        paddingHorizontal: 24,
        marginTop: 12,
        zIndex: 10,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    filterDropdown: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12, // Standardized 12px
        paddingVertical: 12,   // Standardized 12px
        borderRadius: 16,
        borderWidth: 1,
    },
    groupSwitch: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    groupSwitchText: {
        fontSize: 12,
        fontWeight: '600',
    },
    switchOuter: {
        width: 36,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
    },
    switchInner: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFF',
    },
    filterDropdownContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterDropdownText: {
        fontSize: 14,
        fontWeight: '600',
    },
    filterMenu: {
        position: 'absolute',
        top: 60,
        left: 24,
        right: 24,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        zIndex: 11,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    filterMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12, // Standardized 12px
        paddingVertical: 12,   // Standardized 12px
    },
    filterMenuText: {
        fontSize: 14,
    },
    stationCard: {
        borderRadius: 12,
        padding: 24,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stationInfo: {
        flex: 1,
    },
    stationName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    stationAddress: {
        fontSize: 14,
    },
    stationCountContainer: {
        marginLeft: 16,
        width: 60,
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
        backgroundColor: COLORS.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stationCount: {
        fontSize: 24,
        fontWeight: '800',
    },
    statusTabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 12,
        gap: 12, // Standardized 12px gap
    },
    statusTab: {
        flex: 1, // Equal width
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeStatusTab: {
        backgroundColor: COLORS.white,
    },
    statusTabText: {
        color: COLORS.textSecondary,
        fontWeight: '500',
        fontSize: 12, // Slightly smaller to ensure "Completed" fits in equal width
    },
    activeStatusTabText: {
        color: COLORS.black,
        fontWeight: '700',
    },
    taskList: {
        paddingHorizontal: 24,
        paddingTop: 12, // Spacing from top tabs
        paddingBottom: 40,
    },
    taskCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12, // Standardized 12px
        marginBottom: 12, // Standardized 12px
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    taskTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    idRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    idBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
    },
    idText: {
        fontSize: 11,
    },
    idValue: {
        fontSize: 11,
        fontWeight: '700',
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    assigneeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    assigneeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leadInfo: {
        justifyContent: 'center',
    },
    leadLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: 2,
    },
    assigneeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    assigneeName: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 13,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Kanban Styles
    kanbanContainer: {
        paddingHorizontal: 10,
    },
    kanbanColumn: {
        width: 300,
        marginHorizontal: 10,
        backgroundColor: 'rgba(26, 26, 36, 0.5)', // slightly transparent surface
        borderRadius: 20,
        padding: 12,
        height: '95%',
    },
    kanbanHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    kanbanTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    kanbanBadge: {
        backgroundColor: COLORS.surfaceHighlight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    kanbanBadgeText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    kanbanCard: {
        marginBottom: 12,
        padding: 16, // Slightly clearer padding for narrower cards
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyStateText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontStyle: 'italic',
    },
    emptyList: {
        padding: 40,
        alignItems: 'center',
    },
    activeStationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    activeStationText: {
        fontSize: 12,
        fontWeight: '700',
    },
    closeCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
