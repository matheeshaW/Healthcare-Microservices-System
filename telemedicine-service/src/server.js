const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const telemedicineRoutes = require('./routes/telemedicineRoutes');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5006;


app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'telemedicine-service' });
});

app.use('/api/telemedicine', telemedicineRoutes);

// Start Server 
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Telemedicine Service');

        app.listen(PORT, () => {
            console.log(`Telemedicine Service running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start Telemedicine Service:', err);
        process.exit(1); 
    }
}

startServer();