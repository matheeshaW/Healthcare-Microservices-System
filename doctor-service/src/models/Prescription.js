const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description:
        "Reference to the appointment for which prescription is issued",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
      description: "Patient ID from patient service",
    },
    notes: {
      type: String,
      required: true,
      trim: true,
      description: "Diagnosis and clinical notes",
    },
    medicines: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        dosage: {
          type: String,
          required: true,
          trim: true,
          example: "500mg, 10mg, etc.",
        },
        frequency: {
          type: String,
          required: true,
          trim: true,
          example: "Once daily, Twice daily, etc.",
        },
        duration: {
          type: String,
          required: true,
          trim: true,
          example: "7 days, 2 weeks, etc.",
        },
        instructions: {
          type: String,
          trim: true,
          default: "",
          example: "Take with food, Avoid dairy, etc.",
        },
      },
    ],
    status: {
      type: String,
      enum: ["issued", "filled", "expired", "cancelled"],
      default: "issued",
      index: true,
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  },
  {
    timestamps: true,
  },
);

// Populate doctor info when retrieving
prescriptionSchema.pre("findOne", function () {
  this.populate("doctorId", "name specialization hospital");
});

prescriptionSchema.pre("find", function () {
  this.populate("doctorId", "name specialization hospital");
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
