const express = require('express');
const router = express.Router();
const { createSession, getSession } = require('../controllers/telemedicineController');

router.post('/create', createSession);
router.get('/session/:appointmentId', getSession);

module.exports = router;