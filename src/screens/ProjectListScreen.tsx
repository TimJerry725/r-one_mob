import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../styles/futurist';
import { GlassCard } from '../components/GlassCard';
import { useNavigation } from '@react-navigation/native';

const DEMO_PROJECTS = [
    { id: '1', name: 'Alpha Station', status: 'ACTIVE', progress: 75 },
    { id: '2', name: 'Beta Grid', status: 'PENDING', progress: 30 },
    { id: '3', name: 'Gamma Link', status: 'COMPLETED', progress: 100 },
    { id: '4', name: 'Delta Node', status: 'CRITICAL', progress: 10 },
];

export const ProjectListScreen = () => {
    const navigation = useNavigation();

    const renderItem = ({ item }: { item: any }) => (
        <GlassCard style={styles.projectCard}>
            <View style={styles.cardRow}>
                <View>
                    <Text style={styles.projectName}>{item.name}</Text>
                    <Text style={[styles.projectStatus, {
                        color: item.status === 'ACTIVE' ? COLORS.primary :
                            item.status === 'COMPLETED' ? COLORS.success :
                                item.status === 'CRITICAL' ? COLORS.danger : COLORS.secondary
                    }]}>
                        {item.status} // {item.progress}%
                    </Text>
                </View>
                <View style={styles.indicator} />
            </View>
        </GlassCard>
    );

    return (
        <LinearGradient
            colors={[COLORS.background, '#000000']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>{'< BACK'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>PROJECTS</Text>
                </View>

                <FlatList
                    data={DEMO_PROJECTS}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            </SafeAreaView>
        </LinearGradient>
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
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        ...FONTS.label,
        color: COLORS.primary,
    },
    title: {
        ...FONTS.h2,
        fontSize: 24,
    },
    listContent: {
        padding: 24,
        gap: 16,
    },
    projectCard: {
        padding: 20,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    projectName: {
        ...FONTS.h2,
        fontSize: 18,
        marginBottom: 4,
    },
    projectStatus: {
        ...FONTS.label,
        fontSize: 12,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.surfaceHighlight,
    }
});
