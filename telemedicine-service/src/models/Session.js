const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true },
    doctorId: { type: String, required: true },
    patientId: { type: String, required: true },
    meetingLink: { type: String, required: true },
    startTime: { type: Date },
    endTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);