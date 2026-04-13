const appointmentService = require("../services/appointment.service");
const rabbitmqService = require("../services/rabbitmq.service");

// Create Appointment (patient only)
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user.id;

    const token = req.headers.authorization?.split(" ")[1];
    const availabilities = await appointmentService.fetchDoctorAvailabilities({
      doctorId,
      date,
      token,
    });

    const slotRef = appointmentService.findMatchingSlot(availabilities, date, time);

    if (!slotRef) {
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

    try {
      await appointmentService.bookDoctorSlot({
        availabilityId: slotRef.availabilityId,
        slotIndex: slotRef.slotIndex,
        appointmentId: appointment._id,
        token,
      });
    } catch (bookingError) {
      await appointmentService.deleteById(appointment._id);

      if (bookingError.response?.status === 400) {
        return res.status(409).json({
          success: false,
          message: "Selected slot is not available",
        });
      }

      if (bookingError.response || bookingError.code === "ECONNABORTED") {
        return res.status(503).json({
          success: false,
          message: "Doctor service is unavailable",
        });
      }

      throw bookingError;
    }

    rabbitmqService.publishAppointmentCreated(appointment).catch((error) => {
      console.warn("Failed to publish appointment.created event:", error.message);
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
    const isUpstreamConnectivityOrTimeoutError =
      error?.isAxiosError &&
      (!error.response ||
        [
          "ECONNABORTED",
          "ECONNREFUSED",
          "ENOTFOUND",
          "EAI_AGAIN",
          "ETIMEDOUT",
        ].includes(error.code));

    res.status(isUpstreamConnectivityOrTimeoutError ? 503 : 500).json({
      success: false,
      message: isUpstreamConnectivityOrTimeoutError
        ? "Doctor service is unavailable"
        : error.message,
    });
  }
};

// Get appointments for logged-in doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const doctor = await appointmentService.getMyDoctorProfile({ token });
    const doctorId = doctor._id;

    const appointments = await appointmentService.findByDoctorId(doctorId);

    res.json({
      success: true,
      data: appointments,
      message: "Doctor appointments fetched",
    });
  } catch (error) {
    const isUpstreamConnectivityOrTimeoutError =
      error?.isAxiosError &&
      (!error.response ||
        [
          "ECONNABORTED",
          "ECONNREFUSED",
          "ENOTFOUND",
          "EAI_AGAIN",
          "ETIMEDOUT",
        ].includes(error.code));

    res.status(isUpstreamConnectivityOrTimeoutError ? 503 : 500).json({
      success: false,
      message: isUpstreamConnectivityOrTimeoutError
        ? "Doctor service is unavailable"
        : error.message,
    });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    const appointment = await appointmentService.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // doctor can update only their assigned appointment (admin can update any)
    if (req.user.role === "doctor") {
      const doctor = await appointmentService.getMyDoctorProfile({ token });

      if (String(appointment.doctorId) !== String(doctor._id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    if (status === "cancelled") {
      const availabilities = await appointmentService.fetchDoctorAvailabilities({
        doctorId: appointment.doctorId,
        date: appointment.date,
        token,
      });

      const slotRef = appointmentService.findBookedSlotForAppointment(
        availabilities,
        appointment.date,
        appointment.time,
        appointment._id,
      );

      if (slotRef) {
        try {
          await appointmentService.releaseDoctorSlot({
            availabilityId: slotRef.availabilityId,
            slotIndex: slotRef.slotIndex,
            token,
          });
        } catch (releaseError) {
          if (releaseError.response || releaseError.code === "ECONNABORTED") {
            return res.status(503).json({
              success: false,
              message: "Doctor service is unavailable",
            });
          }

          throw releaseError;
        }
      }
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
    const token = req.headers.authorization?.split(" ")[1];

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

    const availabilities = await appointmentService.fetchDoctorAvailabilities({
      doctorId: appointment.doctorId,
      date: appointment.date,
      token,
    });

    const slotRef = appointmentService.findBookedSlotForAppointment(
      availabilities,
      appointment.date,
      appointment.time,
      appointment._id,
    );

    if (slotRef) {
      try {
        await appointmentService.releaseDoctorSlot({
          availabilityId: slotRef.availabilityId,
          slotIndex: slotRef.slotIndex,
          token,
        });
      } catch (releaseError) {
        if (releaseError.response || releaseError.code === "ECONNABORTED") {
          return res.status(503).json({
            success: false,
            message: "Doctor service is unavailable",
          });
        }

        throw releaseError;
      }
    }

    appointment.status = "cancelled";
    await appointmentService.save(appointment);

    res.json({
      success: true,
      data: appointment,
      message: "Appointment cancelled",
    });
  } catch (error) {
    const isUpstreamConnectivityOrTimeoutError =
      error?.isAxiosError &&
      (!error.response ||
        [
          "ECONNABORTED",
          "ECONNREFUSED",
          "ENOTFOUND",
          "EAI_AGAIN",
          "ETIMEDOUT",
        ].includes(error.code));

    res.status(isUpstreamConnectivityOrTimeoutError ? 503 : 500).json({
      success: false,
      message: isUpstreamConnectivityOrTimeoutError
        ? "Doctor service is unavailable"
        : error.message,
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