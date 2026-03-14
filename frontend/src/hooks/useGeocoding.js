/**
 * useGeocoding — Geocoding utilities using Nominatim (OpenStreetMap) — FREE, no API key needed.
 * Provides:
 *   geocodeAddress(address)   → { lat, lng } or null
 *   reverseGeocode(lat, lng)  → address string or null
 *   getCurrentLocation()      → { lat, lng } via GPS
 *   calculateDistance(...)    → km (Haversine)
 *   calculateFare(distKm)     → dollar amount
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Forward geocode: address string → { lat, lng }
 */
export const geocodeAddress = async (address) => {
    if (!address || address.trim().length < 3) return null;
    try {
        const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        const res = await fetch(url, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'Ucab-CabBookingApp/1.0' },
        });
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        return null;
    } catch (err) {
        console.error('Geocoding error:', err);
        return null;
    }
};

/**
 * Reverse geocode: { lat, lng } → address string
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`;
        const res = await fetch(url, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'Ucab-CabBookingApp/1.0' },
        });
        const data = await res.json();
        if (data && data.display_name) return data.display_name;
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
        console.error('Reverse geocoding error:', err);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};

/**
 * Get current GPS position using browser's geolocation API
 * Returns { lat, lng } or null
 */
export const getCurrentLocation = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 8000 }
        );
    });
};

/**
 * Haversine formula — distance in km between two lat/lng points
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Calculate fare from distance. Base: $5, rate: $2/km
 */
export const calculateFare = (distanceKm) => {
    return Math.max(5, Math.round(5 + distanceKm * 2));
};
