import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(email, password);
            if (user.role === 'driver')     navigate('/driver/dashboard');
            else if (user.role === 'admin') navigate('/admin/dashboard');
            else                            navigate('/user/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 66px)', background: 'var(--bg)', display: 'flex', alignItems: 'center' }}>

            {/* Background decorations */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40vh', background: 'var(--gradient)', opacity: 0.07, pointerEvents: 'none', zIndex: 0 }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

                        {/* Logo mark */}
                        <div className="text-center mb-4 animate-fade-up">
                            <div style={{
                                width: '52px', height: '52px',
                                background: 'var(--gradient)',
                                borderRadius: '14px',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.4rem', marginBottom: '1rem',
                                boxShadow: '0 8px 20px rgba(108,99,255,0.35)',
                            }}>
                                🚗
                            </div>
                            <h2 style={{ fontWeight: 800, fontSize: '1.7rem', marginBottom: '0.3rem' }}>Welcome back</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                                Sign in to your Ucab account
                            </p>
                        </div>

                        <div className="card-ucab p-4 p-md-5 animate-fade-up delay-1">

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
                                <div className="mb-3">
                                    <label className="section-label">Email address</label>
                                    <div className="input-ucab-icon">
                                        <span className="icon">✉️</span>
                                        <input
                                            id="login-email"
                                            type="email"
                                            className="input-ucab"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="section-label">Password</label>
                                    <div className="input-ucab-icon">
                                        <span className="icon">🔒</span>
                                        <input
                                            id="login-password"
                                            type="password"
                                            className="input-ucab"
                                            placeholder="Your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    id="login-submit"
                                    type="submit"
                                    className="btn-ucab w-100 py-3"
                                    disabled={loading}
                                    style={{ borderRadius: '12px', fontSize: '1rem' }}
                                >
                                    {loading ? '⏳ Signing in...' : 'Sign In →'}
                                </button>
                            </form>

                            <div className="divider-ucab" />

                            <p className="text-center mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                New to Ucab?{' '}
                                <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
