import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

export const AssetScanScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const [cpid, setCpid] = useState('');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [hasError, setHasError] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={[styles.container, { backgroundColor: '#000' }]} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={[styles.container, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#FFF', marginBottom: 20 }}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={{ padding: 10, backgroundColor: colors.primary, borderRadius: 5 }}>
                    <Text style={{ color: '#FFF' }}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
        setScanned(true);
        setCpid(data);
        // Reset scanned state after a delay or upon user action
        setTimeout(() => setScanned(false), 2000);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={isTorchOn}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.scrollContent}>
                    {/* Top Card */}
                    <BlurView intensity={80} tint="dark" style={[styles.topCard, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                        <Text style={[styles.topCardTitle, { color: '#FFF' }]}>Scan QR Code</Text>
                        <Text style={[styles.topCardSubtitle, { color: 'rgba(255,255,255,0.6)' }]}>or enter CPID manually</Text>

                        <View style={styles.inputWrapper}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter CPID"
                                    placeholderTextColor="#999"
                                    value={cpid}
                                    onChangeText={setCpid}
                                />
                                <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="search" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>

                    <View style={styles.scanContainer}>
                        <View style={[styles.scanFrame, { borderColor: colors.primary }]} />

                        {hasError && (
                            <Text style={[styles.errorText, { color: colors.primary }]}>
                                Invalid QR code. Please try again.
                            </Text>
                        )}
                    </View>

                    {/* Bottom Controls */}
                    <BlurView intensity={80} tint="dark" style={[styles.bottomControlsCard, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                        <TouchableOpacity
                            style={styles.controlBtnItem}
                            onPress={() => setIsTorchOn(!isTorchOn)}
                        >
                            <View style={styles.controlCircle}>
                                <Ionicons name={isTorchOn ? "flash" : "flash-off"} size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.controlText}>Flash {isTorchOn ? "On" : "Off"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlBtnItem}>
                            <View style={styles.controlCircle}>
                                <Ionicons name="information" size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.controlText}>Help</Text>
                        </TouchableOpacity>
                    </BlurView>
                </View>

                {/* Bottom Navigation Bar */}
                <View style={[styles.bottomNav, { backgroundColor: '#000', borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}>
                        <Ionicons name="map-outline" size={24} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainTabs', { screen: 'Work' })}>
                        <Ionicons name="briefcase-outline" size={24} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => { }}>
                        <View style={[styles.visionNavBtn, { backgroundColor: colors.primary }]}>
                            <Ionicons name="qr-code" size={24} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Ionicons name="search-outline" size={24} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}>
                        <Ionicons name="person-outline" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView >
        </View >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topCard: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 40,
        overflow: 'hidden',
    },
    topCardTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    topCardSubtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    inputWrapper: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 6,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 44,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000',
    },
    searchBtn: {
        width: 44,
        height: 41,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    scanFrame: {
        width: 260,
        height: 260,
        borderWidth: 3,
        borderRadius: 30, // Rounded as in reference
        backgroundColor: 'transparent',
        overflow: 'hidden', // Ensure camera stays within bounds
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    errorText: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    bottomControlsCard: {
        flexDirection: 'row',
        borderRadius: 30,
        padding: 20,
        gap: 40,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    controlBtnItem: {
        alignItems: 'center',
    },
    controlCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    controlText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    bottomNav: {
        flexDirection: 'row',
        height: 80,
        borderTopWidth: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 10,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    visionNavBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
});
