const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    patientEmail: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['email', 'sms'], 
        default: 'email' 
    },
    message: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['sent', 'failed'], 
        default: 'sent' 
    }
}, { 
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Notification', notificationSchema);