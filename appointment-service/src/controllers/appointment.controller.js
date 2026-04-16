const appointmentService = require("../services/appointment.service");
const rabbitmqService = require("../services/rabbitmq.service");
const appointmentEventsService = require("../services/appointmentEvents.service");

const isUpstreamConnectivityOrTimeoutError = (error) =>
  error?.isAxiosError &&
  (!error.response ||
    [
      "ECONNABORTED",
      "ECONNREFUSED",
      "ENOTFOUND",
      "EAI_AGAIN",
      "ETIMEDOUT",
    ].includes(error.code));

const publishRealtimeUpdate = (appointment) => {
  appointmentEventsService.publishUpdated(appointment.toObject ? appointment.toObject() : appointment);
};

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

    const slotRef = appointmentService.findMatchingSlot(
      availabilities,
      date,
      time,
    );

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
      console.warn(
        "Failed to publish appointment.created event:",
        error.message,
      );
    });

    publishRealtimeUpdate(appointment);

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
      const availabilities = await appointmentService.fetchDoctorAvailabilities(
        {
          doctorId: appointment.doctorId,
          date: appointment.date,
          token,
        },
      );

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
    publishRealtimeUpdate(appointment);

    res.json({
      success: true,
      data: appointment,
      message: "Appointment status updated",
    });
  } catch (error) {

    res.status(isUpstreamConnectivityOrTimeoutError ? 503 : 500).json({
      success: false,
      message: isUpstreamConnectivityOrTimeoutError
        ? "Doctor service is unavailable"
        : error.message,
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

    // ADMIN deletion: Simply delete from database, no slot release needed
    if (req.user.role === "admin") {
      await appointmentService.deleteById(id);
      return res.json({
        success: true,
        data: appointment,
        message: "Appointment deleted",
      });
    }

    // PATIENT cancellation: Mark as cancelled (not currently allowed in routes, but keep for safety)
    if (String(appointment.patientId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Try to release doctor slot (non-critical)
    try {
      const availabilities = await appointmentService.fetchDoctorAvailabilities(
        {
          doctorId: appointment.doctorId,
          date: appointment.date,
          token,
        },
      );

      const slotRef = appointmentService.findBookedSlotForAppointment(
        availabilities,
        appointment.date,
        appointment.time,
        appointment._id,
      );

      if (slotRef) {
        await appointmentService.releaseDoctorSlot({
          availabilityId: slotRef.availabilityId,
          slotIndex: slotRef.slotIndex,
          token,
        });
      }
    } catch (slotError) {
      console.warn("Could not release slot:", slotError.message);
    }

    appointment.status = "cancelled";
    await appointmentService.save(appointment);
    publishRealtimeUpdate(appointment);

    res.json({
      success: true,
      data: appointment,
      message: "Appointment cancelled",
    });
  } catch (error) {

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

// Patient: reschedule own appointment (change date/time and optionally doctor)
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, doctorId: nextDoctorId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    const appointment = await appointmentService.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (String(appointment.patientId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (["cancelled", "completed"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${appointment.status} appointment`,
      });
    }

    const oldDoctorId = String(appointment.doctorId);
    const oldDate = appointment.date;
    const oldTime = appointment.time;
    const doctorId = nextDoctorId || oldDoctorId;

    const isSameBooking =
      String(doctorId) === oldDoctorId &&
      new Date(date).toISOString().slice(0, 10) === new Date(oldDate).toISOString().slice(0, 10) &&
      time === oldTime;

    if (isSameBooking) {
      return res.status(400).json({
        success: false,
        message: "New schedule must be different from the current booking",
      });
    }

    const nextAvailabilities = await appointmentService.fetchDoctorAvailabilities({
      doctorId,
      date,
      token,
    });

    const nextSlotRef = appointmentService.findMatchingSlot(nextAvailabilities, date, time);

    if (!nextSlotRef) {
      return res.status(409).json({
        success: false,
        message: "Selected new slot is not available",
      });
    }

    const oldAvailabilities = await appointmentService.fetchDoctorAvailabilities({
      doctorId: oldDoctorId,
      date: oldDate,
      token,
    });

    const oldSlotRef = appointmentService.findBookedSlotForAppointment(
      oldAvailabilities,
      oldDate,
      oldTime,
      appointment._id,
    );

    if (oldSlotRef) {
      try {
        await appointmentService.releaseDoctorSlot({
          availabilityId: oldSlotRef.availabilityId,
          slotIndex: oldSlotRef.slotIndex,
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

    try {
      await appointmentService.bookDoctorSlot({
        availabilityId: nextSlotRef.availabilityId,
        slotIndex: nextSlotRef.slotIndex,
        appointmentId: appointment._id,
        token,
      });
    } catch (bookingError) {
      if (oldSlotRef) {
        await appointmentService.bookDoctorSlot({
          availabilityId: oldSlotRef.availabilityId,
          slotIndex: oldSlotRef.slotIndex,
          appointmentId: appointment._id,
          token,
        }).catch(() => {
          // Best-effort rollback; a background reconciliation can fix any rare mismatch.
        });
      }

      if (bookingError.response?.status === 400) {
        return res.status(409).json({
          success: false,
          message: "Selected new slot is not available",
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

    appointment.doctorId = doctorId;
    appointment.date = date;
    appointment.time = time;
    appointment.status = "pending";
    await appointmentService.save(appointment);
    publishRealtimeUpdate(appointment);

    return res.json({
      success: true,
      data: appointment,
      message: "Appointment rescheduled successfully",
    });
  } catch (error) {
    res.status(isUpstreamConnectivityOrTimeoutError(error) ? 503 : 500).json({
      success: false,
      message: isUpstreamConnectivityOrTimeoutError(error)
        ? "Doctor service is unavailable"
        : error.message,
    });
  }
};

// SSE: stream current patient's appointment updates in near real time
exports.streamMyAppointments = async (req, res) => {
  const patientId = req.user.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const writeEvent = (eventName, payload) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  writeEvent("connected", { success: true, timestamp: new Date().toISOString() });

  try {
    const appointments = await appointmentService.findByPatientId(patientId);
    writeEvent("snapshot", appointments);
  } catch {
    writeEvent("error", { message: "Failed to load initial appointments" });
  }

  const listener = ({ appointment, timestamp }) => {
    if (String(appointment?.patientId) !== String(patientId)) {
      return;
    }

    writeEvent("appointment-updated", {
      appointment,
      timestamp,
    });
  };

  appointmentEventsService.onUpdated(listener);

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    appointmentEventsService.offUpdated(listener);
    res.end();
  });
};

// SSE: stream current doctor's appointment updates in near real time
exports.streamDoctorAppointments = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  let doctorId;
  try {
    const doctor = await appointmentService.getMyDoctorProfile({ token });
    doctorId = doctor._id;
  } catch {
    return res.status(503).json({
      success: false,
      message: "Doctor service is unavailable",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const writeEvent = (eventName, payload) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  writeEvent("connected", { success: true, timestamp: new Date().toISOString() });

  try {
    const appointments = await appointmentService.findByDoctorId(doctorId);
    writeEvent("snapshot", appointments);
  } catch {
    writeEvent("error", { message: "Failed to load initial appointments" });
  }

  const listener = ({ appointment, timestamp }) => {
    if (String(appointment?.doctorId) !== String(doctorId)) {
      return;
    }

    writeEvent("appointment-updated", {
      appointment,
      timestamp,
    });
  };

  appointmentEventsService.onUpdated(listener);

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    appointmentEventsService.offUpdated(listener);
    res.end();
  });
};