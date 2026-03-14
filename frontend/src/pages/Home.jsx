import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;
    if (user) {
        if (user.role === 'driver') return <Navigate to="/driver/dashboard" />;
        if (user.role === 'admin')  return <Navigate to="/admin/dashboard" />;
        return <Navigate to="/user/dashboard" />;
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 66px)', background: 'var(--bg)' }}>

            {/* ---- Hero Section ---- */}
            <section style={{
                background: 'var(--gradient)',
                padding: '4rem 0 6rem',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{
                    position: 'absolute', top: '-80px', right: '-80px',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '-60px',
                    width: '300px', height: '300px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-1px', left: 0, right: 0,
                    height: '56px', background: 'var(--bg)',
                    borderRadius: '60% 60% 0 0 / 56px 56px 0 0',
                }} />

                <div className="container">
                    <div className="row align-items-center g-5">
                        {/* Left */}
                        <div className="col-lg-5 animate-fade-up" style={{ color: '#fff' }}>
                            <span style={{
                                background: 'rgba(255,255,255,0.18)',
                                color: '#fff', fontWeight: 700, fontSize: '0.78rem',
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                padding: '0.35rem 0.9rem', borderRadius: '50px',
                                display: 'inline-block', marginBottom: '1.2rem',
                            }}>🚗 Rides on demand</span>

                            <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: '1rem' }}>
                                Go anywhere<br />with <em style={{ fontStyle: 'normal', color: '#ffe0a3' }}>Ucab</em>
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '380px', marginBottom: '2rem', lineHeight: 1.7 }}>
                                Request a ride in seconds. Affordable, safe, and always on time.
                            </p>

                            {/* Mock booking panel */}
                            <div className="card-ucab p-4" style={{ borderRadius: '16px' }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Where are you going?
                                </p>
                                <div className="mb-3 input-ucab-icon">
                                    <span className="icon">📍</span>
                                    <input className="input-ucab" placeholder="Enter pickup location" readOnly
                                        onClick={() => window.location.href = '/Cab_Booking/login'} style={{ cursor: 'pointer' }} />
                                </div>
                                <div className="mb-4 input-ucab-icon">
                                    <span className="icon">🏁</span>
                                    <input className="input-ucab" placeholder="Enter destination" readOnly
                                        onClick={() => window.location.href = '/Cab_Booking/login'} style={{ cursor: 'pointer' }} />
                                </div>
                                <Link to="/login" className="btn-ucab d-block text-center text-decoration-none" style={{ borderRadius: '12px', padding: '0.85rem', fontSize: '1rem' }}>
                                    See prices →
                                </Link>
                            </div>

                            <div style={{ marginTop: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                New to Ucab?{' '}
                                <Link to="/register" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>
                                    Sign up free
                                </Link>
                            </div>
                        </div>

                        {/* Right: Feature tiles */}
                        <div className="col-lg-7 d-none d-lg-block animate-fade-up delay-2">
                            <div className="row g-3">
                                {[
                                    { icon: '⚡', title: 'Instant Match', desc: 'Get matched with a nearby driver in under 60 seconds.' },
                                    { icon: '🛡️', title: 'Safe Rides', desc: 'Every trip is insured with real-time GPS tracking.' },
                                    { icon: '💳', title: 'Easy Payments', desc: 'Pay securely with card or wallet — no cash needed.' },
                                    { icon: '⭐', title: 'Top Drivers', desc: 'All drivers are rated, verified, and background-checked.' },
                                ].map((item, i) => (
                                    <div className="col-6" key={i}>
                                        <div className="card-ucab p-4 h-100" style={{ borderRadius: '16px' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                                            <h5 style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '1rem' }}>{item.title}</h5>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---- Driver CTA ---- */}
            <section style={{ padding: '4rem 0', background: 'var(--bg)' }}>
                <div className="container">
                    <div className="card-ucab p-5" style={{
                        background: 'var(--gradient)',
                        borderRadius: '24px', border: 'none',
                        boxShadow: '0 8px 32px rgba(108,99,255,0.25)',
                        display: 'flex', flexWrap: 'wrap',
                        alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
                    }}>
                        <div style={{ color: '#fff' }}>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                Drive with Ucab 🚘
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '1rem' }}>
                                Earn on your own schedule. Sign up as a driver today.
                            </p>
                        </div>
                        <Link to="/register" className="text-decoration-none" style={{
                            background: '#fff', color: 'var(--accent)',
                            fontWeight: 800, padding: '0.85rem 2rem',
                            borderRadius: '50px', fontSize: '1rem',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                            transition: 'transform 0.2s',
                            display: 'inline-block',
                        }}>
                            Sign up to drive →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
