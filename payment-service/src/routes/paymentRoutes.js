const express = require('express');
const router = express.Router();
const { processPayment, getPaymentHistory } = require('../controllers/paymentController');

// Define the endpoints
router.post('/pay', processPayment);
router.get('/history/:patientEmail', getPaymentHistory);

module.exports = router;