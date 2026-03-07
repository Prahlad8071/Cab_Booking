import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const DriverDashboard = () => {
    const { user, socket } = useContext(AuthContext);
    const [isAvailable, setIsAvailable] = useState(false);
    const [activeRide, setActiveRide] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();

        if (socket) {
            socket.on('new_ride_request', (ride) => {
                if (isAvailable && !activeRide) {
                    // Alert or set state to show a new request popup
                    const accept = window.confirm(`New Ride Request!\nPickup: ${ride.pickupLocation.address}\nDropoff: ${ride.dropoffLocation.address}\nFare: $${ride.fare}\nAccept?`);
                    if (accept) {
                        handleAcceptViaSocket(ride._id);
                    }
                }
            });

            socket.on('ride_status_changed', (updatedRide) => {
                // If this driver is assigned to this ride, update the local state
                if (activeRide && activeRide._id === updatedRide._id) {
                    if (updatedRide.status === 'cancelled') {
                        alert("The passenger has cancelled the ride.");
                        setActiveRide(null);
                        fetchStatus(); // re-fetch availability
                    } else {
                        setActiveRide(updatedRide);
                    }
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('new_ride_request');
                socket.off('ride_status_changed');
            }
        }
    }, [socket, isAvailable, activeRide]);

    const fetchStatus = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/drivers/profile');
            setIsAvailable(res.data.isAvailable);

            const ridesRes = await axios.get('http://localhost:5000/api/drivers/rides');
            const currentRide = ridesRes.data.find(r => ['accepted', 'in_progress'].includes(r.status));
            if (currentRide) setActiveRide(currentRide);

        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleAcceptViaSocket = async (rideId) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/rides/${rideId}/status`, { status: 'accepted' });
            setActiveRide(res.data);
            setIsAvailable(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept ride');
        }
    };

    const toggleAvailability = async () => {
        try {
            const res = await axios.put('http://localhost:5000/api/drivers/status', { isAvailable: !isAvailable });
            setIsAvailable(res.data.isAvailable);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateRide = async (status) => {
        try {
            let selectedRideId = activeRide?._id;

            if (!activeRide && status === 'accepted') {
                const newRideId = prompt("Enter Ride ID to accept (mocking real-time feed):");
                if (!newRideId) return;
                selectedRideId = newRideId;
            }

            if (!selectedRideId) return;

            const res = await axios.put(`http://localhost:5000/api/rides/${selectedRideId}/status`, { status });
            if (status === 'completed') {
                setActiveRide(null);
                fetchStatus();
            } else {
                setActiveRide(res.data);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };


    if (loading) return null;

    return (
        <div className="container mt-4 mt-md-5 px-3 py-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 72px)' }}>
            <h2 className="mb-4 text-center text-md-start fw-bold">Driver Dashboard <span className="text-muted fw-light fs-4">- Welcome, {user?.name}</span></h2>

            <div className="row flex-column-reverse flex-lg-row">
                <div className="col-12 col-lg-4 mb-4">
                    <div className="stat-card p-4 text-center delay-100">
                        <h6 className="text-muted fw-bold small text-uppercase mb-3">Availability Status</h6>
                        <div className={`display-4 my-3 fw-bold ${isAvailable ? 'text-success' : 'text-danger'}`}>
                            {isAvailable ? 'ONLINE' : 'OFFLINE'}
                        </div>
                        <button className={`btn btn-lg w-100 mt-3 rounded-pill fw-bold ${isAvailable ? 'btn-outline-danger' : 'btn-success'}`} onClick={toggleAvailability} style={!isAvailable ? { backgroundColor: '#000', borderColor: '#000', color: 'white' } : { borderColor: '#dc3545' }}>
                            {isAvailable ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>

                    <div className="stat-card px-0 py-4 mt-4 delay-200 overflow-hidden mx-auto">
                        <h4 className="fw-bold mb-3 px-4">Map</h4>
                        <div className="bg-light text-center w-100 border-top border-bottom" style={{
                            height: '250px',
                            backgroundImage: 'url(/map_placeholder.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-8 mb-4">
                    <div className="stat-card p-4 p-md-5 delay-200">
                        <h4 className="fw-bold mb-4">Current Job</h4>
                        {activeRide ? (
                            <div>
                                <div className="alert border-0 rounded-0 text-white" style={{ backgroundColor: '#000' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <strong>Status: {activeRide.status.toUpperCase()}</strong>
                                        <i className="bi bi-clock-history"></i>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-light rounded-0 border text-start">
                                    <p className="mb-2"><strong className="text-muted">Pickup:</strong> <span className="fw-medium text-dark">{activeRide.pickupLocation?.address}</span></p>
                                    <p className="mb-2"><strong className="text-muted">Dropoff:</strong> <span className="fw-medium text-dark">{activeRide.dropoffLocation?.address}</span></p>
                                    <p className="mb-0 mt-3"><strong className="text-muted">Fare:</strong> <span className="fs-4 fw-bold text-success">${activeRide.fare}</span></p>
                                </div>
                                <div className="mt-4">
                                    {activeRide.status === 'accepted' && (
                                        <button className="btn btn-primary-custom w-100 w-md-auto me-md-3 mb-2 mb-md-0 rounded-pill" onClick={() => handleUpdateRide('in_progress')}>Start Ride / In Progress</button>
                                    )}
                                    {activeRide.status === 'in_progress' && (
                                        <button className="btn btn-success w-100 w-md-auto rounded-pill fw-bold" onClick={() => handleUpdateRide('completed')} style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>Complete Ride</button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-5 bg-light rounded-0 border mt-2">
                                <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                                <h5 className="text-muted mb-4 fw-light">No active rides right now.</h5>
                                {isAvailable && (
                                    <button className="btn btn-outline-dark fw-bold rounded-pill px-4" onClick={() => handleUpdateRide('accepted')}>Simulate Accepting a Ride</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
