import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ rides: 0, drivers: 0, users: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch stats
        setTimeout(() => {
            setStats({
                rides: 124,
                drivers: 15,
                users: 340,
                revenue: 4500
            });
            setLoading(false);
        }, 800);
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-dark" role="status"></div></div>;

    return (
        <div className="container mt-4 mt-md-5 px-3 py-4 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 72px)' }}>
            <h2 className="mb-4 fw-bold">Admin Dashboard <span className="text-muted fw-light fs-4">- View as {user?.name}</span></h2>
            <div className="row">
                <div className="col-12 col-sm-6 col-lg-3 mb-4">
                    <div className="stat-card text-center p-4 h-100 delay-100" style={{ borderTop: '4px solid var(--primary-color)' }}>
                        <h6 className="text-muted fw-bold text-uppercase small mb-3">Total Rides</h6>
                        <p className="display-4 fw-bold mt-2 mb-0 text-dark">{stats.rides}</p>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3 mb-4">
                    <div className="stat-card text-center p-4 h-100 delay-200" style={{ borderTop: '4px solid #000' }}>
                        <h6 className="text-muted fw-bold text-uppercase small mb-3">Active Drivers</h6>
                        <p className="display-4 fw-bold mt-2 mb-0 text-dark">{stats.drivers}</p>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3 mb-4">
                    <div className="stat-card text-center p-4 h-100 delay-300" style={{ borderTop: '4px solid #000' }}>
                        <h6 className="text-muted fw-bold text-uppercase small mb-3">Registered Users</h6>
                        <p className="display-4 fw-bold mt-2 mb-0 text-dark">{stats.users}</p>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3 mb-4">
                    <div className="stat-card text-center p-4 h-100 delay-300" style={{ borderTop: '4px solid #000' }}>
                        <h6 className="text-muted fw-bold text-uppercase small mb-3">Total Revenue</h6>
                        <p className="display-4 fw-bold mt-2 mb-0 text-dark">${stats.revenue}</p>
                    </div>
                </div>
            </div>
            <div className="stat-card p-5 mt-2 animate-fade-in delay-300 bg-light border-0">
                <h4 className="fw-bold text-dark">More features coming soon...</h4>
                <p className="text-muted mb-0 mt-3">System monitoring, user management, and detailed financial reports.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
