const mongoose = require("mongoose");

const AvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    slots: [
      {
        // time slot (09:00 AM - 09:30 AM)
        time: {
          type: String,
          required: true,
        },

        available: {
          type: Boolean,
          default: true,
        },

        isBooked: {
          type: Boolean,
          default: false,
        },

        appointmentId: {
          type: String,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate date-doctor combinations
AvailabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Availability", AvailabilitySchema);
