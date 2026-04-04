const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    patientId: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      required: true,
    },

    medicines: [
      {
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        instructions: {
          type: String,
          default: "",
        },
      },
    ],

    status: {
      type: String,
      enum: ["issued", "filled", "expired"],
      default: "issued",
    },

    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  },
);

// index for fast patient prescription lookup
PrescriptionSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model("Prescription", PrescriptionSchema);
