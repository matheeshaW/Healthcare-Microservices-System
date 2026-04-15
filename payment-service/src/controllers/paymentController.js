const crypto = require('crypto');
const Payment = require('../models/Payment');
const { sendNotification } = require('../services/rabbitmqService');

// CREATE: Process a new payment
const processPayment = async (req, res) => {
    try {
        const { appointmentId, patientId, patientEmail, amount } = req.body;

        
        if (!appointmentId || !patientId || !patientEmail || !amount) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: appointmentId, patientId, patientEmail, and amount are required.' 
            });
        }

      
        if (amount <= 0 || isNaN(amount)) {
            return res.status(400).json({ success: false, error: 'Invalid payment amount.' });
        }

        const transactionId = "TXN_" + crypto.randomBytes(6).toString('hex').toUpperCase();

        const newPayment = new Payment({
            appointmentId, patientId, patientEmail, amount, status: 'success', transactionId
        });
        await newPayment.save();
        console.log(`💰 Payment saved to DB: ${transactionId}`);

        // Trigger the Notification Service
        try {
            await sendNotification({
                patientEmail: patientEmail,
                message: `Hello! Your payment of Rs. ${amount} for appointment ${appointmentId} was successful. Your transaction ID is ${transactionId}.`
            });
            console.log('🚀 Receipt request sent to Notification Service!');
        } catch (brokerErr) {
            console.error('⚠️ Payment saved, but failed to send to RabbitMQ:', brokerErr.message);
        }

        res.status(200).json({ success: true, message: 'Payment processed successfully', transactionId });
    } catch (error) {
        console.error('Payment Processing Error:', error);
        res.status(500).json({ success: false, error: 'Payment processing failed' });
    }
};

// READ: Get payment history for a specific patient
const getPaymentHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        if (!patientId) {
             return res.status(400).json({ success: false, error: 'Patient ID is required.' });
        }

        // Find all payments for this ID, sorted by newest first
        const payments = await Payment.find({ patientId }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (error) {
        console.error('History Fetch Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch payment history' });
    }
};

module.exports = { processPayment, getPaymentHistory };