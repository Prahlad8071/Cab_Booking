import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import MapComponent from '../components/MapComponent';
import {
    geocodeAddress, reverseGeocode, getCurrentLocation,
    calculateDistance, calculateFare,
} from '../hooks/useGeocoding';

function useDebounce(fn, delay) {
    const timer = useRef(null);
    return useCallback((...args) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => fn(...args), delay);
    }, [fn, delay]);
}

const RIDE_TYPES = [
    { id: 'economy',  label: 'Economy',  icon: '🚗', multiplier: 1.0, desc: 'Affordable' },
    { id: 'comfort',  label: 'Comfort',  icon: '🚙', multiplier: 1.4, desc: 'Extra room' },
    { id: 'premium',  label: 'Premium',  icon: '🏎️', multiplier: 2.0, desc: 'Top class'  },
];

const UserDashboard = () => {
    const { user, socket } = useContext(AuthContext);
    const [nearbyDrivers, setNearbyDrivers] = useState([]);
    const [rideType, setRideType] = useState('economy');
    const [booking, setBooking] = useState({
        pickupAddress: '', pickupLat: null, pickupLng: null,
        dropoffAddress: '', dropoffLat: null, dropoffLng: null,
        baseFare: 5,
    });
    const [activeRide, setActiveRide] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [geoStatus, setGeoStatus] = useState({ pickup: '', dropoff: '' });
    const [gpsLoading, setGpsLoading] = useState(false);

    const selectedType = RIDE_TYPES.find(r => r.id === rideType);
    const finalFare = Math.round(booking.baseFare * (selectedType?.multiplier || 1));

    useEffect(() => {
        fetchNearbyDrivers();
        if (socket) {
            socket.on('ride_status_changed', (upd) => {
                if (activeRide && activeRide._id === upd._id) setActiveRide(upd);
            });
        }
        return () => { if (socket) socket.off('ride_status_changed'); };
    }, [socket, activeRide]);

    const fetchNearbyDrivers = async () => {
        try { const r = await axios.get(`${API_URL}/api/rides/nearby`); setNearbyDrivers(r.data); }
        catch { /* silent */ }
    };

    const doGeocode = async (address, field) => {
        if (!address || address.trim().length < 4) return;
        setGeoStatus(s => ({ ...s, [field]: 'searching...' }));
        const coords = await geocodeAddress(address);
        if (coords) {
            setBooking(prev => {
                const isPickup = field === 'pickup';
                const lat1 = isPickup ? coords.lat : prev.pickupLat;
                const lng1 = isPickup ? coords.lng : prev.pickupLng;
                const lat2 = isPickup ? prev.dropoffLat : coords.lat;
                const lng2 = isPickup ? prev.dropoffLng : coords.lng;
                const dist = lat1 && lat2 ? calculateDistance(lat1, lng1, lat2, lng2) : null;
                return {
                    ...prev,
                    [`${field}Lat`]: coords.lat,
                    [`${field}Lng`]: coords.lng,
                    baseFare: dist ? calculateFare(dist) : prev.baseFare,
                };
            });
            setGeoStatus(s => ({ ...s, [field]: '✓' }));
        } else {
            setGeoStatus(s => ({ ...s, [field]: '✗ Not found' }));
        }
    };

    const debPickup  = useDebounce((v) => doGeocode(v, 'pickup'),  800);
    const debDropoff = useDebounce((v) => doGeocode(v, 'dropoff'), 800);

    const handleGPS = async () => {
        setGpsLoading(true);
        const coords = await getCurrentLocation();
        if (coords) {
            const addr = await reverseGeocode(coords.lat, coords.lng);
            setBooking(p => ({ ...p, pickupAddress: addr, pickupLat: coords.lat, pickupLng: coords.lng }));
            setGeoStatus(s => ({ ...s, pickup: '✓ GPS' }));
        } else {
            setGeoStatus(s => ({ ...s, pickup: '✗ GPS unavailable' }));
        }
        setGpsLoading(false);
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!booking.pickupLat || !booking.dropoffLat) {
            setError('Please enter valid pickup and dropoff addresses.');
            return;
        }
        setLoading(true); setError('');
        try {
            const res = await axios.post(`${API_URL}/api/rides/book`, {
                pickupLocation:  { address: booking.pickupAddress,  lat: booking.pickupLat,  lng: booking.pickupLng },
                dropoffLocation: { address: booking.dropoffAddress, lat: booking.dropoffLat, lng: booking.dropoffLng },
                fare: finalFare,
                extraOptions: { refreshments: false, donation: false },
            });
            setActiveRide(res.data);
        } catch (err) { setError(err.response?.data?.message || 'Booking failed'); }
        setLoading(false);
    };

    const handleCancel = async () => {
        try { await axios.put(`${API_URL}/api/rides/${activeRide._id}/status`, { status: 'cancelled' }); setActiveRide(null); }
        catch (err) { console.error(err); }
    };

    const mapPickup  = activeRide ? { lat: activeRide.pickupLocation?.lat,  lng: activeRide.pickupLocation?.lng }
        : booking.pickupLat  ? { lat: booking.pickupLat,  lng: booking.pickupLng  } : null;
    const mapDropoff = activeRide ? { lat: activeRide.dropoffLocation?.lat, lng: activeRide.dropoffLocation?.lng }
        : booking.dropoffLat ? { lat: booking.dropoffLat, lng: booking.dropoffLng } : null;

    const dist = booking.pickupLat && booking.dropoffLat
        ? calculateDistance(booking.pickupLat, booking.pickupLng, booking.dropoffLat, booking.dropoffLng)
        : null;

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)' }}>

            {/* --- Gradient Page Header --- */}
            <div className="page-header-band">
                <div className="container">
                    <div className="animate-fade-up" style={{ color: '#fff' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>
                            PASSENGER
                        </p>
                        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.7rem', margin: 0 }}>
                            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
                        </h2>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 1, paddingBottom: '3rem' }}>
                <div className="row g-4">

                    {/* ======= LEFT: Booking / Active ride ======= */}
                    <div className="col-12 col-lg-5 col-xl-4">

                        {!activeRide ? (
                            <div className="card-ucab p-4 animate-fade-up delay-1">
                                <h5 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>🗺️ Book a Ride</h5>

                                {error && (
                                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                        ⚠ {error}
                                    </div>
                                )}

                                <form onSubmit={handleBook}>
                                    {/* Pickup */}
                                    <div className="mb-3">
                                        <label className="section-label">Pickup</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div className="input-ucab-icon" style={{ flex: 1 }}>
                                                <span className="icon">📍</span>
                                                <input id="pickup-input" className="input-ucab" type="text"
                                                    placeholder="Enter pickup address"
                                                    value={booking.pickupAddress}
                                                    onChange={e => {
                                                        setBooking(p => ({ ...p, pickupAddress: e.target.value, pickupLat: null, pickupLng: null }));
                                                        setGeoStatus(s => ({ ...s, pickup: '' }));
                                                        debPickup(e.target.value);
                                                    }} required />
                                            </div>
                                            <button type="button" onClick={handleGPS} title="Use GPS"
                                                style={{ background: 'var(--gradient-soft)', border: 'none', borderRadius: '8px', padding: '0 0.75rem', cursor: 'pointer', color: 'var(--accent)', fontSize: '1.1rem', flexShrink: 0 }}>
                                                {gpsLoading ? '⏳' : '🎯'}
                                            </button>
                                        </div>
                                        {geoStatus.pickup && (
                                            <small style={{ marginTop: '0.25rem', display: 'block', color: geoStatus.pickup.startsWith('✓') ? 'var(--success)' : geoStatus.pickup === 'searching...' ? 'var(--text-light)' : 'var(--danger)', fontWeight: 600, fontSize: '0.78rem' }}>
                                                {geoStatus.pickup}
                                            </small>
                                        )}
                                    </div>

                                    {/* Dropoff */}
                                    <div className="mb-4">
                                        <label className="section-label">Dropoff</label>
                                        <div className="input-ucab-icon">
                                            <span className="icon">🏁</span>
                                            <input id="dropoff-input" className="input-ucab" type="text"
                                                placeholder="Enter destination"
                                                value={booking.dropoffAddress}
                                                onChange={e => {
                                                    setBooking(p => ({ ...p, dropoffAddress: e.target.value, dropoffLat: null, dropoffLng: null }));
                                                    setGeoStatus(s => ({ ...s, dropoff: '' }));
                                                    debDropoff(e.target.value);
                                                }} required />
                                        </div>
                                        {geoStatus.dropoff && (
                                            <small style={{ marginTop: '0.25rem', display: 'block', color: geoStatus.dropoff.startsWith('✓') ? 'var(--success)' : geoStatus.dropoff === 'searching...' ? 'var(--text-light)' : 'var(--danger)', fontWeight: 600, fontSize: '0.78rem' }}>
                                                {geoStatus.dropoff}
                                            </small>
                                        )}
                                    </div>

                                    {/* Ride type selector */}
                                    <div className="mb-4">
                                        <label className="section-label">Choose ride type</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {RIDE_TYPES.map(rt => (
                                                <div key={rt.id} className={`ride-type-card ${rideType === rt.id ? 'active' : ''}`}
                                                    onClick={() => setRideType(rt.id)}>
                                                    <div className="ride-type-icon">{rt.icon}</div>
                                                    <div className="ride-type-name">{rt.label}</div>
                                                    <div className="ride-type-price">~${Math.round(booking.baseFare * rt.multiplier)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fare summary */}
                                    <div style={{ background: 'var(--gradient-soft)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div className="section-label" style={{ marginBottom: '0.15rem' }}>Estimated Fare</div>
                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                                                ${finalFare}
                                            </div>
                                            {dist && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{dist.toFixed(1)} km · {selectedType?.label}</div>}
                                        </div>
                                        <div style={{ fontSize: '2.5rem' }}>{selectedType?.icon}</div>
                                    </div>

                                    <button type="submit" className="btn-ucab w-100"
                                        disabled={loading || !booking.pickupLat || !booking.dropoffLat}
                                        style={{ borderRadius: '12px', fontSize: '1rem', padding: '0.9rem' }}>
                                        {loading ? '⏳ Finding driver...' : `Request ${selectedType?.label} Ucab →`}
                                    </button>

                                    {(!booking.pickupLat || !booking.dropoffLat) && (
                                        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.75rem', marginBottom: 0 }}>
                                            Enter addresses above and wait for geocoding ✓
                                        </p>
                                    )}
                                </form>
                            </div>
                        ) : (
                            /* Active ride card */
                            <div className="card-ucab p-4 animate-fade-up delay-1">
                                <h5 style={{ fontWeight: 800, marginBottom: '1.25rem' }}>🚗 Ride Status</h5>

                                <div style={{ background: 'var(--gradient)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', color: '#fff' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.25rem' }}>Status</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeRide.status.toUpperCase()}</div>
                                </div>

                                <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
                                    <div className="mb-2">
                                        <span className="section-label">Pickup</span>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{activeRide.pickupLocation?.address}</div>
                                    </div>
                                    <div className="divider-ucab" />
                                    <div className="mb-2">
                                        <span className="section-label">Dropoff</span>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{activeRide.dropoffLocation?.address}</div>
                                    </div>
                                    <div className="divider-ucab" />
                                    <div>
                                        <span className="section-label">Fare</span>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>${activeRide.fare}</div>
                                    </div>
                                </div>

                                {activeRide.status === 'pending' && (
                                    <button onClick={handleCancel} className="btn-ucab-danger w-100">Cancel Ride</button>
                                )}
                                {activeRide.status === 'completed' && (
                                    <button onClick={() => { alert('Mock Payment Processed!'); setActiveRide(null); }}
                                        className="btn-ucab-success w-100">
                                        💳 Pay & Rate Driver
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Nearby drivers */}
                        <div className="card-ucab-flat p-4 mt-4 animate-fade-up delay-2">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h6 style={{ fontWeight: 800, margin: 0 }}>Nearby Drivers</h6>
                                <button onClick={fetchNearbyDrivers} className="btn-ucab-light" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
                                    Refresh
                                </button>
                            </div>
                            {nearbyDrivers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-light)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>No drivers nearby</div>
                                </div>
                            ) : (
                                nearbyDrivers.map(d => (
                                    <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                                                {d.name[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.name}</span>
                                        </div>
                                        <span className="badge-ucab badge-success" style={{ fontSize: '0.72rem' }}>● Available</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ======= RIGHT: Map ======= */}
                    <div className="col-12 col-lg-7 col-xl-8 animate-fade-up delay-2">
                        <div className="card-ucab overflow-hidden" style={{ height: '100%', minHeight: '500px' }}>
                            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                                <h5 style={{ fontWeight: 800, margin: 0 }}>🗺️ Live Map</h5>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {mapPickup  && <span className="badge-ucab badge-success" style={{ fontSize: '0.72rem' }}>📍 Pickup set</span>}
                                    {mapDropoff && <span className="badge-ucab badge-danger"  style={{ fontSize: '0.72rem' }}>🏁 Dropoff set</span>}
                                </div>
                            </div>
                            <MapComponent
                                pickupCoords={mapPickup}
                                pickupAddress={activeRide?.pickupLocation?.address || booking.pickupAddress}
                                dropoffCoords={mapDropoff}
                                dropoffAddress={activeRide?.dropoffLocation?.address || booking.dropoffAddress}
                                height="calc(100% - 57px)"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
