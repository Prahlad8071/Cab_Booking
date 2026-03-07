const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    vehicleDetails: {
        make: { type: String, required: true },
        model: { type: String, required: true },
        licensePlate: { type: String, required: true },
        type: { type: String, enum: ['hatchback', 'sedan', 'suv'], default: 'sedan' }
    },
    location: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    isAvailable: { type: Boolean, default: false },
    role: { type: String, default: 'driver' },
    createdAt: { type: Date, default: Date.now }
});

// Create 2dsphere index for location search if changing simple lat/lng to GeoJSON later
// For simple implementations lat/lng fields are fine.

module.exports = mongoose.model('Driver', driverSchema);
