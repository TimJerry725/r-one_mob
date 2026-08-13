import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export const Marker = ({ children, coordinate, onPress }: any) => {
    // Normalizing India coordinates: Lat (8 to 33), Long (68 to 92)
    const leftPercent = coordinate?.longitude 
        ? Math.max(8, Math.min(92, ((coordinate.longitude - 68) / (92 - 68)) * 100))
        : 50;
    const topPercent = coordinate?.latitude 
        ? Math.max(8, Math.min(92, (1 - (coordinate.latitude - 8) / (33 - 8)) * 100))
        : 50;

    return (
        <div
            onClick={onPress}
            style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                transition: 'transform 0.2s ease',
            }}
        >
            {children}
        </div>
    );
};

const MapView = forwardRef(({ children, style }: any, ref: any) => {
    useImperativeHandle(ref, () => ({
        animateToRegion: (region: Region, duration?: number) => {
            // Web map ref fallback
        },
        fitToCoordinates: (coords: any[], options?: any) => {
            // Web map ref fallback
        }
    }));

    return (
        <View style={[style, { backgroundColor: '#0a0d14', overflow: 'hidden', position: 'relative' }]}>
            <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.08) 0%, transparent 75%),
                    linear-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 240, 255, 0.04) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 50px 50px, 50px 50px',
                backgroundColor: '#07090e',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 100,
                    right: 20,
                    padding: '6px 12px',
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: 6,
                    color: '#00f0ff',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    letterSpacing: 1,
                    zIndex: 5
                }}>
                    SATELLITE RADAR // ACTIVE
                </div>
                {children}
            </div>
        </View>
    );
});

MapView.displayName = 'MapView';

export default MapView;
