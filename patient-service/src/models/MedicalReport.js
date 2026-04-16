const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileUrl: String,
    publicId: String, // for Cloudinary
    originalName: String,
    fileType: String,
    sizeBytes: Number,
    category: String,
    notes: String,
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);