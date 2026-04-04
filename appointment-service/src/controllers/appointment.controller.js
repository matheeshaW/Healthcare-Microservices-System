const appointmentService = require("../services/appointment.service");

// Create Appointment (patient only)
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user.id;

    const token = req.headers.authorization?.split(" ")[1];
    const isAvailable = await appointmentService.checkDoctorAvailability({
      doctorId,
      date,
      time,
      token,
    });

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "Selected slot is not available",
      });
    }

    const appointment = await appointmentService.create({
      patientId,
      doctorId,
      date,
      time,
    });

    return res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment created successfully",
    });
  } catch (error) {
    if (error.response || error.code === "ECONNABORTED") {
      return res.status(503).json({
        success: false,
        message: "Doctor service is unavailable",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get appointments for logged-in patient
exports.getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await appointmentService.findByPatientId(patientId);

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

// Get appointments for logged-in doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const appointments = await appointmentService.findByDoctorId(doctorId);

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

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await appointmentService.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // doctor can update only their assigned appointment (admin can update any)
    if (
      req.user.role === "doctor" &&
      String(appointment.doctorId) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    appointment.status = status;
    await appointmentService.save(appointment);

    res.json({
      success: true,
      data: appointment,
      message: "Appointment status updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // patient can cancel only own appointment (admin can cancel any)
    if (
      req.user.role === "patient" &&
      String(appointment.patientId) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    appointment.status = "cancelled";
    await appointmentService.save(appointment);

    res.json({
      success: true,
      data: appointment,
      message: "Appointment cancelled",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: view all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.findAll();

    res.json({
      success: true,
      data: appointments,
      message: "All appointments fetched",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};