const express = require('express');
const router = express.Router();
const { getUserProfile, getUserRides } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.get('/rides', protect, getUserRides);

module.exports = router;
