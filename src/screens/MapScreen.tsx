import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, FONTS } from '../styles/futurist';
import { GlassCard } from '../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const API_KEY = 'AIzaSyAOcbvs0MtHhAiHevyu63o1kkp7OXHfVRY';

const DARK_MAP_STYLE = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#bdbdbd" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#181818" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1b1b1b" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2c2c2c" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8a8a8a" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{ "color": "#373737" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#3c3c3c" }]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [{ "color": "#4e4e4e" }]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#000000" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#3d3d3d" }]
    }
];

import { useTheme } from '../context/ThemeContext';

// Mock nearby stations data
const NEARBY_STATIONS = [
    {
        id: '1',
        name: 'Pune Central Station',
        latitude: 18.5314,
        longitude: 73.8446,
        workCount: 5,
        workType: 'Installation',
        distance: '0.5 km'
    },
    {
        id: '2',
        name: 'Mumbai Highway Point',
        latitude: 18.5324,
        longitude: 73.8456,
        workCount: 3,
        workType: 'Maintenance',
        distance: '1.2 km'
    },
    {
        id: '3',
        name: 'Skyline Mall Parking',
        latitude: 18.5304,
        longitude: 73.8436,
        workCount: 2,
        workType: 'Installation',
        distance: '0.8 km'
    },
    {
        id: '4',
        name: 'Bangalore Tech Park',
        latitude: 12.9716,
        longitude: 77.5946,
        workCount: 8,
        workType: 'Installation',
        distance: '650 km'
    },
    {
        id: '5',
        name: 'Chennai Marina Station',
        latitude: 13.0827,
        longitude: 80.2707,
        workCount: 4,
        workType: 'Maintenance',
        distance: '780 km'
    },
    {
        id: '6',
        name: 'Hyderabad Hi-Tech City',
        latitude: 17.4485,
        longitude: 78.3908,
        workCount: 6,
        workType: 'Installation',
        distance: '560 km'
    },
    {
        id: '7',
        name: 'Kochi Marine Drive',
        latitude: 9.9312,
        longitude: 76.2673,
        workCount: 3,
        workType: 'Maintenance',
        distance: '920 km'
    },
    {
        id: '8',
        name: 'Mysore Palace Area',
        latitude: 12.3052,
        longitude: 76.6551,
        workCount: 2,
        workType: 'Installation',
        distance: '710 km'
    },
    {
        id: '9',
        name: 'Coimbatore Junction',
        latitude: 11.0168,
        longitude: 76.9558,
        workCount: 5,
        workType: 'Maintenance',
        distance: '850 km'
    },
    {
        id: '10',
        name: 'Visakhapatnam Port',
        latitude: 17.6868,
        longitude: 83.2185,
        workCount: 7,
        workType: 'Installation',
        distance: '720 km'
    },
    {
        id: '11',
        name: 'New Delhi Connaught Place',
        latitude: 28.6139,
        longitude: 77.2090,
        workCount: 12,
        workType: 'Installation',
        distance: '1450 km'
    },
    {
        id: '12',
        name: 'Kolkata Park Street',
        latitude: 22.5726,
        longitude: 88.3639,
        workCount: 6,
        workType: 'Maintenance',
        distance: '1950 km'
    },
    {
        id: '13',
        name: 'Jaipur Pink City',
        latitude: 26.9124,
        longitude: 75.7873,
        workCount: 5,
        workType: 'Installation',
        distance: '1200 km'
    },
    {
        id: '14',
        name: 'Ahmedabad Sabarmati',
        latitude: 23.0225,
        longitude: 72.5714,
        workCount: 9,
        workType: 'Maintenance',
        distance: '670 km'
    },
    {
        id: '15',
        name: 'Lucknow Hazratganj',
        latitude: 26.8467,
        longitude: 80.9462,
        workCount: 4,
        workType: 'Installation',
        distance: '1350 km'
    },
    {
        id: '16',
        name: 'Chandigarh Sector 17',
        latitude: 30.7333,
        longitude: 76.7794,
        workCount: 7,
        workType: 'Maintenance',
        distance: '1500 km'
    },
    {
        id: '17',
        name: 'Guwahati Gateway',
        latitude: 26.1445,
        longitude: 91.7362,
        workCount: 3,
        workType: 'Installation',
        distance: '2400 km'
    },
    {
        id: '18',
        name: 'Bhopal Lake View',
        latitude: 23.2599,
        longitude: 77.4126,
        workCount: 5,
        workType: 'Maintenance',
        distance: '850 km'
    },
    {
        id: '19',
        name: 'Indore Central',
        latitude: 22.7196,
        longitude: 75.8577,
        workCount: 6,
        workType: 'Installation',
        distance: '750 km'
    },
    {
        id: '20',
        name: 'Patna Gandhi Maidan',
        latitude: 25.5941,
        longitude: 85.1376,
        workCount: 4,
        workType: 'Maintenance',
        distance: '1700 km'
    },
    {
        id: '21',
        name: 'Ranchi Main Road',
        latitude: 23.3441,
        longitude: 85.3096,
        workCount: 3,
        workType: 'Installation',
        distance: '1650 km'
    },
    {
        id: '22',
        name: 'Nagpur Sitabuldi',
        latitude: 21.1458,
        longitude: 79.0882,
        workCount: 5,
        workType: 'Maintenance',
        distance: '680 km'
    },
    {
        id: '23',
        name: 'Surat Diamond City',
        latitude: 21.1702,
        longitude: 72.8311,
        workCount: 8,
        workType: 'Installation',
        distance: '580 km'
    },
    {
        id: '24',
        name: 'Vadodara Sayajigunj',
        latitude: 22.3072,
        longitude: 73.1812,
        workCount: 4,
        workType: 'Maintenance',
        distance: '620 km'
    },
    {
        id: '25',
        name: 'Amritsar Golden Temple',
        latitude: 31.6340,
        longitude: 74.8723,
        workCount: 6,
        workType: 'Installation',
        distance: '1650 km'
    },
    {
        id: '26',
        name: 'Dehradun Clock Tower',
        latitude: 30.3165,
        longitude: 78.0322,
        workCount: 3,
        workType: 'Maintenance',
        distance: '1400 km'
    },
    {
        id: '27',
        name: 'Shimla Mall Road',
        latitude: 31.1048,
        longitude: 77.1734,
        workCount: 2,
        workType: 'Installation',
        distance: '1550 km'
    },
    {
        id: '28',
        name: 'Goa Panjim Beach',
        latitude: 15.4909,
        longitude: 73.8278,
        workCount: 5,
        workType: 'Maintenance',
        distance: '480 km'
    },
    {
        id: '29',
        name: 'Thiruvananthapuram Central',
        latitude: 8.5241,
        longitude: 76.9366,
        workCount: 4,
        workType: 'Installation',
        distance: '1050 km'
    },
    {
        id: '30',
        name: 'Varanasi Ghats',
        latitude: 25.3176,
        longitude: 82.9739,
        workCount: 3,
        workType: 'Maintenance',
        distance: '1550 km'
    },
];

