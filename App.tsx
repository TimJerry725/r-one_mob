import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, COMMON_STYLES } from './src/styles/futurist';
import { NeonButton } from './src/components/NeonButton';
import { GlassCard } from './src/components/GlassCard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

export default function App() {
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(300, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedScanLine = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: 0.5,
  }));

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={COMMON_STYLES.container}>
        {/* Background Gradient Mesh */}
        <LinearGradient
          colors={['#050510', '#0a0a25', '#000000']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Ambient Glows */}
        <View style={styles.ambientGlowTop} />
        <View style={styles.ambientGlowBottom} />

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={FONTS.label}>SYSTEM: ONLINE</Text>
              <Text style={FONTS.h1}>C.A.M.S.</Text>
              <Text style={[FONTS.label, { color: COLORS.primary }]}>V2.0 // CHARGER ASSET MANAGEMENT</Text>
            </View>

            {/* Dashboard Grid */}
            <View style={styles.grid}>
              {/* Status Card */}
              <GlassCard style={styles.largeCard}>
                <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden', borderRadius: 16 }]}>
                  <Animated.View style={[styles.scanLine, animatedScanLine]} />
                </View>
                <Text style={FONTS.label}>SYSTEM STATUS</Text>
                <Text style={[FONTS.h1, { color: COLORS.success, marginTop: 8 }]}>OPTIMAL</Text>
                <Text style={[FONTS.body, { marginTop: 4, opacity: 0.7 }]}>
                  All subsystems operational.
                  No critical faults detected.
                </Text>
              </GlassCard>

              {/* Metrics */}
              <View style={styles.row}>
                <GlassCard style={styles.smallCard}>
                  <Text style={FONTS.label}>ACTIVE ASSETS</Text>
                  <Text style={[FONTS.h1, { fontSize: 42 }]}>124</Text>
                </GlassCard>
                <GlassCard style={styles.smallCard}>
                  <Text style={FONTS.label}>PENDING TASKS</Text>
                  <Text style={[FONTS.h1, { fontSize: 42, color: COLORS.warning }]}>08</Text>
                </GlassCard>
              </View>

              {/* Quick Actions */}
              <GlassCard>
                <Text style={[FONTS.label, { marginBottom: 16 }]}>QUICK COMMANDS</Text>
                <NeonButton
                  title="INITIATE SCAN"
                  onPress={() => console.log('Scan')}
                  style={{ marginBottom: 16 }}
                />
                <NeonButton
                  title="DEPLOY ASSETS"
                  variant="secondary"
                  onPress={() => console.log('Deploy')}
                />
              </GlassCard>
            </View>

          </ScrollView>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  largeCard: {
    minHeight: 140,
    justifyContent: 'center',
  },
  smallCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
    transform: [{ scaleX: 1.5 }],
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.secondary,
    opacity: 0.1,
    transform: [{ scaleX: 1.5 }],
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.success,
    top: 0,
    shadowColor: COLORS.success,
    shadowRadius: 10,
    shadowOpacity: 1,
  }
});
