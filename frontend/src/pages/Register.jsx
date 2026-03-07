import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user', // default
        vehicleMake: '',
        vehicleModel: '',
        vehicleLicense: ''
    });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { name, email, password, role, vehicleMake, vehicleModel, vehicleLicense } = formData;
            const extraData = role === 'driver' ? {
                vehicleDetails: {
                    make: vehicleMake,
                    model: vehicleModel,
                    licensePlate: vehicleLicense
                }
            } : {};

            const user = await register(name, email, password, role, extraData);
            if (user.role === 'driver') {
                navigate('/driver/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="container mt-4 mt-md-5 px-3 py-5 animate-fade-in" style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 72px)' }}>
            <div className="row justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 text-start">
                    <div className="mb-4">
                        <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>Create an account</h2>
                        <p className="text-muted">Enter your details to get started with Ucab.</p>
                    </div>

                    {error && <div className="alert alert-danger px-3 py-2 rounded-3 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input type="text" className="form-control form-control-custom bg-light px-3 rounded-2" placeholder="First and last name" name="name" value={formData.name} onChange={handleChange} style={{ border: 'none', backgroundColor: '#f3f3f3' }} required />
                        </div>
                        <div className="mb-4">
                            <input type="email" className="form-control form-control-custom bg-light px-3 rounded-2" placeholder="Email address" name="email" value={formData.email} onChange={handleChange} style={{ border: 'none', backgroundColor: '#f3f3f3' }} required />
                        </div>
                        <div className="mb-4">
                            <input type="password" className="form-control form-control-custom bg-light px-3 rounded-2" placeholder="Password (minimum 6 characters)" name="password" value={formData.password} onChange={handleChange} style={{ border: 'none', backgroundColor: '#f3f3f3' }} required minLength="6" />
                        </div>
                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold mb-2 d-block">How will you use Ucab?</label>
                            <select className="form-select form-control-custom bg-light px-3 rounded-2 py-3" name="role" value={formData.role} onChange={handleChange} style={{ border: 'none', backgroundColor: '#f3f3f3', cursor: 'pointer' }}>
                                <option value="user">I want to ride (Passenger)</option>
                                <option value="driver">I want to earn (Driver)</option>
                            </select>
                        </div>

                        {formData.role === 'driver' && (
                            <div className="animate-fade-in border-top pt-4 mt-4 border-light">
                                <h5 className="fw-bold mb-4">Vehicle details</h5>
                                <div className="mb-3">
                                    <input type="text" className="form-control form-control-custom bg-light px-3 rounded-2" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} style={{ border: 'none', backgroundColor: '#f3f3f3' }} required placeholder="Vehicle Make (e.g. Toyota)" />
                                </div>
                                <div className="mb-3">
                                    <input type="text" className="form-control form-control-custom bg-light px-3 rounded-2" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} style={{ border: 'none', backgroundColor: '#f3f3f3' }} required placeholder="Vehicle Model (e.g. Camry)" />
                                </div>
                                <div className="mb-4">
                                    <input type="text" className="form-control form-control-custom bg-light px-3 rounded-2" name="vehicleLicense" value={formData.vehicleLicense} onChange={handleChange} style={{ border: 'none', backgroundColor: '#f3f3f3' }} required placeholder="License Plate (e.g. ABC-1234)" />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary-custom w-100 py-3 mt-4 fs-5 rounded-3">Sign up</button>
                    </form>
                    <div className="text-center mt-4 pt-3 border-top">
                        <p className="text-muted small">Already have an account? <Link to="/login" className="text-decoration-none fw-bold text-dark">Log in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