export const MapScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [workStatus, setWorkStatus] = useState<'Away' | 'Working'>('Working');
    const [selectedStation, setSelectedStation] = useState(NEARBY_STATIONS[0]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
            } catch (error) {
                setErrorMsg('Error fetching location');
            } finally {
                setLoading(false);
            }
        })();
    }, []);



    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.primary }]}>INITIALIZING SATELLITE LINK...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <MapView
                style={styles.map}
                customMapStyle={isDark ? DARK_MAP_STYLE : []}
                provider={PROVIDER_GOOGLE}
                region={location ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 3.5,
                    longitudeDelta: 3.5,
                } : undefined}
                showsUserLocation={false}
                showsMyLocationButton={false}
            >
                {/* Station Markers */}
                {NEARBY_STATIONS.map((station) => (
                    <Marker
                        key={station.id}
                        coordinate={{
                            latitude: station.latitude,
                            longitude: station.longitude,
                        }}
                        onPress={() => setSelectedStation(station)}
                    >
                        <View style={styles.stationMarkerContainer}>
                            <Ionicons
                                name="location"
                                size={40}
                                color={station.workType === 'Installation' ? colors.success : colors.warning}
                            />
                            <View style={[styles.markerCountBadge, {
                                backgroundColor: station.workType === 'Installation' ? colors.success : colors.warning
                            }]}>
                                <Text style={styles.markerCountText}>{station.workCount}</Text>
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Top Header */}
            <SafeAreaView style={styles.topHeader} pointerEvents="box-none">
                <View style={[styles.headerContent, { backgroundColor: isDark ? 'rgba(10, 10, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)' }]}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.text }]}>Hey Timothy</Text>
                        <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>Your work for the day</Text>
                    </View>
                    <View style={[styles.statusToggle, { borderColor: colors.success }]}>
                        <TouchableOpacity
                            style={[styles.statusBtn, workStatus === 'Away' && { backgroundColor: '#FFF' }]}
                            onPress={() => setWorkStatus('Away')}
                        >
                            <Text style={[styles.statusText, { color: workStatus === 'Away' ? colors.text : colors.success }]}>Away</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.statusBtn, workStatus === 'Working' && { backgroundColor: colors.success }]}
                            onPress={() => setWorkStatus('Working')}
                        >
                            <Text style={[styles.statusText, { color: workStatus === 'Working' ? '#FFF' : colors.success }]}>Working</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Floating Location Button */}
            <TouchableOpacity
                style={[styles.locationBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                    // Center map on user location
                }}
            >
                <Ionicons name="locate" size={28} color="#FFF" />
            </TouchableOpacity>

            {/* Bottom Stations Scroll */}
            <View style={styles.bottomCardContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.stationsScrollContent}
                >
                    {NEARBY_STATIONS.map((station) => (
                        <TouchableOpacity
                            key={station.id}
                            style={[styles.stationCard, {
                                backgroundColor: colors.surface,
                                borderColor: selectedStation.id === station.id ? colors.primary : colors.border
                            }]}
                            onPress={() => {
                                setSelectedStation(station);
                                // Navigate to Work page filtered by this station
                                navigation.navigate('MainTabs', {
                                    screen: 'Work',
                                    params: { stationFilter: station.name }
                                });
                            }}
                        >
                            <View style={styles.stationCardHeader}>
                                <View style={styles.stationCardInfo}>
                                    <Text style={[styles.stationCardName, { color: colors.primary }]} numberOfLines={1}>
                                        {station.name}
                                    </Text>
                                    <View style={styles.stationCardBottomRow}>
                                        <View style={[styles.stationCardTypeBadge, {
                                            backgroundColor: station.workType === 'Installation' ? colors.success + '20' : colors.warning + '20',
                                            borderColor: station.workType === 'Installation' ? colors.success : colors.warning,
                                            borderWidth: 1
                                        }]}>
                                            <Text style={[styles.stationCardTypeText, {
                                                color: station.workType === 'Installation' ? colors.success : colors.warning
                                            }]}>
                                                {station.workType}
                                            </Text>
                                        </View>
                                        <View style={styles.stationCardMetaItem}>
                                            <Ionicons name="navigate-outline" size={12} color={colors.textSecondary} />
                                            <Text style={[styles.stationCardLocation, { color: colors.textSecondary }]}>
                                                {station.distance}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.workCountBadge, {
                                    borderColor: colors.primary,
                                    backgroundColor: colors.primary + '10'
                                }]}>
                                    <Text style={[styles.workCountNumber, { color: colors.primary }]}>{station.workCount}</Text>
                                </View>
                            </View>

                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    topHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
    },
    subGreeting: {
        fontSize: 14,
        marginTop: 2,
    },
    statusToggle: {
        flexDirection: 'row',
        borderRadius: 25,
        borderWidth: 2,
        padding: 4,
        backgroundColor: '#FFF',
    },
    statusBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
    },
    locationBtn: {
        position: 'absolute',
        bottom: 190,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomCardContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
    },
    stationsScrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    stationCard: {
        minWidth: 320,
        borderRadius: 12,
        borderWidth: 2,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    stationCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stationCardInfo: {
        flex: 1,
        marginRight: 16,
    },
    stationCardName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    stationCardLocation: {
        fontSize: 14,
        fontWeight: '400',
    },
    stationCardBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    workCountBadge: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    workCountNumber: {
        fontSize: 28,
        fontWeight: '700',
    },
    stationCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stationCardMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stationCardMetaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    stationCardTypeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    stationCardTypeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    loadingText: {
        ...FONTS.label,
        marginTop: 20,
        color: COLORS.primary,
        letterSpacing: 2,
    },
    errorText: {
        ...FONTS.body,
        color: COLORS.danger,
    },
    infoCard: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    cardTitle: {
        ...FONTS.label,
        fontSize: 11,
        color: COLORS.white,
    },
    addressText: {
        ...FONTS.h2,
        fontSize: 16,
        color: COLORS.white,
        marginBottom: 10,
    },
    coordsText: {
        ...FONTS.label,
        fontSize: 10,
        opacity: 0.6,
    },
    markerContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerMy: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        zIndex: 2,
    },
    markerRing: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: COLORS.primary,
        opacity: 0.5,
    },
    stationMarkerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerCountBadge: {
        position: 'absolute',
        top: 8,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    markerCountText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    stationInfo: {
        gap: 8,
    },
    stationName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    stationMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '600',
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
    },
});
