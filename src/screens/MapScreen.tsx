import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';
import { useTheme } from '../context/ThemeContext';
import { WORK_ORDERS } from '../data/fieldDemo';
import { FONTS, getInputShellStyle } from '../styles/futurist';
import { getServiceTypeColors, ServiceType } from '../styles/workTypeColors';

const DEFAULT_REGION: Region = {
    latitude: 18.5314,
    longitude: 73.8446,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
};

const DARK_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#111b23' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#7e92a4' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#111b23' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#233443' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a2834' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#091118' }] },
];

const MAP_CARD_WIDTH = 300;
const MAP_CARD_GAP = 12;

type StationMapCard = {
    id: string;
    siteName: string;
    count: number;
    latitude: number;
    longitude: number;
    types: ServiceType[];
};

type StationAccent = {
    background: string;
    border: string;
    text: string;
    tint: string;
    tintText: string;
    pinText: string;
};

const StationMarkerPin = ({
    count,
    accent,
    active,
}: {
    count: number;
    accent: StationAccent;
    active: boolean;
}) => {
    const label = count > 99 ? '99+' : String(count);
    const fontSize = label.length > 2 ? 11 : label.length > 1 ? 12 : 14;

    return (
        <View style={[styles.markerWrap, active && styles.markerPinActive]}>
            <Svg width={52} height={68} viewBox="0 0 60 78">
                <Path
                    d="M30 5C17.3 5 7 15.1 7 27.5c0 15.8 15.2 28.9 21.4 39.2.7 1.1 2.3 1.1 3 0C37.8 56.4 53 43.3 53 27.5 53 15.1 42.7 5 30 5Z"
                    fill={accent.background}
                    stroke={active ? '#FFFFFF' : accent.border}
                    strokeWidth={2.75}
                    strokeLinejoin="round"
                />
                <Path
                    d="M30 10C20.1 10 12 17.9 12 27.5c0 10.2 7.8 18.7 18 18.7s18-8.5 18-18.7C48 17.9 39.9 10 30 10Z"
                    fill="#FFFFFF"
                    opacity={0.16}
                />
                <Circle cx="30" cy="27.5" r="13" fill="#FFFFFF" />
                <Circle cx="30" cy="27.5" r="11.5" fill="#FFFFFF" stroke={accent.border} strokeWidth={1.25} />
                <SvgText
                    x="30"
                    y="31.5"
                    fill={accent.pinText}
                    fontSize={fontSize}
                    fontWeight="700"
                    textAnchor="middle"
                >
                    {label}
                </SvgText>
                <Circle cx="30" cy="27.5" r="17.5" fill="none" stroke="#FFFFFF" strokeOpacity={active ? 0.92 : 0.64} strokeWidth={1.25} />
            </Svg>
        </View>
    );
};

