import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import MapComponent from '../components/MapComponent';
import { getCurrentLocation } from '../hooks/useGeocoding';

const DriverDashboard = () => {
    const { user, socket } = useContext(AuthContext);
    const [isAvailable, setIsAvailable] = useState(false);
    const [activeRide, setActiveRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverCoords, setDriverCoords] = useState(null);
    const [otpInput, setOtpInput] = useState('');

    useEffect(() => {
        getCurrentLocation().then(c => { if (c) setDriverCoords(c); });
    }, []);

    useEffect(() => {
        fetchStatus();
        if (socket) {
            socket.on('new_ride_request', (ride) => {
                if (isAvailable && !activeRide) {
                    const ok = window.confirm(`New Ride!\nPickup: ${ride.pickupLocation.address}\nDropoff: ${ride.dropoffLocation.address}\nFare: $${ride.fare}\n\nAccept?`);
                    if (ok) acceptRide(ride._id);
                }
            });
            socket.on('ride_status_changed', (upd) => {
                if (activeRide && activeRide._id === upd._id) {
                    if (upd.status === 'cancelled') { alert('Passenger cancelled the ride.'); setActiveRide(null); fetchStatus(); }
                    else setActiveRide(upd);
                }
            });
        }
        return () => { if (socket) { socket.off('new_ride_request'); socket.off('ride_status_changed'); } };
    }, [socket, isAvailable, activeRide]);

    const fetchStatus = async () => {
        try {
            const r = await axios.get(`${API_URL}/api/drivers/profile`);
            setIsAvailable(r.data.isAvailable);
            const rides = await axios.get(`${API_URL}/api/drivers/rides`);
            const cur = rides.data.find(r => ['accepted', 'in_progress'].includes(r.status));
            if (cur) setActiveRide(cur);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const acceptRide = async (rideId) => {
        try { const r = await axios.put(`${API_URL}/api/rides/${rideId}/status`, { status: 'accepted' }); setActiveRide(r.data); setIsAvailable(false); }
        catch (e) { alert(e.response?.data?.message || 'Failed to accept'); }
    };

    const toggleAvailability = async () => {
        try { const r = await axios.put(`${API_URL}/api/drivers/status`, { isAvailable: !isAvailable }); setIsAvailable(r.data.isAvailable); }
        catch (e) { console.error(e); }
    };

    const handleUpdateRide = async (status) => {
        try {
            let id = activeRide?._id;
            if (!activeRide && status === 'accepted') {
                const pend = await axios.get(`${API_URL}/api/rides/pending`);
                if (pend.data.length === 0) {
                    alert('No pending rides available right now.');
                    return;
                }
                id = pend.data[0]._id;
            }
            if (!id) return;

            const payload = { status };
            if (status === 'in_progress') {
                if (otpInput.length !== 4) {
                    alert('Please enter a 4-digit OTP');
                    return;
                }
                payload.otp = otpInput;
            }

            const r = await axios.put(`${API_URL}/api/rides/${id}/status`, payload);
            if (status === 'completed') { setActiveRide(null); fetchStatus(); setOtpInput(''); }
            else { setActiveRide(r.data); setOtpInput(''); }
        } catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    };

    const mapPickup  = activeRide?.pickupLocation?.lat  ? { lat: activeRide.pickupLocation.lat,  lng: activeRide.pickupLocation.lng  } : null;
    const mapDropoff = activeRide?.dropoffLocation?.lat ? { lat: activeRide.dropoffLocation.lat, lng: activeRide.dropoffLocation.lng } : null;

    if (loading) return null;

    const statusColor = { accepted: '#3b82f6', in_progress: '#f59e0b', completed: '#10b981', pending: '#6c63ff' };

    return (
        <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 66px)' }}>

            {/* Gradient header */}
            <div className="page-header-band">
                <div className="container animate-fade-up">
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>DRIVER</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.7rem', margin: 0 }}>
                            Welcome, {user?.name?.split(' ')[0]} 🚘
                        </h2>
                        <div className={`availability-badge ${isAvailable ? 'online' : 'offline'}`}
                            style={{ background: isAvailable ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)' }}>
                            <span className={`availability-dot ${isAvailable ? 'online' : 'offline'}`} />
                            {isAvailable ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 1, paddingBottom: '3rem' }}>
                <div className="row g-4">

                    {/* LEFT: Controls + Map */}
                    <div className="col-12 col-lg-4">

                        {/* Availability toggle */}
                        <div className="card-ucab p-4 animate-fade-up delay-1">
                            <h6 style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Availability
                            </h6>
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 0.75rem',
                                    background: isAvailable ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.2rem',
                                    border: `3px solid ${isAvailable ? '#10b981' : '#ef4444'}`,
                                    boxShadow: isAvailable ? '0 0 20px rgba(16,185,129,0.2)' : '0 0 20px rgba(239,68,68,0.15)',
                                }}>
                                    {isAvailable ? '✅' : '💤'}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isAvailable ? '#059669' : '#dc2626' }}>
                                    {isAvailable ? 'You are Online' : 'You are Offline'}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    {isAvailable ? 'Accepting new ride requests' : 'Not receiving new rides'}
                                </div>
                            </div>
                            <button onClick={toggleAvailability} className={isAvailable ? 'btn-ucab-danger w-100' : 'btn-ucab w-100'}
                                style={{ borderRadius: '12px', padding: '0.8rem', fontSize: '0.95rem' }}>
                                {isAvailable ? '⏹ Go Offline' : '▶ Go Online'}
                            </button>
                        </div>

                        {/* Map */}
                        <div className="card-ucab overflow-hidden mt-4 animate-fade-up delay-2">
                            <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h6 style={{ fontWeight: 800, margin: 0 }}>🗺️ Map</h6>
                                {activeRide && <span className="badge-ucab badge-purple" style={{ fontSize: '0.72rem' }}>Active Ride</span>}
                            </div>
                            <MapComponent
                                pickupCoords={mapPickup}
                                pickupAddress={activeRide?.pickupLocation?.address}
                                dropoffCoords={mapDropoff}
                                dropoffAddress={activeRide?.dropoffLocation?.address}
                                driverCoords={!activeRide ? driverCoords : undefined}
                                height="240px"
                            />
                            <div style={{ padding: '0.6rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                {activeRide ? '🟢 Pickup · 🔴 Dropoff' : driverCoords ? '🔵 Your location' : 'Waiting for GPS...'}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Current Job */}
                    <div className="col-12 col-lg-8">
                        <div className="card-ucab p-4 p-md-5 animate-fade-up delay-2" style={{ minHeight: '400px' }}>
                            <h5 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Current Job</h5>

                            {activeRide ? (
                                <div>
                                    {/* Status bar */}
                                    <div style={{
                                        background: statusColor[activeRide.status] || 'var(--accent)',
                                        borderRadius: '12px', padding: '1rem 1.25rem',
                                        color: '#fff', marginBottom: '1.5rem',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', opacity: 0.8, marginBottom: '0.2rem' }}>RIDE STATUS</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{activeRide.status.replace('_', ' ').toUpperCase()}</div>
                                        </div>
                                        <div style={{ fontSize: '2rem' }}>
                                            {activeRide.status === 'accepted' ? '✅' : activeRide.status === 'in_progress' ? '🚗' : '🏁'}
                                        </div>
                                    </div>

                                    {/* Trip details */}
                                    <div style={{ background: 'var(--surface-2)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ width: '32px', textAlign: 'center', flexShrink: 0 }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', margin: '0 auto' }} />
                                                <div style={{ width: '2px', height: '40px', background: 'var(--border)', margin: '4px auto' }} />
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', margin: '0 auto' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="mb-3">
                                                    <div className="section-label">Pickup</div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{activeRide.pickupLocation?.address}</div>
                                                </div>
                                                <div>
                                                    <div className="section-label">Dropoff</div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{activeRide.dropoffLocation?.address}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="divider-ucab" />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Fare</span>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>${activeRide.fare}</span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexDirection: 'column' }}>
                                        {activeRide.status === 'accepted' && (
                                            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                    Ask passenger for 4-digit PIN to start ride:
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input type="text" maxLength="4" placeholder="1234" value={otpInput}
                                                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                                        style={{ 
                                                            flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)',
                                                            fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.2em'
                                                        }} 
                                                    />
                                                    <button className="btn-ucab" onClick={() => handleUpdateRide('in_progress')}
                                                        disabled={otpInput.length !== 4}
                                                        style={{ borderRadius: '8px', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                        🚗 Start Ride
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {activeRide.status === 'in_progress' && (
                                            <button className="btn-ucab-success w-100" onClick={() => handleUpdateRide('completed')}
                                                style={{ padding: '1rem', fontSize: '1.1rem' }}>
                                                🏁 Complete Ride
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📭</div>
                                    <h5 style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No active rides</h5>
                                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                        {isAvailable ? 'Waiting for a ride request...' : 'Go online to start receiving ride requests.'}
                                    </p>
                                    {isAvailable && (
                                        <button className="btn-ucab-outline" onClick={() => handleUpdateRide('accepted')}>
                                            Find Pending Ride
                                        </button>
                                    )}
                                    {!isAvailable && (
                                        <button className="btn-ucab" onClick={toggleAvailability}>
                                            ▶ Go Online to Start
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
