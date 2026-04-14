const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');

// CREATE: Generate a new Jitsi Meeting Link for an Appointment
const createSession = async (req, res) => {
    try {
        const { appointmentId, doctorId, patientId, startTime } = req.body;

        // 1. Basic Validation
        if (!appointmentId || !doctorId || !patientId) {
            return res.status(400).json({ success: false, error: 'Missing required IDs' });
        }

        const existingSession = await Session.findOne({ appointmentId });
        if (existingSession) {
            console.log(`ℹ️ Session already exists for appointment: ${appointmentId}`);
            return res.status(200).json({ 
                success: true, 
                message: 'Session already exists for this appointment', 
                data: existingSession 
            });
        }

        // 3. Generate Secure Room ID
        const uniqueRoomId = uuidv4().replace(/-/g, '');  
        const baseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';
        const meetingLink = `${baseUrl}/Healthcare_App_${uniqueRoomId}`;

        const newSession = new Session({
            appointmentId,
            doctorId,
            patientId,
            meetingLink,
            startTime: startTime || new Date()
        });

        await newSession.save();
        console.log(`📹 Video Session Created: ${meetingLink}`);

        res.status(201).json({ success: true, data: newSession });
    } catch (error) {
        // Handle Mongoose Cast Errors (Invalid Dates)
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid startTime format' });
        }
        console.error('Telemedicine Creation Error:', error);
        res.status(500).json({ success: false, error: 'Failed to create video session' });
    }
};

// READ: Get session details 
const getSession = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        const user = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
        
        const session = await Session.findOne({ appointmentId });

        if (!session) {
            return res.status(404).json({ success: false, error: 'No video session found' });
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        console.error('Telemedicine Fetch Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch session details' });
    }
};

module.exports = { createSession, getSession };