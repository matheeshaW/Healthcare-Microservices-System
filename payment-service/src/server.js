const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');



const paymentRoutes = require('./routes/paymentRoutes');
const { connectRabbitMQ } = require('./services/rabbitmqService');

const app = express();
app.use(express.json());
app.use(cors()); 
app.use(express.json());


const PORT = process.env.PORT || 5005;

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'payment-service' });
});

// Route Middleware
app.use('/api/payment', paymentRoutes);

// --- Start Server 
async function startServer() {
    try {
        // 1. Connect to MongoDB 
        await 
mongoose.connect('mongodb+srv://admin:1234@cluster0.c6a4y.mongodb.net/healthcare');
        console.log('MongoDB connected for Payment Service');

        // 2. Connect to RabbitMQ 
        await connectRabbitMQ();
        
        // 3. Only start accepting HTTP requests once DB & RabbitMQ are completely ready
        app.listen(PORT, () => {
            console.log(`Payment Service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start Payment Service:', err);
        process.exit(1); 
    }
}

startServer();