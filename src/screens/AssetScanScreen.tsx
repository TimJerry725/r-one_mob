import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../context/ThemeContext';
import { ASSETS } from '../data/fieldDemo';
import { FONTS, getInputShellStyle } from '../styles/futurist';

const getAssetMatch = (value: string) =>
    ASSETS.find((item) => {
        const query = value.trim().toLowerCase();
        if (!query) {
            return false;
        }
        return item.cpid.toLowerCase().includes(query) || item.serial.toLowerCase().includes(query);
    });

export const AssetScanScreen = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const [cpid, setCpid] = useState('');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [hasError, setHasError] = useState(false);

    const matchedAsset = getAssetMatch(cpid);
    const recentAssets = ASSETS.slice(0, 5);
    const [recentModalVisible, setRecentModalVisible] = useState(false);

    const openAssetDetails = (assetId?: string) => {
        navigation.navigate('AssetDetails', { assetId: assetId ?? recentAssets[0].id });
    };

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        setCpid(data);
        setHasError(!getAssetMatch(data));
        setTimeout(() => setScanned(false), 1400);
    };

    if (!permission) {
        return <View style={[styles.container, { backgroundColor: colors.background }]} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.fallbackContent}>
                        <Text style={[styles.fallbackTitle, { color: colors.text }]}>Camera access needed for barcode scan</Text>
                        <Text style={[styles.fallbackCopy, { color: colors.textSecondary }]}>
                            Manual CPID entry still works offline if the camera is unavailable.
                        </Text>

                        <View style={[styles.manualCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                            <TextInput
                                style={[styles.manualInput, getInputShellStyle(colors), { color: colors.text }]}
                                placeholder="Enter CPID or serial"
                                placeholderTextColor={colors.textSecondary}
                                value={cpid}
                                onChangeText={(value) => {
                                    setCpid(value);
                                    setHasError(value.length > 0 && !getAssetMatch(value));
                                }}
                            />
                            <TouchableOpacity onPress={requestPermission} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
                                <Text style={[styles.primaryButtonText, { color: colors.white }]}>Grant camera access</Text>
                            </TouchableOpacity>
                        </View>

                        {matchedAsset ? (
                            <TouchableOpacity
                                onPress={() => openAssetDetails(matchedAsset.id)}
                                style={[styles.resultCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                            >
                                <Text style={[styles.resultTitle, { color: colors.text }]}>{matchedAsset.model}</Text>
                                <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                                    {matchedAsset.cpid} • {matchedAsset.location}
                                </Text>
                            </TouchableOpacity>
                        ) : hasError ? (
                            <Text style={[styles.errorText, { color: colors.danger }]}>No cached asset matched that code.</Text>
                        ) : null}
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={isTorchOn}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>Asset Scan</Text>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>QR, barcode, or manual lookup</Text>
                    </View>
                </View>

                <View style={styles.scanArea}>
                    <View style={[styles.scanFrame, { borderColor: colors.primary }]}>
                        <View style={[styles.scanCorner, styles.scanCornerTopLeft, { borderColor: colors.primary }]} />
                        <View style={[styles.scanCorner, styles.scanCornerTopRight, { borderColor: colors.primary }]} />
                        <View style={[styles.scanCorner, styles.scanCornerBottomLeft, { borderColor: colors.primary }]} />
                        <View style={[styles.scanCorner, styles.scanCornerBottomRight, { borderColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.scanHint, { color: colors.white }]}>Align charger code inside the frame</Text>
                </View>

                <View style={[styles.bottomSheet, { backgroundColor: colors.overlayStrong, shadowColor: colors.shadow }]}>
                    <Text style={[styles.sheetTitle, { color: colors.text }]}>Manual entry</Text>
                    <Text style={[styles.sheetCopy, { color: colors.textSecondary }]}>
                        Use CPID or serial number when the code label is dirty or damaged.
                    </Text>

                    <View style={[styles.inputRow, getInputShellStyle(colors)]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="CPID or serial"
                            placeholderTextColor={colors.textSecondary}
                            value={cpid}
                            onChangeText={(value) => {
                                setCpid(value);
                                setHasError(value.length > 0 && !getAssetMatch(value));
                            }}
                        />
                        <TouchableOpacity
                            style={[styles.searchButton, { backgroundColor: colors.primary }]}
                            onPress={() => setHasError(cpid.length > 0 && !getAssetMatch(cpid))}
                        >
                            <Ionicons name="search" size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                    {matchedAsset ? (
                        <View style={[styles.resultCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                            <View style={styles.resultHeader}>
                                <View>
                                    <Text style={[styles.resultTitle, { color: colors.text }]}>{matchedAsset.model}</Text>
                                    <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                                        {matchedAsset.cpid} • {matchedAsset.location}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                                    <Text style={[styles.statusBadgeText, { color: colors.success }]}>{matchedAsset.status}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => openAssetDetails(matchedAsset.id)}
                                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                            >
                                <Text style={[styles.primaryButtonText, { color: colors.white }]}>
                                    View
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : hasError ? (
                        <Text style={[styles.errorText, { color: colors.danger }]}>No cached asset matched that code.</Text>
                    ) : null}

                    <View style={styles.controlRow}>
                        <TouchableOpacity
                            onPress={() => setIsTorchOn((value) => !value)}
                            style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <Ionicons name={isTorchOn ? 'flash' : 'flash-off'} size={20} color={colors.primary} />
                            <Text style={[styles.controlButtonText, { color: colors.text }]}>
                                {isTorchOn ? 'Torch on' : 'Torch off'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setRecentModalVisible(true)}
                            style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                            <Ionicons name="albums-outline" size={20} color={colors.primary} />
                            <Text style={[styles.controlButtonText, { color: colors.text }]}>Recent assets</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
            
            <Modal visible={recentModalVisible} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRecentModalVisible(false)}>
                    <View style={[styles.recentSheet, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sheetTitle, { color: colors.text, marginBottom: 16 }]}>Recent Assets</Text>
                        {recentAssets.map((asset, index) => (
                            <TouchableOpacity
                                key={asset.id}
                                style={[styles.recentItem, { borderBottomColor: colors.border, borderBottomWidth: index === recentAssets.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                                onPress={() => {
                                    setRecentModalVisible(false);
                                    openAssetDetails(asset.id);
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text numberOfLines={1} style={[styles.resultTitle, { color: colors.text }]}>{asset.model}</Text>
                                    <Text numberOfLines={1} style={[styles.resultMeta, { color: colors.textSecondary }]}>{asset.cpid} • {asset.location}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setRecentModalVisible(false)} style={[styles.primaryButton, { backgroundColor: colors.surfaceHighlight, marginTop: 16 }]}>
                            <Text style={[styles.primaryButtonText, { color: colors.text }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    backButton: {
        minWidth: 28,
        minHeight: 28,
        marginLeft: -6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLabel: {
        ...FONTS.label,
        marginBottom: 4,
    },
    headerTitle: {
        ...FONTS.h3,
    },
    scanArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    scanFrame: {
        width: 280,
        height: 280,
        borderRadius: 24,
        borderWidth: 2,
        position: 'relative',
    },
    scanCorner: {
        position: 'absolute',
        width: 46,
        height: 46,
        borderColor: '#FFFFFF',
    },
    scanCornerTopLeft: {
        top: -2,
        left: -2,
        borderTopWidth: 5,
        borderLeftWidth: 5,
        borderTopLeftRadius: 22,
    },
    scanCornerTopRight: {
        top: -2,
        right: -2,
        borderTopWidth: 5,
        borderRightWidth: 5,
        borderTopRightRadius: 22,
    },
    scanCornerBottomLeft: {
        bottom: -2,
        left: -2,
        borderBottomWidth: 5,
        borderLeftWidth: 5,
        borderBottomLeftRadius: 22,
    },
    scanCornerBottomRight: {
        bottom: -2,
        right: -2,
        borderBottomWidth: 5,
        borderRightWidth: 5,
        borderBottomRightRadius: 22,
    },
    scanHint: {
        ...FONTS.bodyStrong,
        marginTop: 18,
    },
    bottomSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 18,
        gap: 12,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 12,
    },
    sheetTitle: {
        ...FONTS.h3,
    },
    sheetCopy: {
        ...FONTS.body,
    },
    inputRow: {
        minHeight: 56,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 14,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    input: {
        ...FONTS.body,
        flex: 1,
        paddingVertical: 14,
    },
    searchButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },
    resultCard: {
        borderRadius: 14,
        padding: 16,
        gap: 12,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    resultTitle: {
        ...FONTS.h3,
        marginBottom: 4,
    },
    resultMeta: {
        ...FONTS.body,
    },
    statusBadge: {
        minHeight: 34,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    statusBadgeText: {
        ...FONTS.label,
        fontSize: 11,
    },
    primaryButton: {
        minHeight: 54,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    primaryButtonText: {
        ...FONTS.bodyStrong,
    },
    controlRow: {
        flexDirection: 'row',
        gap: 10,
    },
    controlButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    controlButtonText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
    errorText: {
        ...FONTS.bodyStrong,
    },
    fallbackContent: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    fallbackTitle: {
        ...FONTS.h1,
        marginBottom: 10,
    },
    fallbackCopy: {
        ...FONTS.body,
        marginBottom: 18,
    },
    manualCard: {
        borderRadius: 16,
        padding: 16,
        gap: 12,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    manualInput: {
        minHeight: 54,
        borderRadius: 12,
        paddingHorizontal: 14,
        ...FONTS.body,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    recentSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        width: '100%',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 12,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        gap: 12,
    },
});
