import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { WORK_ORDERS, ASSETS } from '../data/fieldDemo';
import { FONTS, getInputShellStyle } from '../styles/futurist';

export const ProjectListScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors } = useTheme();
    const [query, setQuery] = useState('');

    const projects = useMemo(() => {
        const uniqueProjects = new Map();
        WORK_ORDERS.forEach(item => {
            if (!uniqueProjects.has(item.projectId)) {
                uniqueProjects.set(item.projectId, {
                    id: item.projectId,
                    projectName: item.title,
                    siteName: item.siteName,
                });
            }
        });
        return Array.from(uniqueProjects.values());
    }, []);

    const visibleProjects = projects.filter((item) => {
        const haystack = `${item.projectName} ${item.siteName}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.searchBar, getInputShellStyle(colors)]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search projects or stations"
                            placeholderTextColor={colors.textSecondary}
                            value={query}
                            onChangeText={setQuery}
                        />
                    </View>

                    {/* Project Metrics Widget */}
                    <View style={styles.metricsRow}>
                        <View style={[styles.metricCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                            <Text style={[styles.metricValue, { color: colors.primary }]}>{projects.length}</Text>
                            <Text style={[styles.metricLabel, { color: colors.textSecondary }]} numberOfLines={1}>Total Projects</Text>
                        </View>

                        <View style={[styles.metricCard, { backgroundColor: colors.secondary + '15', borderColor: colors.secondary }]}>
                            <Text style={[styles.metricValue, { color: colors.secondary }]}>4</Text>
                            <Text style={[styles.metricLabel, { color: colors.textSecondary }]} numberOfLines={1}>Chargers to be taken live</Text>
                        </View>
                    </View>

                    <View style={styles.listColumn}>
                        {visibleProjects.map((item) => {
                            return (
                                <TouchableOpacity 
                                    key={item.id} 
                                    activeOpacity={0.9}
                                    onPress={() => navigation.navigate('SingleProject', { projectId: item.id, projectName: item.projectName })}
                                    style={[styles.projectCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                                        <Text style={[styles.projectTitle, { color: colors.text, flex: 1, marginBottom: 0 }]}>{item.projectName}</Text>
                                        <Text style={[{ ...FONTS.label, color: colors.primary, marginTop: 2 }]}>{item.id}</Text>
                                    </View>
                                    <View style={styles.infoChipRow}>
                                        <View style={[styles.infoChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                            <Text style={[styles.infoChipText, { color: colors.textSecondary }]}>Station:</Text>
                                            <Text style={[styles.infoChipValue, { color: colors.text }]}>{item.siteName}</Text>
                                        </View>
                                    </View>
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
    projectCard: {
        borderRadius: 14,
        padding: 16,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    projectTitle: {
        ...FONTS.h3,
        fontSize: 16,
        marginBottom: 10,
    },
    infoChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
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
    metricsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    metricCard: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    metricValue: {
        ...FONTS.h3,
    },
    metricLabel: {
        ...FONTS.bodyStrong,
        fontSize: 12,
    },
});
