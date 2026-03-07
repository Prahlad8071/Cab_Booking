import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
    const { user, socket } = useContext(AuthContext);
    const [nearbyDrivers, setNearbyDrivers] = useState([]);
    const [bookingDetails, setBookingDetails] = useState({
        pickupAddress: '',
        pickupLat: 0,
        pickupLng: 0,
        dropoffAddress: '',
        dropoffLat: 0,
        dropoffLng: 0,
        fare: 50
    });
    const [activeRide, setActiveRide] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNearbyDrivers();

        if (socket) {
            socket.on('ride_status_changed', (updatedRide) => {
                if (activeRide && activeRide._id === updatedRide._id) {
                    setActiveRide(updatedRide);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('ride_status_changed');
            }
        }
    }, [socket, activeRide]);

    const fetchNearbyDrivers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rides/nearby');
            setNearbyDrivers(res.data);
        } catch (err) {
            console.error('Failed to fetch nearby drivers', err);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                pickupLocation: { address: bookingDetails.pickupAddress, lat: bookingDetails.pickupLat, lng: bookingDetails.pickupLng },
                dropoffLocation: { address: bookingDetails.dropoffAddress, lat: bookingDetails.dropoffLat, lng: bookingDetails.dropoffLng },
                fare: bookingDetails.fare,
                extraOptions: { refreshments: false, donation: false }
            };
            const res = await axios.post('http://localhost:5000/api/rides/book', payload);
            setActiveRide(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        }
        setLoading(false);
    };

    const handleCancel = async () => {
        try {
            await axios.put(`http://localhost:5000/api/rides/${activeRide._id}/status`, { status: 'cancelled' });
            setActiveRide(null);
        } catch (err) {
            console.error(err);
        }
    };

    const mockCoordinates = () => {
        setBookingDetails(prev => ({
            ...prev,
            pickupLat: 40.7128,
            pickupLng: -74.0060,
            dropoffLat: 40.7580,
            dropoffLng: -73.9855
        }));
    };

    return (
        <div className="container mt-4 mt-md-5 px-3 py-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 72px)' }}>
            <h2 className="mb-4 text-center text-md-start fw-bold" style={{ color: 'var(--primary-color)' }}>Welcome, {user?.name}</h2>

            <div className="row">
                <div className="col-12 col-lg-7 col-xl-8 mb-4">
                    {!activeRide ? (
                        <div className="stat-card p-4 p-md-5 mb-4 delay-100">
                            <h4 className="fw-bold mb-4">Book a Ride</h4>
                            {error && <div className="alert alert-danger px-3 py-2 rounded-3 text-sm">{error}</div>}
                            <form onSubmit={handleBook}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Pickup Location</label>
                                    <input type="text" className="form-control form-control-custom bg-light px-3 rounded-2" style={{ border: 'none' }} placeholder="Enter pickup location" value={bookingDetails.pickupAddress} onChange={(e) => setBookingDetails({ ...bookingDetails, pickupAddress: e.target.value })} required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">Dropoff Location</label>
                                    <input type="text" className="form-control form-control-custom bg-light px-3 rounded-2" style={{ border: 'none' }} placeholder="Enter dropoff location" value={bookingDetails.dropoffAddress} onChange={(e) => setBookingDetails({ ...bookingDetails, dropoffAddress: e.target.value })} required />
                                </div>
                                <div className="mb-4">
                                    <button type="button" className="btn btn-outline-dark btn-sm rounded-pill fw-bold px-3" onClick={mockCoordinates}>Use GPS Location (Mock)</button>
                                </div>
                                <div className="mb-4 p-3 bg-light rounded text-center">
                                    <span className="fw-bold text-muted d-block small mb-1">Estimated Fare</span>
                                    <span className="fs-3 fw-bold">${bookingDetails.fare}</span>
                                </div>
                                <button type="submit" className="btn btn-primary-custom w-100 py-3 fs-5 rounded-3" disabled={loading}>
                                    {loading ? 'Finding...' : 'Request Ucab'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="stat-card p-4 p-md-5 mb-4 delay-100">
                            <h4 className="fw-bold mb-4">Current Ride Status</h4>
                            <div className="alert border-0 rounded-0 text-white" style={{ backgroundColor: '#000' }}>
                                <strong>Status:</strong> {activeRide.status.toUpperCase()}
                            </div>
                            <div className="mb-3 mt-4 p-4 border rounded-0 bg-light">
                                <p className="mb-2"><strong className="text-muted">Pickup:</strong> <span className="fw-medium text-dark">{activeRide.pickupLocation?.address}</span></p>
                                <p className="mb-2"><strong className="text-muted">Dropoff:</strong> <span className="fw-medium text-dark">{activeRide.dropoffLocation?.address}</span></p>
                                <p className="mb-0 mt-3"><strong className="text-muted">Estimated Fare:</strong> <span className="fs-4 fw-bold text-success">${activeRide.fare}</span></p>
                            </div>
                            {activeRide.status === 'pending' && (
                                <button className="btn btn-outline-danger fw-bold rounded-pill mt-3 w-100 py-2" onClick={handleCancel}>Cancel Request</button>
                            )}
                            {activeRide.status === 'completed' && (
                                <button className="btn btn-primary-custom rounded-pill mt-3 w-100 py-3 fs-5" onClick={() => {
                                    alert("Mock Payment Processed. Resetting...");
                                    setActiveRide(null);
                                }}>Pay & Rate Driver</button>
                            )}
                        </div>
                    )}
                </div>

                <div className="col-12 col-lg-5 col-xl-4">
                    <div className="stat-card px-0 py-4 mb-4 delay-200 overflow-hidden mx-auto">
                        <h4 className="fw-bold mb-3 px-4">Map</h4>
                        <div className="bg-light text-center w-100 border-top border-bottom" style={{
                            height: '350px',
                            backgroundImage: 'url(/map_placeholder.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                        </div>
                    </div>

                    <div className="stat-card p-4 delay-300">
                        <h5 className="fw-bold mb-4">Nearby Drivers</h5>
                        {nearbyDrivers.length === 0 ? (
                            <p className="text-muted">No drivers nearby.</p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {nearbyDrivers.map(d => (
                                    <li key={d._id} className="list-group-item px-0 border-light d-flex justify-content-between align-items-center">
                                        <span className="fw-medium">{d.name}</span> <span className="badge bg-dark rounded-pill">Available</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="btn btn-outline-dark fw-bold rounded-pill btn-sm mt-4 w-100" onClick={fetchNearbyDrivers}>Refresh Drivers</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
