const crypto = require('crypto');
const Payment = require('../models/Payment');
const { sendNotification } = require('../services/rabbitmqService');

// CREATE: Process a new payment
const processPayment = async (req, res) => {
    try {
        const { appointmentId, patientId, patientEmail, amount } = req.body;
        const transactionId = "TXN_" + crypto.randomBytes(6).toString('hex').toUpperCase();

        const newPayment = new Payment({
            appointmentId, patientId, patientEmail, amount, status: 'success', transactionId
        });
        await newPayment.save();
        console.log(`💰 Payment saved to DB: ${transactionId}`);

        // Trigger the Notification Service
        sendNotification({
            patientEmail: patientEmail,
            message: `Hello! Your payment of Rs. ${amount} for appointment ${appointmentId} was successful. Your transaction ID is ${transactionId}.`
        });

        res.status(200).json({ success: true, message: 'Payment processed successfully', transactionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Payment processing failed' });
    }
};

// READ: Get payment history for a specific patient
const getPaymentHistory = async (req, res) => {
    try {
        const { patientEmail } = req.params;
        // Find all payments for this email, sorted by newest first
        const payments = await Payment.find({ patientEmail }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch payment history' });
    }
};

module.exports = { processPayment, getPaymentHistory };