export const MapScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navBarOffset = Math.max(insets.bottom, 12);
    const bottomRailOffset = navBarOffset + 86; // 78 (tab bar max height) + 8px gap
    const mapRef = useRef<MapView | null>(null);
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);
    const [locationState, setLocationState] = useState<'loading' | 'granted' | 'denied'>('loading');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(WORK_ORDERS[0].id);

    const filteredOrders = WORK_ORDERS.filter((item) => {
        const haystack = `${item.title} ${item.siteName} ${item.address}`.toLowerCase();
        return haystack.includes(searchQuery.trim().toLowerCase());
    });

    const activeStationName = WORK_ORDERS.find((item) => item.id === selectedOrderId)?.siteName ?? null;

    const stationCards = useMemo<StationMapCard[]>(() => {
        const grouped = new Map<string, StationMapCard>();
        filteredOrders.forEach((item) => {
            const current = grouped.get(item.siteName);
            if (current) {
                current.count += 1;
                if (!current.types.includes(item.type)) {
                    current.types.push(item.type);
                }
                return;
            }

            grouped.set(item.siteName, {
                id: item.siteName,
                siteName: item.siteName,
                count: 1,
                latitude: item.latitude,
                longitude: item.longitude,
                types: [item.type],
            });
        });

        return Array.from(grouped.values());
    }, [filteredOrders]);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationState('denied');
                return;
            }

            try {
                const current = await Location.getCurrentPositionAsync({});
                const nextRegion = {
                    latitude: current.coords.latitude,
                    longitude: current.coords.longitude,
                    latitudeDelta: 0.12,
                    longitudeDelta: 0.12,
                };
                setRegion(nextRegion);
                setLocationState('granted');
                mapRef.current?.animateToRegion(nextRegion, 600);
            } catch {
                setLocationState('denied');
            }
        })();
    }, []);

    useEffect(() => {
        if (filteredOrders.length === 0) {
            return;
        }

        if (!filteredOrders.some((item) => item.id === selectedOrderId)) {
            setSelectedOrderId(filteredOrders[0].id);
        }
    }, [filteredOrders, selectedOrderId]);

    const focusStation = (siteName: string) => {
        const station =
            stationCards.find((item) => item.siteName === siteName) ??
            (() => {
                const fallback = WORK_ORDERS.find((item) => item.siteName === siteName);
                if (!fallback) {
                    return null;
                }
                return {
                    id: fallback.siteName,
                    siteName: fallback.siteName,
                    count: 1,
                    latitude: fallback.latitude,
                    longitude: fallback.longitude,
                    types: [fallback.type],
                } satisfies StationMapCard;
            })();

        const nextOrder =
            filteredOrders.find((item) => item.siteName === siteName) ??
            WORK_ORDERS.find((item) => item.siteName === siteName);

        if (!station || !nextOrder) {
            return;
        }

        setSelectedOrderId(nextOrder.id);
        mapRef.current?.animateToRegion(
            {
                latitude: station.latitude,
                longitude: station.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
            },
            500,
        );
    };

    const getStationAccent = (station: StationMapCard) => {
        if (station.types.length === 1) {
            const typeColors = getServiceTypeColors(station.types[0], isDark);
            return {
                ...typeColors,
                pinText: typeColors.border,
            };
        }

        return {
            background: colors.primary,
            border: colors.primary,
            text: colors.white,
            tint: colors.primary + '14',
            tintText: colors.primary,
            pinText: colors.primary,
        };
    };

    const openStationWork = (siteName: string, orderId?: string) => {
        const nextOrder =
            orderId
                ? WORK_ORDERS.find((item) => item.id === orderId)
                : filteredOrders.find((item) => item.siteName === siteName) ?? WORK_ORDERS.find((item) => item.siteName === siteName);

        if (nextOrder) {
            setSelectedOrderId(nextOrder.id);
        }

        navigation.navigate('MainTabs', {
            screen: 'Work',
            params: { stationFilter: siteName },
        });
    };

    const handleCardScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const rawIndex = event.nativeEvent.contentOffset.x / (MAP_CARD_WIDTH + MAP_CARD_GAP);
        const index = Math.max(0, Math.min(Math.round(rawIndex), stationCards.length - 1));
        const station = stationCards[index];

        if (station) {
            focusStation(station.siteName);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                customMapStyle={isDark ? DARK_MAP_STYLE : []}
                showsUserLocation={locationState === 'granted'}
                showsMyLocationButton={false}
            >
                {stationCards.map((station) => {
                    const active = activeStationName === station.siteName;
                    const accent = getStationAccent(station);
                    return (
                        <Marker
                            key={station.id}
                            coordinate={{ latitude: station.latitude, longitude: station.longitude }}
                            anchor={{ x: 0.5, y: 0.95 }}
                            onPress={() => openStationWork(station.siteName)}
                        >
                            <StationMarkerPin count={station.count} accent={accent} active={active} />
                        </Marker>
                    );
                })}
            </MapView>

            <SafeAreaView style={styles.overlay} edges={['top', 'left', 'right']} pointerEvents="box-none">
                <View style={styles.topStack}>
                    <View
                        style={[
                            styles.searchBar,
                            getInputShellStyle(colors),
                            {
                                backgroundColor: isDark ? 'rgba(19, 32, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(244, 247, 251, 0.58)' : 'rgba(20, 33, 43, 0.24)',
                            },
                        ]}
                    >
                        <Ionicons name="search" size={18} color={colors.textSecondary} />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search site or work"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.searchInput, { color: colors.text }]}
                        />
                        {route.params?.isAdmin && (
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                <Ionicons name="person-circle" size={28} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ marginBottom: bottomRailOffset }} pointerEvents="box-none">
                    <View
                        style={{ gap: 12, alignItems: 'flex-end', paddingRight: 16, marginBottom: 16 }}
                        pointerEvents="box-none"
                    >
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Notification')}
                            style={[
                                styles.locateButton,
                                {
                                    backgroundColor: isDark ? colors.surface : colors.white,
                                    position: 'relative',
                                    right: 0,
                                    bottom: 0,
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                    shadowColor: colors.shadow,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 12,
                                    elevation: 5,
                                },
                            ]}
                        >
                            <Ionicons name="notifications" size={24} color={colors.text} />
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 6,
                                    minWidth: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    borderWidth: 1.5,
                                    backgroundColor: colors.danger,
                                    borderColor: isDark ? colors.surface : colors.white,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingHorizontal: 4,
                                }}
                            >
                                <Text style={{ color: colors.white, fontSize: 10, fontWeight: '700' }}>3</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => mapRef.current?.animateToRegion(region, 500)}
                            style={[
                                styles.locateButton,
                                {
                                    backgroundColor: colors.primary,
                                    position: 'relative',
                                    right: 0,
                                    bottom: 0,
                                    shadowColor: colors.shadow,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 12,
                                    elevation: 5,
                                },
                            ]}
                        >
                            <Ionicons name="locate" size={24} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomSheet}>
                        <Text style={[styles.sheetLabel, { color: colors.textSecondary }]}>Nearby Stations</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={MAP_CARD_WIDTH + MAP_CARD_GAP}
                            decelerationRate="fast"
                            onMomentumScrollEnd={handleCardScrollEnd}
                            contentContainerStyle={styles.sheetScroll}
                        >
                            {stationCards.map((station) => {
                                const active = activeStationName === station.siteName;
                                const accent = getStationAccent(station);

                                return (
                                    <TouchableOpacity
                                        key={station.id}
                                        activeOpacity={0.92}
                                        onPress={() => openStationWork(station.siteName)}
                                        style={[
                                            styles.jobCard,
                                            {
                                                backgroundColor: active ? colors.surface : colors.overlayStrong,
                                                borderColor: active ? accent.border : `${accent.border}55`,
                                                shadowColor: colors.shadow,
                                            },
                                        ]}
                                    >
                                        <View style={styles.stationCardRow}>
                                            <View style={styles.stationCardInfo}>
                                                <Text style={[styles.jobCardTitle, { color: colors.text }]} numberOfLines={2}>
                                                    {station.siteName}
                                                </Text>
                                                <View style={styles.typeChipRow}>
                                                    {station.types.map((type) => {
                                                        const typeColors = getServiceTypeColors(type, isDark);

                                                        return (
                                                            <View
                                                                key={type}
                                                                style={[
                                                                    styles.typeChip,
                                                                    {
                                                                        backgroundColor: typeColors.tint,
                                                                        borderColor: typeColors.border,
                                                                    },
                                                                ]}
                                                            >
                                                                <Text style={[styles.typeChipText, { color: typeColors.tintText }]}>
                                                                    {type}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </View>

                                            <View style={[styles.stationCountBadge, { backgroundColor: accent.background }]}>
                                                <Text style={[styles.stationCountText, { color: accent.text }]}>{station.count}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {stationCards.length === 0 ? (
                            <View
                                style={[
                                    styles.emptyState,
                                    { backgroundColor: colors.overlayStrong, shadowColor: colors.shadow },
                                ]}
                            >
                                <EmptyStateIllustration width={176} style={{ marginBottom: 10 }} />
                                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No matching works</Text>
                                <Text style={[styles.emptyStateCopy, { color: colors.textSecondary }]}>
                                    Try a different site name or clear the search.
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 16,
    },
    topStack: {
        gap: 8,
    },
    searchBar: {
        minHeight: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        gap: 8,
        marginHorizontal: 16,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 10,
    },
    searchInput: {
        ...FONTS.body,
        flex: 1,
        paddingVertical: 0,
    },
    locateButton: {
        position: 'absolute',
        right: 16,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 12,
        right: 14,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.5,
    },
    bottomSheet: {
        gap: 10,
    },
    sheetLabel: {
        ...FONTS.label,
        marginHorizontal: 16,
    },
    sheetScroll: {
        paddingHorizontal: 16,
        gap: 12,
    },
    emptyState: {
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 6,
    },
    emptyStateTitle: {
        ...FONTS.h3,
        marginBottom: 6,
        textAlign: 'center',
    },
    emptyStateCopy: {
        ...FONTS.body,
        textAlign: 'center',
    },
    jobCard: {
        width: MAP_CARD_WIDTH,
        borderRadius: 18,
        borderWidth: 1.25,
        padding: 12,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 7,
    },
    stationCardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    stationCardInfo: {
        flex: 1,
    },
    jobCardTitle: {
        ...FONTS.h3,
    },
    typeChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    typeChip: {
        minHeight: 22,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    typeChipText: {
        ...FONTS.label,
        fontSize: 8,
    },
    stationCountBadge: {
        minWidth: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stationCountText: {
        ...FONTS.h2,
    },
    markerWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 8,
    },
    markerPinActive: {
        transform: [{ scale: 1.04 }],
    },
});
