import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { WORK_ORDERS } from '../data/fieldDemo';
import { FONTS } from '../styles/futurist';
import { OrderCard } from './ProjectDetailScreen';

export const SingleProjectScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const [showMenu, setShowMenu] = useState(false);

    const projectId = route.params?.projectId;
    const projectName = route.params?.projectName;

    const visibleOrders = useMemo(() => {
        return WORK_ORDERS.filter((item) => item.projectId === projectId && item.type === 'Installation');
    }, [projectId]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.pageTitle, { color: colors.text }]} numberOfLines={1}>
                        {projectName || `Project ${projectId}`}
                    </Text>
                    <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={[styles.actionDropdownButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                        <Text style={[styles.actionDropdownText, { color: colors.text }]}>Actions</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {showMenu && (
                    <TouchableOpacity 
                        style={styles.menuOverlay} 
                        activeOpacity={1} 
                        onPress={() => setShowMenu(false)}
                    >
                        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
                            <TouchableOpacity 
                                style={[styles.dropdownItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} 
                                onPress={() => {
                                    setShowMenu(false);
                                    Alert.alert('Take Live', 'Project is now live.');
                                }}
                            >
                                <Feather name="arrow-up-right" size={20} color={colors.primary} />
                                <Text style={[styles.dropdownText, { color: colors.text }]}>Take Live</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.dropdownItem} 
                                onPress={() => {
                                    setShowMenu(false);
                                    Alert.alert('Complete Project', 'Project has been marked as complete.');
                                }}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                                <Text style={[styles.dropdownText, { color: colors.text }]}>Complete Project</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {visibleOrders.length > 0 ? (
                        <View style={styles.listColumn}>
                            {visibleOrders.map((item) => (
                                <OrderCard
                                    key={item.id}
                                    item={item}
                                    colors={colors}
                                    isDark={isDark}
                                    onOpen={() => navigation.navigate('TaskDetails', { taskId: item.id })}
                                    hideTypeChip={true}
                                    hideStationChip={true}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No installation work found for this project.
                            </Text>
                        </View>
                    )}
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
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    pageTitle: {
        ...FONTS.h3,
        fontSize: 16,
        flex: 1,
    },
    actionDropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    actionDropdownText: {
        ...FONTS.bodyStrong,
    },
    menuOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    dropdown: {
        position: 'absolute',
        top: 0,
        right: 16,
        width: 200,
        borderRadius: 12,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        zIndex: 20,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    dropdownText: {
        ...FONTS.bodyStrong,
    },
    content: {
        padding: 24,
        paddingBottom: 36,
    },
    listColumn: {
        gap: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 64,
        gap: 16,
    },
    emptyText: {
        ...FONTS.body,
        textAlign: 'center',
    },
});
