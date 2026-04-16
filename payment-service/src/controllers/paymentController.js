const crypto = require('crypto');
const Payment = require('../models/Payment');
const { sendNotification } = require('../services/rabbitmqService'); 

// 1. STRIPE GATEWAY
exports.createCheckoutSession = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const stripe = require('stripe')('sk_test_51TMmmWKHHAALCwYCycNPzVicwTPGBu9PKXm7CaoTsBzpctmDpyhMTLcr9g1eVTWB2F0BVT5FdMjJbjnOB6dNefmB00DpsLHUyw');
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'lkr',
                    product_data: { name: 'Doctor Consultation Fee' },
                    unit_amount: 250000, 
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata: { appointmentId },
            success_url: `http://localhost:5173/appointment/my?payment=success&appointmentId=${appointmentId}`,
            cancel_url: 'http://localhost:5173/appointment/my?payment=cancelled'
        });
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. PROCESS PAYMENT (Triggers RabbitMQ)
exports.processPayment = async (req, res) => {
    try {
        const { appointmentId, patientId, patientEmail, amount, doctorId } = req.body;
        const transactionId = "TXN_" + crypto.randomBytes(6).toString('hex').toUpperCase();

        const newPayment = new Payment({
            appointmentId,
            patientId,
            doctorId: doctorId || "DOC_PENDING",
            patientEmail,
            amount,
            status: 'success',
            transactionId
        });

        await newPayment.save();

        try {
            await sendNotification({
                patientEmail: patientEmail, 
                message: `Success! Payment of Rs. ${amount} received. TXN: ${transactionId}.`
            });
        } catch (rabbitErr) {
            console.error("RabbitMQ Notification failed");
        }

        res.status(200).json({ success: true, transactionId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. GET HISTORY (REPAIRED LOGIC)
exports.getPaymentHistory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Use $or to find the ID in either column to be 100% safe for the demo
        const payments = await Payment.find({
            $or: [
                { patientId: id },
                { doctorId: id }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};