import Constants from 'expo-constants';

/**
 * Google Maps API Key helper for MapScreen and native map components.
 * Configured via process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY or app.json config.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  Constants.expoConfig?.android?.config?.googleMaps?.apiKey ||
  '';

export const isGoogleMapsConfigured = (): boolean => {
  return (
    Boolean(GOOGLE_MAPS_API_KEY) &&
    !GOOGLE_MAPS_API_KEY.includes('YOUR_') &&
    GOOGLE_MAPS_API_KEY.length > 20
  );
};
