const express = require('express');
const router = express.Router();
const { getDriverProfile, updateDriverStatus, getDriverRides } = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getDriverProfile);
router.put('/status', protect, updateDriverStatus);
router.get('/rides', protect, getDriverRides);

module.exports = router;
