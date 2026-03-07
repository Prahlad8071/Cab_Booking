const express = require('express');
const router = express.Router();
const {
    getNearbyDrivers,
    bookRide,
    updateRideStatus,
    getRideById
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

router.get('/nearby', protect, getNearbyDrivers);
router.post('/book', protect, bookRide);
router.put('/:id/status', protect, updateRideStatus);
router.get('/:id', protect, getRideById);

module.exports = router;
