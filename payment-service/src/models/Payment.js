const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    appointmentId: { 
        type: String, 
        required: true 
    },
    patientId: { 
        type: String, 
        required: true 
    },
    patientEmail: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'success' 
    },
    transactionId: { 
        type: String, 
        required: true 
    }
}, { 
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Payment', paymentSchema);