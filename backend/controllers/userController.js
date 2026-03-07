const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Get user ride history
// @route   GET /api/users/rides
// @access  Private
const getUserRides = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Not authorized as a user' });
        }
        const rides = await Ride.find({ userId: req.user.id }).populate('driverId', 'name vehicleDetails').sort({ createdAt: -1 });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
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
    getUserProfile,
    getUserRides
};
