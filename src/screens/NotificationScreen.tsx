import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../styles/futurist';

const INITIAL_NOTIFICATIONS = [
    {
        id: '1',
        type: 'Projects',
        title: 'Project end date approaching',
        description: 'Project "Vienna West Hub" scheduled end date is approaching.',
        timestamp: '18 Mar 2026, 05:47 AM',
        isStarred: false,
        isRead: false,
    },
    {
        id: '2',
        type: 'Checklists',
        title: 'Checklist has been created',
        description: 'Checklist "Site survey readiness" has been created in project "Vienna West Hub".',
        timestamp: '18 Mar 2026, 03:47 AM',
        isStarred: false,
        isRead: true, 
    },
    {
        id: '3',
        type: 'Checklists',
        title: 'Checklist has been assigned',
        description: 'Checklist "Pre-site readiness" has been assigned to "Andrea Meuschke" in project "Vienna West Hub".',
        timestamp: '18 Mar 2026, 01:47 AM',
        isStarred: false,
        isRead: false,
    },
    {
        id: '4',
        type: 'Others',
        title: 'Milestone moved to under review',
        description: 'Milestone "Grid energization" moved to Under Review in project "Project Vienna 102".',
        timestamp: '18 Mar 2026, 01:47 AM',
        isStarred: false,
        isRead: false,
    },
    {
        id: '5',
        type: 'Checklists',
        title: 'Checklist moved to working',
        description: 'Checklist "Cable trench inspection" status changed from "Assigned" to "Working" in project "North Loop Fast Charging Hub".',
        timestamp: '17 Mar 2026, 11:47 PM',
        isStarred: true,
        isRead: false,
    },
];

const FILTER_TYPES = ['All', 'Starred', 'Projects', 'Checklists', 'Others'];

