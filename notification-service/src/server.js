const express = require('express');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5004;

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'notification-service' });
});

// --- Configure the Email Sender ---
// Note: Using 'service: gmail' handles host/port/secure automatically
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
                    console.error('❌ Fatal Error: Invalid JSON received.');
                    channel.nack(msg, false, false); 
                    return; 
                }

                if (!data || !data.patientEmail) {
                    console.error('❌ Fatal Error: Missing patientEmail.');
                    channel.nack(msg, false, false); 
                    return;
                }

                console.log(`[x] Received Event for: ${data.patientEmail}`);

                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: data.patientEmail,
                        subject: 'Healthcare Platform - Payment Confirmation',
                        text: data.message
                    });
                    
                    console.log('✅ Email sent successfully to:', data.patientEmail);

                    const log = new Notification({
                        patientEmail: data.patientEmail,
                        type: 'email',
                        message: data.message,
                        status: 'sent'
                    });
                    await log.save();
                    channel.ack(msg); 
                } catch (emailErr) {
                    console.error('❌ Failed to send email:', emailErr.message);
                    
                    try {
                        const failLog = new Notification({
                            patientEmail: data.patientEmail,
                            type: 'email',
                            message: data.message || 'Unknown',
                            status: 'failed'
                        });
                        await failLog.save();
                    } catch (dbErr) {
                        console.error('❌ Failed to save error to DB.');
                    }
                    
                    // Don't requue if it's a credential error (it will just fail again)
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error('RabbitMQ Connection Error:', error.message);
        setTimeout(connectQueue, 5000);
    }
}

// Start Server
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected for Notification Service');
        
        app.listen(PORT, () => {
            console.log(`🚀 Notification Service running on port ${PORT}`);
            
            // 1. First, verify the mail server
            console.log("⏳ Verifying Mail Server...");
            transporter.verify(async (error, success) => {
                if (error) {
                    console.error("❌ Nodemailer Config Error: " + error.message);
                    console.error("Check if EMAIL_USER and EMAIL_PASS are correct in your .env");
                } else {
                    console.log("✅ Mail Server is ready to send");
                    // 2. Only then start listening to the queue
                    await connectQueue();
                }
            });
        });
    } catch (err) {
        console.error('MongoDB connection error. Shutting down.', err);
        process.exit(1); 
    }
}

startServer();