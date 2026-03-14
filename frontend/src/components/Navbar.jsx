import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const dashboardPath =
        user?.role === 'driver' ? '/driver/dashboard' :
        user?.role === 'admin'  ? '/admin/dashboard'  : '/user/dashboard';

    return (
        <nav className="navbar-ucab" style={{ padding: '0' }}>
            <div className="container d-flex align-items-center" style={{ padding: '0.85rem 1rem' }}>
                {/* Brand */}
                <Link className="navbar-brand text-white text-decoration-none fw-bold" to="/"
                    style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-1.5px', fontFamily: 'Plus Jakarta Sans' }}>
                    Ucab
                </Link>

                {/* Center links (desktop) */}
                <div className="d-none d-lg-flex ms-4 gap-3">
                    {user && (
                        <Link to={dashboardPath}
                            className="text-decoration-none btn-nav-login"
                            style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
                            Dashboard
                        </Link>
                    )}
                    {!user && (
                        <Link to="/" className="text-decoration-none btn-nav-login"
                            style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
                            Ride
                        </Link>
                    )}
                </div>

                {/* Right: Auth buttons */}
                <div className="ms-auto d-flex align-items-center gap-2">
                    {!user ? (
                        <>
                            <Link to="/login" className="btn-nav-login">Log in</Link>
                            <Link to="/register" className="btn-nav-signup">Sign up</Link>
                        </>
                    ) : (
                        <>
                            <span className="d-none d-md-inline"
                                style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', fontWeight: 500 }}>
                                Hi, {user.name.split(' ')[0]} 👋
                            </span>
                            <button onClick={handleLogout} className="btn-nav-logout">
                                Log out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
