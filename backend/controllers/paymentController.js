const Payment = require('../models/Payment');
const Ride = require('../models/Ride');

// @desc    Process a payment for a ride
// @route   POST /api/payments/process
// @access  Private (User only)
const processPayment = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Not authorized for this action' });
        }

        const { rideId, method } = req.body;

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this ride' });
        }

        // Mock payment processing
        const isSuccess = Math.random() > 0.1; // 90% success rate

        const payment = await Payment.create({
            rideId,
            userId: req.user.id,
            amount: ride.fare,
            method,
            status: isSuccess ? 'completed' : 'failed'
        });

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
    try {
        let payments;

        if (req.user.role === 'user') {
            payments = await Payment.find({ userId: req.user.id }).populate('rideId');
        } else if (req.user.role === 'admin') {
            payments = await Payment.find({}).populate('userId', 'name').populate('rideId');
        } else {
            return res.status(403).json({ message: 'Not authorized for payment history' });
        }

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    processPayment,
    getPaymentHistory
};
