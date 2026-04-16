const express = require('express');
const router = express.Router();
const { createCheckoutSession, processPayment, getPaymentHistory } = require('../controllers/paymentController');

// Define the endpoints
router.post('/create-checkout-session', createCheckoutSession); 
router.post('/pay', processPayment);
router.get('/history/:patientId', getPaymentHistory);

module.exports = router;