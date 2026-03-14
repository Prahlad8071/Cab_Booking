import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issue with Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green icon for pickup
const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Custom red icon for dropoff
const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Custom blue icon for driver
const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

/**
 * Internal helper — re-centers the map when coords change
 */
const MapRecenter = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
};

/**
 * FitBounds — fits map view to show all given positions
 */
const FitBounds = ({ positions }) => {
    const map = useMap();
    useEffect(() => {
        if (positions && positions.length >= 2) {
            const validPositions = positions.filter(p => p && p[0] != null && p[1] != null);
            if (validPositions.length >= 2) {
                const bounds = L.latLngBounds(validPositions);
                map.fitBounds(bounds, { padding: [40, 40] });
            }
        }
    }, [positions, map]);
    return null;
};

/**
 * MapComponent
 *
 * Props:
 *   pickupCoords   — { lat, lng } | null
 *   pickupAddress  — string label for popup
 *   dropoffCoords  — { lat, lng } | null
 *   dropoffAddress — string label for popup
 *   driverCoords   — { lat, lng } | null   (optional, for driver position)
 *   height         — CSS string, default '350px'
 *   defaultCenter  — { lat, lng }           (fallback center when no markers)
 */
const MapComponent = ({
    pickupCoords,
    pickupAddress = 'Pickup',
    dropoffCoords,
    dropoffAddress = 'Dropoff',
    driverCoords,
    height = '350px',
    defaultCenter = { lat: 20.5937, lng: 78.9629 }, // India center
}) => {
    // Determine initial center: pickup > dropoff > driver > default
    const initialCenter = pickupCoords
        ? [pickupCoords.lat, pickupCoords.lng]
        : dropoffCoords
            ? [dropoffCoords.lat, dropoffCoords.lng]
            : driverCoords
                ? [driverCoords.lat, driverCoords.lng]
                : [defaultCenter.lat, defaultCenter.lng];

    const initialZoom = pickupCoords || dropoffCoords ? 13 : 5;

    // Positions for FitBounds
    const boundsPositions = [
        pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : null,
        dropoffCoords ? [dropoffCoords.lat, dropoffCoords.lng] : null,
    ].filter(Boolean);

    // Polyline path
    const routePath = [
        pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : null,
        dropoffCoords ? [dropoffCoords.lat, dropoffCoords.lng] : null,
    ].filter(Boolean);

    return (
        <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden', zIndex: 0 }}>
            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Re-center when only pickup is set */}
                {pickupCoords && !dropoffCoords && (
                    <MapRecenter center={[pickupCoords.lat, pickupCoords.lng]} zoom={14} />
                )}

                {/* Fit bounds when both markers set */}
                {boundsPositions.length >= 2 && (
                    <FitBounds positions={boundsPositions} />
                )}

                {/* Pickup marker */}
                {pickupCoords && (
                    <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon}>
                        <Popup>
                            <strong>🟢 Pickup</strong><br />
                            {pickupAddress}
                        </Popup>
                    </Marker>
                )}

                {/* Dropoff marker */}
                {dropoffCoords && (
                    <Marker position={[dropoffCoords.lat, dropoffCoords.lng]} icon={dropoffIcon}>
                        <Popup>
                            <strong>🔴 Dropoff</strong><br />
                            {dropoffAddress}
                        </Popup>
                    </Marker>
                )}

                {/* Driver marker */}
                {driverCoords && (
                    <Marker position={[driverCoords.lat, driverCoords.lng]} icon={driverIcon}>
                        <Popup>
                            <strong>🚗 Driver Location</strong>
                        </Popup>
                    </Marker>
                )}

                {/* Route polyline */}
                {routePath.length === 2 && (
                    <Polyline
                        positions={routePath}
                        color="#000000"
                        weight={4}
                        opacity={0.7}
                        dashArray="8, 8"
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
