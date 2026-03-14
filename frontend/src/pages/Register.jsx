import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        role: 'user',
        vehicleMake: '', vehicleModel: '', vehicleLicense: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { name, email, password, role, vehicleMake, vehicleModel, vehicleLicense } = formData;
            const extraData = role === 'driver'
                ? { vehicleDetails: { make: vehicleMake, model: vehicleModel, licensePlate: vehicleLicense } }
                : {};
            const user = await register(name, email, password, role, extraData);
            navigate(user.role === 'driver' ? '/driver/dashboard' : '/user/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        }
        setLoading(false);
    };

    const isDriver = formData.role === 'driver';

    return (
        <div style={{ minHeight: 'calc(100vh - 66px)', background: 'var(--bg)', display: 'flex', alignItems: 'center', padding: '2rem 0' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40vh', background: 'var(--gradient)', opacity: 0.07, pointerEvents: 'none', zIndex: 0 }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

                        {/* Header */}
                        <div className="text-center mb-4 animate-fade-up">
                            <div style={{
                                width: '52px', height: '52px', background: 'var(--gradient)',
                                borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1rem',
                                boxShadow: '0 8px 20px rgba(108,99,255,0.35)',
                            }}>
                                {isDriver ? '🚘' : '👤'}
                            </div>
                            <h2 style={{ fontWeight: 800, fontSize: '1.7rem', marginBottom: '0.3rem' }}>Create your account</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                                Join thousands of Ucab riders and drivers
                            </p>
                        </div>

                        {/* Role selector tabs */}
                        <div className="animate-fade-up delay-1 mb-4" style={{
                            display: 'flex', gap: '0.75rem',
                            background: 'var(--surface)', borderRadius: '14px',
                            padding: '0.5rem', border: '1px solid var(--border)',
                        }}>
                            {[
                                { val: 'user',   label: '🧍 I want to ride', },
                                { val: 'driver', label: '🚘 I want to drive', },
                            ].map(opt => (
                                <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setFormData(f => ({ ...f, role: opt.val }))}
                                    style={{
                                        flex: 1, border: 'none', cursor: 'pointer',
                                        padding: '0.7rem 1rem', borderRadius: '10px',
                                        fontWeight: 700, fontSize: '0.9rem',
                                        fontFamily: 'Plus Jakarta Sans',
                                        transition: 'all 0.2s',
                                        background: formData.role === opt.val ? 'var(--gradient)' : 'transparent',
                                        color: formData.role === opt.val ? '#fff' : 'var(--text-secondary)',
                                        boxShadow: formData.role === opt.val ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="card-ucab p-4 p-md-5 animate-fade-up delay-2">
                            {error && (
                                <div style={{
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                    color: '#dc2626', borderRadius: '10px', padding: '0.75rem 1rem',
                                    marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 500,
                                }}>
                                    ⚠ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Basic fields */}
                                <div className="mb-3">
                                    <label className="section-label">Full name</label>
                                    <div className="input-ucab-icon">
                                        <span className="icon">👤</span>
                                        <input className="input-ucab" type="text" name="name"
                                            placeholder="First and last name"
                                            value={formData.name} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="section-label">Email address</label>
                                    <div className="input-ucab-icon">
                                        <span className="icon">✉️</span>
                                        <input className="input-ucab" type="email" name="email"
                                            placeholder="name@example.com"
                                            value={formData.email} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="section-label">Password</label>
                                    <div className="input-ucab-icon">
                                        <span className="icon">🔒</span>
                                        <input className="input-ucab" type="password" name="password"
                                            placeholder="Minimum 6 characters"
                                            value={formData.password} onChange={handleChange} required minLength="6" />
                                    </div>
                                </div>

                                {/* Driver vehicle fields */}
                                {isDriver && (
                                    <div className="animate-scale-in" style={{
                                        borderTop: '2px dashed var(--border)', paddingTop: '1.25rem', marginBottom: '1.25rem',
                                    }}>
                                        <p className="section-label mb-3">🚗 Vehicle Details</p>
                                        <div className="mb-3">
                                            <input className="input-ucab" type="text" name="vehicleMake"
                                                placeholder="Make (e.g. Toyota)"
                                                value={formData.vehicleMake} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <input className="input-ucab" type="text" name="vehicleModel"
                                                placeholder="Model (e.g. Innova)"
                                                value={formData.vehicleModel} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <input className="input-ucab" type="text" name="vehicleLicense"
                                                placeholder="License Plate (e.g. MH-12 AB 1234)"
                                                value={formData.vehicleLicense} onChange={handleChange} required />
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="btn-ucab w-100"
                                    disabled={loading}
                                    style={{ borderRadius: '12px', fontSize: '1rem', padding: '0.85rem' }}>
                                    {loading ? '⏳ Creating account...' : `${isDriver ? '🚘 Register as Driver' : '🧍 Create Rider Account'} →`}
                                </button>
                            </form>

                            <div className="divider-ucab" />
                            <p className="text-center mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
