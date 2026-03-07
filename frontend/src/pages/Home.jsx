import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    if (user) {
        if (user.role === 'user') return <Navigate to="/user/dashboard" />;
        if (user.role === 'driver') return <Navigate to="/driver/dashboard" />;
    }

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 72px)' }}>
            <div className="container py-5 animate-fade-in">
                <div className="row align-items-center" style={{ minHeight: '70vh' }}>

                    {/* Left Column: Form / CTA */}
                    <div className="col-lg-5 pe-lg-5 text-start delay-100">
                        <h1 className="fw-bold mb-4" style={{ fontSize: '3.5rem', lineHeight: '1.2' }}>
                            Go anywhere with Ucab
                        </h1>
                        <p className="fs-5 text-muted mb-5">
                            Request a ride, hop in, and go.
                        </p>

                        {/* Mock Booking Form to look like Uber */}
                        <div className="p-4 bg-white border rounded shadow-sm mb-4">
                            <div className="mb-3 position-relative">
                                <input type="text" className="form-control form-control-custom bg-light border-0 px-4 rounded" placeholder="Pickup location" />
                            </div>
                            <div className="mb-4">
                                <input type="text" className="form-control form-control-custom bg-light border-0 px-4 rounded" placeholder="Dropoff location" />
                            </div>
                            <Link to="/login" className="btn btn-primary-custom w-100 py-3 fs-5 rounded-3">See prices</Link>
                        </div>

                        <div className="d-flex align-items-center mt-4">
                            <span className="text-muted me-3">New here?</span>
                            <Link to="/register" className="btn text-dark fw-bold border border-dark rounded-pill px-4">Sign up to ride</Link>
                        </div>
                    </div>

                    {/* Right Column: Visual / Map Placeholder */}
                    <div className="col-lg-7 d-none d-lg-block delay-200">
                        <div
                            className="bg-light rounded d-flex align-items-center justify-content-center"
                            style={{ height: '600px', backgroundImage: 'url(/hero_image_new.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                        >
                            {/* In a real app, Mapbox would go here */}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Home;