export const NotificationScreen = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filteredNotifications = notifications.filter(item => {
        if (selectedFilter === 'All') return true;
        if (selectedFilter === 'Starred') return item.isStarred;
        return item.type === selectedFilter;
    });

    const allRead = notifications.length > 0 && notifications.every(n => n.isRead);

    const handleHeaderToggle = () => {
        if (allRead) {
            setNotifications(prev => prev.map(item => ({ ...item, isRead: false })));
        } else {
            setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
        }
    };

    const toggleStar = (id: string) => {
        setNotifications(prev => prev.map(item => 
            item.id === id ? { ...item, isStarred: !item.isStarred } : item
        ));
    };

    const toggleRead = (id: string) => {
        setNotifications(prev => prev.map(item => 
            item.id === id ? { ...item, isRead: !item.isRead } : item
        ));
    };

    const handlePressNotification = (item: any) => {
        if (item.type === 'Projects') {
            navigation.navigate('MainTabs', { screen: 'Work' });
        } else if (item.type === 'Checklists') {
            navigation.navigate('TaskDetails', { taskId: 'task-1' });
        } else {
            navigation.navigate('MainTabs', { screen: 'Work' });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={22} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={handleHeaderToggle}>
                            <Text style={[styles.markAllText, { color: colors.secondary }]}>
                                {allRead ? 'Unread all' : 'Mark all as read'}
                            </Text>
                        </TouchableOpacity>
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.badgeText}>{notifications.filter(n => !n.isRead).length}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {FILTER_TYPES.map(type => {
                            const isSelected = selectedFilter === type;
                            return (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setSelectedFilter(type)}
                                    style={[
                                        styles.filterChip,
                                        { 
                                            backgroundColor: isSelected ? colors.primary + '14' : colors.surface, 
                                            borderColor: isSelected ? colors.primary : colors.border 
                                        }
                                    ]}
                                >
                                    <Text style={[styles.filterChipText, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {filteredNotifications.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.92}
                            onPress={() => {
                                if (!item.isRead) {
                                    toggleRead(item.id);
                                }
                                handlePressNotification(item);
                            }}
                            style={[
                                styles.notificationCard,
                                {
                                    backgroundColor: item.isRead ? colors.surface : (isDark ? colors.primary + '11' : colors.primary + '0A'),
                                    shadowColor: colors.shadow,
                                },
                            ]}
                        >
                            <View style={styles.notificationMainContent}>
                                <View style={styles.notificationInfo}>
                                    <View style={styles.titleRow}>
                                        {!item.isRead && (
                                            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                                        )}
                                        <Text style={[styles.notificationTitle, { color: colors.text, flex: 1 }]} numberOfLines={2}>
                                            {item.title}
                                        </Text>
                                    </View>
                                    <Text style={[styles.notificationDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                    
                                    <View style={styles.bottomRow}>
                                        <View style={styles.chipAndDate}>
                                            <View style={[
                                                styles.typeBadge, 
                                                { 
                                                    backgroundColor: 
                                                        item.type === 'Projects' ? '#E2315115' : 
                                                        item.type === 'Checklists' ? '#4CA7FF15' : colors.surfaceHighlight 
                                                }
                                            ]}>
                                                <Text style={[
                                                    styles.typeBadgeText, 
                                                    { 
                                                        color: 
                                                            item.type === 'Projects' ? '#E23151' : 
                                                            item.type === 'Checklists' ? '#4CA7FF' : colors.textSecondary 
                                                    }
                                                ]}>
                                                    {item.type}
                                                </Text>
                                            </View>
                                            <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{item.timestamp}</Text>
                                        </View>
                                        
                                        <View style={styles.notificationActions}>
                                            <TouchableOpacity 
                                                onPress={() => toggleStar(item.id)}
                                                style={[
                                                    styles.actionIconWrap, 
                                                    { backgroundColor: item.isStarred ? '#FFF3D0' : 'transparent', borderRadius: 8, padding: item.isStarred ? 4 : 0 }
                                                ]}
                                            >
                                                <Ionicons 
                                                    name="star" 
                                                    size={16} 
                                                    color={item.isStarred ? '#FFB020' : colors.border} 
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity 
                                                onPress={() => toggleRead(item.id)}
                                                style={[
                                                    styles.actionIconWrap, 
                                                    { backgroundColor: item.isRead ? 'transparent' : colors.primary + '15', borderRadius: 8, padding: !item.isRead ? 4 : 0 }
                                                ]}
                                            >
                                                <Ionicons 
                                                    name={item.isRead ? "mail-open" : "mail"} 
                                                    size={16} 
                                                    color={item.isRead ? colors.textSecondary : colors.primary} 
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                    {filteredNotifications.length === 0 ? (
                        <View style={[styles.emptyCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                            <EmptyStateIllustration width={196} style={{ marginBottom: 12 }} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No results</Text>
                            <Text style={[styles.emptyCopy, { color: colors.textSecondary }]}>
                                You have no notifications in this category.
                            </Text>
                        </View>
                    ) : null}
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginLeft: -6,
        marginRight: 8,
        minWidth: 28,
        minHeight: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...FONTS.h3,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    markAllText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
    badge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        ...FONTS.bodyStrong,
        color: '#FFFFFF',
        fontSize: 13,
    },
    filterContainer: {
        paddingVertical: 16,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterChip: {
        minHeight: 38,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    filterChipText: {
        ...FONTS.label,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 8,
    },
    notificationCard: {
        borderRadius: 14,
        padding: 16,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    notificationMainContent: {
        flex: 1,
    },
    notificationInfo: {
        flex: 1,
        gap: 6,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
    },
    notificationTitle: {
        ...FONTS.bodyStrong,
        fontSize: 15,
    },
    notificationDesc: {
        ...FONTS.body,
        fontSize: 13,
        marginLeft: 16,
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 16,
    },
    chipAndDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    notificationTime: {
        ...FONTS.body,
        fontSize: 12,
    },
    typeBadge: {
        minHeight: 22,
        borderRadius: 6,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    typeBadgeText: {
        ...FONTS.label,
        fontSize: 9,
    },
    notificationActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyCard: {
        borderRadius: 16,
        padding: 20,
        marginTop: 10,
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
