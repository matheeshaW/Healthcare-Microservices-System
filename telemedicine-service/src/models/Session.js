const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    appointmentId: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    meetingLink: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);