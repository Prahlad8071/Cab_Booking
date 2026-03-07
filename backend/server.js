const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const rideRoutes = require('./routes/rideRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const http = require('http');
const { Server } = require('socket.io');

// Create HTTP server and wrap Express app
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST", "PUT"]
    }
});

// Attach io to req object so routes can use it
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    // Drivers join a specific room to listen for their specific requests
    socket.on('join_driver_room', (driverId) => {
        socket.join(`driver_${driverId}`);
        console.log(`Driver ${driverId} joined room driver_${driverId}`);
    });

    // Users join a specific room to listen for their ride updates
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

