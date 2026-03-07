const Driver = require('../models/Driver');
const Ride = require('../models/Ride');

// @desc    Update driver availability/location
// @route   PUT /api/drivers/status
// @access  Private (Driver only)
const updateDriverStatus = async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Not authorized as driver' });
        }

        const { isAvailable, location } = req.body;

        const driver = await Driver.findById(req.user.id);
        if (driver) {
            if (isAvailable !== undefined) driver.isAvailable = isAvailable;
            if (location) driver.location = location;

            const updatedDriver = await driver.save();
            res.json(updatedDriver);
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver ride history
// @route   GET /api/drivers/rides
// @access  Private (Driver only)
const getDriverRides = async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Not authorized as driver' });
        }

        const rides = await Ride.find({ driverId: req.user.id }).populate('userId', 'name').sort({ createdAt: -1 });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver profile
// @route   GET /api/drivers/profile
// @access  Private (Driver only)
const getDriverProfile = async (req, res) => {
    try {
        const driver = await Driver.findById(req.user.id).select('-password');
        if (driver) {
            res.json(driver);
        } else {
            res.status(404).json({ message: 'Driver not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDriverProfile,
    updateDriverStatus,
    getDriverRides
};
