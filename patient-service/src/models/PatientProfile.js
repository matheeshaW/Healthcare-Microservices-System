const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  age: Number,
  dob: Date,
  gender: String,
  bloodGroup: String,
  heightCm: Number,
  weightKg: Number,
  address: String,
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  insuranceProvider: String,
  insurancePolicyNumber: String,
  medicalHistory: [String],
  allergies: [String],
  chronicConditions: [String],
  currentMedications: [String],
  notes: String
}, {
  timestamps: true,   // ✅ adds createdAt & updatedAt
  versionKey: false   // ✅ removes __v
});

module.exports = mongoose.model("PatientProfile", patientProfileSchema);