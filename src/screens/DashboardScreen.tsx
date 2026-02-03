import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../styles/futurist';
import { NeonButton } from '../components/NeonButton';
import { GlassCard } from '../components/GlassCard';
import { Logo } from '../components/Logo';
import { useNavigation } from '@react-navigation/native';

export const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const scanLineY = useRef(new Animated.Value(0)).current;

    // Simulate scanning line animation
    useEffect(() => {
        Animated.loop(
            Animated.timing(scanLineY, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateY = scanLineY.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 80], // Approximate height of the status card
    });

    return (
        <LinearGradient
            colors={[COLORS.background, '#000000']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.header}>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>SYSTEM ONLINE</Text>
                        </View>
                        <Logo width={210} height={50} style={{ marginBottom: 10 }} />
                        <Text style={styles.subtitle}>V2.0 // FUTURIST PROTOCOL</Text>
                    </View>

                    <View style={styles.dashboardGrid}>

                        {/* Main Status Card */}
                        <GlassCard style={styles.mainCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>SYSTEM STATUS</Text>
                                <Text style={[styles.cardValue, { color: COLORS.success }]}>OPTIMAL</Text>
                            </View>
                            {/* Scanning Animation */}
                            <Animated.View style={[
                                styles.scanLine,
                                {
                                    backgroundColor: COLORS.primary,
                                    transform: [{ translateY }]
                                }
                            ]} />
                            <Text style={styles.cardLabel}>All modules functioning within normal parameters.</Text>
                        </GlassCard>

                        {/* Metrics Row */}
                        <View style={styles.row}>
                            <GlassCard style={styles.metricCard}>
                                <Text style={styles.metricLabel}>ACTIVE ASSETS</Text>
                                <Text style={styles.metricValue}>124</Text>
                            </GlassCard>
                            <GlassCard style={[styles.metricCard, { borderColor: COLORS.secondary }]}>
                                <Text style={styles.metricLabel}>PENDING TASKS</Text>
                                <Text style={[styles.metricValue, { color: COLORS.secondary }]}>08</Text>
                            </GlassCard>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.actionsContainer}>
                            <Text style={styles.sectionTitle}>QUICK COMMANDS</Text>
                            <NeonButton
                                title="NEW SCAN"
                                onPress={() => navigation.navigate('AssetScan')}
                            />
                            <View style={{ height: 16 }} />
                            <NeonButton
                                title="PROJECTS"
                                variant="secondary"
                                onPress={() => navigation.navigate('ProjectList')}
                            />
                            <View style={{ height: 16 }} />
                            <NeonButton
                                title="EMERGENCY SHUTDOWN"
                                variant="danger"
                                onPress={() => console.log('Emergency')}
                            />
                        </View>

                    </View>
                </ScrollView>
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
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.3)',
        marginBottom: 16,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginRight: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
    },
    statusText: {
        ...FONTS.label,
        color: COLORS.primary,
        fontSize: 10,
        letterSpacing: 2,
    },
    title: {
        ...FONTS.h1,
        fontSize: 48,
        textAlign: 'center',
        textShadowColor: COLORS.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    subtitle: {
        ...FONTS.label,
        marginTop: 8,
        opacity: 0.7,
        letterSpacing: 4,
    },
    dashboardGrid: {
        gap: 20,
    },
    mainCard: {
        padding: 24,
        minHeight: 160,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        ...FONTS.label,
        color: COLORS.onSurface,
    },
    cardValue: {
        ...FONTS.h2,
        fontSize: 18,
        color: COLORS.success,
        textShadowColor: COLORS.success,
        textShadowRadius: 10,
    },
    cardLabel: {
        ...FONTS.body,
        fontSize: 14,
        opacity: 0.8,
        marginTop: 12,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: COLORS.primary,
        opacity: 0.8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    metricCard: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    metricLabel: {
        ...FONTS.label,
        fontSize: 10,
        marginBottom: 8,
        textAlign: 'center',
    },
    metricValue: {
        ...FONTS.h1,
        fontSize: 36,
    },
    actionsContainer: {
        marginTop: 12,
    },
    sectionTitle: {
        ...FONTS.label,
        marginBottom: 20,
        marginLeft: 4,
    },
});
