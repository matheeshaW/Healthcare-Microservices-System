const Appointment = require("../models/appointment.model");

// Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    // For now (temporary) — later replace with JWT
    const patientId = "temp-user-id";

    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      time,
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};