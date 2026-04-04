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

// Get appointments for logged-in patient
exports.getMyAppointments = async (req, res) => {
  try {
    // temporary (replace with JWT later)
    const patientId = "temp-user-id";

    const appointments = await Appointment.find({ patientId });

    res.json({
      success: true,
      data: appointments,
      message: "Patient appointments fetched",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get appointments for doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.query;

    const appointments = await Appointment.find({ doctorId });

    res.json({
      success: true,
      data: appointments,
      message: "Doctor appointments fetched",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};