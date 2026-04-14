const express = require('express');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5004;

// Health Check Route 
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'notification-service' });
});

// --- Configure the Email Sender ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- Connect to RabbitMQ and Listen ---
async function connectQueue() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        
        // Handle unexpected RabbitMQ disconnections
        connection.on('close', () => {
            console.error('RabbitMQ connection closed. Reconnecting...');
            setTimeout(connectQueue, 5000);
        });

        const channel = await connection.createChannel();
        const queue = 'notification_queue';

        await channel.assertQueue(queue, { durable: true });
        
        
        channel.prefetch(1);
        
        console.log(`[*] Connected to RabbitMQ. Waiting for messages in '${queue}'...`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                let data;

               
                try {
                    data = JSON.parse(msg.content.toString());
                } catch (parseErr) {
                    console.error('❌ Fatal Error: Invalid JSON received. Dropping message.');
                    channel.nack(msg, false, false); 
                    return; 
                }

              
                if (!data || !data.patientEmail) {
                    console.error('❌ Fatal Error: Missing patientEmail. Dropping message.');
                    channel.nack(msg, false, false); 
                    return;
                }

                console.log(`[x] Received Event:`, data);

                try {
                   
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: data.patientEmail,
                        subject: 'Healthcare Platform - Notification',
                        text: data.message
                    });
                    
                    console.log('✅ Email sent successfully to:', data.patientEmail);

                    // Save Success Log to Database
                    const log = new Notification({
                        patientEmail: data.patientEmail,
                        type: 'email',
                        message: data.message,
                        status: 'sent'
                    });
                    await log.save();
                    console.log('📝 Notification successfully logged to Database');
                    
                   
                    channel.ack(msg); 
                } catch (emailErr) {
                    console.error('❌ Failed to send email:', emailErr.message);
                    
                    // Save Failure Log to Database
                    try {
                        const failLog = new Notification({
                            patientEmail: data.patientEmail,
                            type: 'email',
                            message: data.message || 'Unknown message',
                            status: 'failed'
                        });
                        await failLog.save();
                    } catch (dbErr) {
                        console.error('❌ Also failed to save error to database.');
                    }
                    
                    
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('RabbitMQ Connection Error:', error);
        setTimeout(connectQueue, 5000);
    }
}

//  Start Server
async function startServer() {
    try {
        // Wait for MongoDB to connect 
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Notification Service');
        
        // start the server and connect to RabbitMQ
        app.listen(PORT, async () => {
            console.log(`Notification Service running on port ${PORT}`);
            await connectQueue();
        });
    } catch (err) {
        console.error('MongoDB connection error. Shutting down.', err);
        process.exit(1); 
    }
}

startServer();