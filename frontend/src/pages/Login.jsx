import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'driver') {
                navigate('/driver/dashboard');
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container mt-4 mt-md-5 px-3 py-5 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 72px)' }}>
            <div className="row justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4 text-start">
                    <div className="mb-4">
                        <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>What's your email?</h2>
                    </div>

                    {error && <div className="alert alert-danger px-3 py-2 rounded-3 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="email"
                                className="form-control form-control-custom bg-light px-3 rounded-2"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ border: 'none', borderBottom: '2px solid transparent', backgroundColor: '#f3f3f3' }}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                className="form-control form-control-custom bg-light px-3 rounded-2"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ border: 'none', borderBottom: '2px solid transparent', backgroundColor: '#f3f3f3' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary-custom w-100 py-3 mt-4 fs-5 rounded-3">Continue</button>
                    </form>
                    <div className="text-center mt-4 pt-3 border-top">
                        <p className="text-muted small">New to Ucab? <Link to="/register" className="text-decoration-none fw-bold text-dark">Sign up</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
