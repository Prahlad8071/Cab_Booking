const Ride = require('../models/Ride');
const Driver = require('../models/Driver');

// @desc    Get nearby available drivers
// @route   GET /api/rides/nearby
// @access  Private
const getNearbyDrivers = async (req, res) => {
    // A simple implementation without geospatial queries for now
    try {
        const drivers = await Driver.find({ isAvailable: true }).select('-password');
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending rides
// @route   GET /api/rides/pending
// @access  Private
const getPendingRides = async (req, res) => {
    try {
        const rides = await Ride.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new ride (book)
// @route   POST /api/rides/book
// @access  Private
const bookRide = async (req, res) => {
    try {
        const { pickupLocation, dropoffLocation, fare, extraOptions } = req.body;

        if (!pickupLocation || !dropoffLocation || (!fare && fare !== 0)) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const ride = await Ride.create({
            userId: req.user.id,
            pickupLocation,
            dropoffLocation,
            fare,
            extraOptions,
            otp
        });

        res.status(201).json(ride);

        // Emit socket event to all connected drivers (or a generic 'drivers' room if we implement rooms per city)
        if (req.io) {
            req.io.emit('new_ride_request', ride);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update ride status (e.g. driver accepts, completes)
// @route   PUT /api/rides/:id/status
// @access  Private
const updateRideStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        const { otp } = req.body;

        // Only allow status changes if the user is a driver or admin, or if cancelling as user
        if (req.user.role === 'driver') {
            if (status === 'accepted') {
                ride.driverId = req.user.id;

                // Set driver as unavailable when they accept a ride
                await Driver.findByIdAndUpdate(req.user.id, { isAvailable: false });
            }
            if (status === 'in_progress') {
                if (!otp || otp !== ride.otp) {
                    return res.status(400).json({ message: 'Invalid OTP. Ask the passenger for their 4-digit PIN.' });
                }
            }
            if (status === 'completed') {
                ride.completedAt = Date.now();
                // Set driver back to available
                await Driver.findByIdAndUpdate(req.user.id, { isAvailable: true });
            }
        } else if (req.user.role === 'user' && status !== 'cancelled') {
            return res.status(403).json({ message: 'Not authorized to change status' });
        }

        ride.status = status;
        const updatedRide = await ride.save();
        res.json(updatedRide);

        // Emit socket event to the specific user room
        if (req.io) {
            req.io.to(`user_${updatedRide.userId}`).emit('ride_status_changed', updatedRide);

            // Also notify the driver room so the driver's own dashboard gets the latest state
            if (updatedRide.driverId) {
                req.io.to(`driver_${updatedRide.driverId}`).emit('ride_status_changed', updatedRide);
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get ride details by ID
// @route   GET /api/rides/:id
// @access  Private
const getRideById = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('driverId', 'name vehicleDetails');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }
        res.json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNearbyDrivers,
    getPendingRides,
    bookRide,
    updateRideStatus,
    getRideById
};
