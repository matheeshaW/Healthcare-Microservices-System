const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      enum: [
        "Cardiology",
        "Dermatology",
        "Pediatrics",
        "Neurology",
        "Orthopedics",
        "General Medicine",
        "Dentistry",
      ],
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    hospital: {
      type: String,
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // soft delete
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Partial unique index: only active profiles count toward uniqueness
DoctorSchema.index(
  { userId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { isActive: true },
  },
);

// index
DoctorSchema.index({ specialization: 1, verified: 1 });

module.exports = mongoose.model("Doctor", DoctorSchema);
