const crypto = require('crypto');
const Payment = require('../models/Payment');
const { sendNotification } = require('../services/rabbitmqService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

// ==========================================
// 1. STRIPE GATEWAY (Get the Checkout URL)
// ==========================================
const createCheckoutSession = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'lkr',
                        product_data: {
                            name: 'Doctor Consultation Fee',
                            description: `Appointment ID: ${appointmentId}`,
                        },
                        unit_amount: 250000, // 2500.00 LKR
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: { appointmentId: appointmentId },
            // Pass the appointment ID back in the URL so React knows which one was paid!
            success_url: `${process.env.FRONTEND_URL}/appointment/my?payment=success&appointmentId=${appointmentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/appointment/my?payment=cancelled`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: "Failed to create payment session." });
    }
};
// ==========================================
// 2. YOUR CUSTOM DB & RABBITMQ PROCESSOR
// ==========================================
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

        // --- NEW: SERVER-TO-SERVER COMMUNICATION ---
        // Tell your teammate's Appointment Service (Port 5000) that the payment is done!
        try {
            const appointmentServiceBaseUrl = process.env.APPOINTMENT_SERVICE_UPDATE_URL || 'http://localhost:5000';
            const appointmentResponse = await fetch(`${appointmentServiceBaseUrl}/api/appointments/${appointmentId}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Forward the patient's JWT token so the Appointment Service accepts the request!
                    'Authorization': req.headers.authorization 
                }
            });

            if (!appointmentResponse.ok) {
                console.error('⚠️ Failed to update Appointment Service status');
            } else {
                console.log('✅ Successfully notified Appointment Service to mark as Paid!');
            }
        } catch (fetchErr) {
            console.error('⚠️ Could not connect to Appointment Service:', fetchErr.message);
        }
        // -------------------------------------------

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
// ==========================================
// 3. READ HISTORY
// ==========================================
const getPaymentHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        if (!patientId) {
             return res.status(400).json({ success: false, error: 'Patient ID is required.' });
        }

        const payments = await Payment.find({ patientId }).sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (error) {
        console.error('History Fetch Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch payment history' });
    }
};

// Export all three functions!
module.exports = { createCheckoutSession, processPayment, getPaymentHistory };