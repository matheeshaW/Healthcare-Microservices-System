const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  age: Number,
  gender: String,
  address: String,
  medicalHistory: [String],
  allergies: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("PatientProfile", patientProfileSchema);