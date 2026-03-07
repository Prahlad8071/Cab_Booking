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

    return (
        <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top py-3">
            <div className="container">
                <Link className="navbar-brand fw-bold fs-3" to="/" style={{ color: 'var(--secondary-color)', letterSpacing: '-1px' }}>
                    Ucab
                </Link>
                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    {/* Main Nav Links aligned left (optional, currently pushing everything right) */}
                    <ul className="navbar-nav me-auto ps-4 d-none d-lg-flex">
                        <li className="nav-item">
                            <Link className="nav-link fw-bold text-white" to="/">Ride</Link>
                        </li>
                    </ul>

                    <ul className="navbar-nav ms-auto align-items-center">
                        {!user ? (
                            <>
                                <li className="nav-item mx-2">
                                    <Link className="nav-link text-white fw-medium" to="/login">Log in</Link>
                                </li>
                                <li className="nav-item ms-2">
                                    <Link className="btn btn-light rounded-pill px-4 fw-bold text-dark" style={{ padding: '0.5rem 1rem' }} to="/register">Sign up</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                {user.role === 'user' && (
                                    <li className="nav-item mx-2"><Link className="nav-link text-white fw-medium" to="/user/dashboard">Dashboard</Link></li>
                                )}
                                {user.role === 'driver' && (
                                    <li className="nav-item mx-2"><Link className="nav-link text-white fw-medium" to="/driver/dashboard">Dashboard</Link></li>
                                )}
                                {user.role === 'admin' && (
                                    <li className="nav-item mx-2"><Link className="nav-link text-white fw-medium" to="/admin/dashboard">Admin Panel</Link></li>
                                )}
                                <li className="nav-item ms-3">
                                    <button className="btn btn-light rounded-pill px-4 fw-bold text-dark" style={{ padding: '0.4rem 1rem' }} onClick={handleLogout}>
                                        Log out ({user.name.split(' ')[0]})
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
