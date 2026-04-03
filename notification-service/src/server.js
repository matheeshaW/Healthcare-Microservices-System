const express = require('express');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5004;

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for Notification Service'))
    .catch(err => console.error('MongoDB connection error:', err));

// 2. Configure the Email Sender
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 3. Connect to RabbitMQ and Listen
async function connectQueue() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'notification_queue';

        await channel.assertQueue(queue, { durable: true });
        console.log(`[*] Connected to RabbitMQ. Waiting for messages in '${queue}'...`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                console.log(`[x] Received Event:`, data);

                try {
                    // Send Email
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
                    console.error('❌ Failed to send email.');
                    
                    // Save Failure Log to Database
                    const failLog = new Notification({
                        patientEmail: data.patientEmail,
                        type: 'email',
                        message: data.message || 'Unknown message',
                        status: 'failed'
                    });
                    await failLog.save();
                }
            }
        });
    } catch (error) {
        console.error('RabbitMQ Connection Error:', error);
        setTimeout(connectQueue, 5000);
    }
}

app.listen(PORT, async () => {
    console.log(`Notification Service running on port ${PORT}`);
    await connectQueue();
});