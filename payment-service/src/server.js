const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');
const { connectRabbitMQ } = require('./services/rabbitmqService');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5005;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for Payment Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// Route Middleware
app.use('/api/payment', paymentRoutes);

// Start Server
app.listen(PORT, async () => {
    console.log(`Payment Service running on port ${PORT}`);
    await connectRabbitMQ(); // Start RabbitMQ Publisher
});