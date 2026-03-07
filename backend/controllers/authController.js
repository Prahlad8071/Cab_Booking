const User = require('../models/User');
const Driver = require('../models/Driver');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, vehicleDetails } = req.body;

        if (role === 'driver') {
            const driverExists = await Driver.findOne({ email });
            if (driverExists) {
                return res.status(400).json({ message: 'Driver already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const driver = await Driver.create({
                name,
                email,
                password: hashedPassword,
                vehicleDetails
            });

            if (driver) {
                res.status(201).json({
                    _id: driver._id,
                    name: driver.name,
                    email: driver.email,
                    role: driver.role,
                    token: generateToken(driver._id, driver.role)
                });
            } else {
                res.status(400).json({ message: 'Invalid driver data' });
            }
        } else {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'user'
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role)
                });
            } else {
                res.status(400).json({ message: 'Invalid user data' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user/driver
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (role === 'driver') {
            const driver = await Driver.findOne({ email });
            if (driver && (await bcrypt.compare(password, driver.password))) {
                res.json({
                    _id: driver._id,
                    name: driver.name,
                    email: driver.email,
                    role: driver.role,
                    token: generateToken(driver._id, driver.role)
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            const user = await User.findOne({ email });
            if (user && (await bcrypt.compare(password, user.password))) {
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role)
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user/driver profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        let user;
        if (req.user.role === 'driver') {
            user = await Driver.findById(req.user.id).select('-password');
        } else {
            user = await User.findById(req.user.id).select('-password');
        }

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile
};
