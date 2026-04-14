const axios = require("axios");
const Appointment = require("../models/appointment.model");

function normalizeDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

exports.getMyDoctorProfile = async ({ token }) => {
  const baseUrl = process.env.DOCTOR_SERVICE_URL;

  if (!baseUrl) {
    throw new Error("DOCTOR_SERVICE_URL is not configured");
  }

  const endpoint = process.env.DOCTOR_ME_PATH || "/api/doctors/me";
  const response = await axios.get(`${baseUrl}${endpoint}`, {
    headers: buildAuthHeaders(token),
    timeout: 5000,
  });

  const doctor = response.data?.data;
  if (!doctor?._id) {
    throw new Error("Doctor profile not found for current user");
  }

  return doctor;
};

exports.create = (payload) => Appointment.create(payload);

exports.deleteById = (id) => Appointment.findByIdAndDelete(id);

exports.findByPatientId = (patientId) =>
  Appointment.find({ patientId }).sort({ createdAt: -1 });

exports.findByDoctorId = (doctorId) =>
  Appointment.find({ doctorId }).sort({ createdAt: -1 });

exports.findAll = () => Appointment.find().sort({ createdAt: -1 });

exports.findById = (id) => Appointment.findById(id);

exports.save = (appointment) => appointment.save();

exports.fetchDoctorAvailabilities = async ({ doctorId, date, token }) => {
  const baseUrl = process.env.DOCTOR_SERVICE_URL;

  if (!baseUrl) {
    throw new Error("DOCTOR_SERVICE_URL is not configured");
  }

  const endpointTemplate =
    process.env.DOCTOR_AVAILABILITY_PATH || "/api/availability/doctor/:doctorId";
  const endpoint = endpointTemplate.replace(":doctorId", doctorId);

  const response = await axios.get(`${baseUrl}${endpoint}`, {
    params: date ? { fromDate: date, toDate: date } : {},
    headers: buildAuthHeaders(token),
    timeout: 5000,
  });

  return Array.isArray(response.data?.data) ? response.data.data : [];
};

exports.findMatchingSlot = (availabilities, date, time) => {
  const targetDate = normalizeDate(date);

  for (const availability of availabilities) {
    if (normalizeDate(availability.date) !== targetDate) {
      continue;
    }

    const slotIndex = availability.slots.findIndex(
      (slot) => slot.time === time && !slot.isBooked,
    );

    if (slotIndex !== -1) {
      return {
        availabilityId: String(availability._id),
        slotIndex,
      };
    }
  }

  return null;
};

exports.findBookedSlotForAppointment = (availabilities, date, time, appointmentId) => {
  const targetDate = normalizeDate(date);

  for (const availability of availabilities) {
    if (normalizeDate(availability.date) !== targetDate) {
      continue;
    }

    const slotIndex = availability.slots.findIndex(
      (slot) =>
        slot.time === time &&
        slot.isBooked &&
        String(slot.appointmentId) === String(appointmentId),
    );

    if (slotIndex !== -1) {
      return {
        availabilityId: String(availability._id),
        slotIndex,
      };
    }
  }

  return null;
};

exports.checkDoctorAvailability = async ({ doctorId, date, time, token }) => {
  const availabilities = await exports.fetchDoctorAvailabilities({
    doctorId,
    date,
    token,
  });

  return Boolean(exports.findMatchingSlot(availabilities, date, time));
};

exports.bookDoctorSlot = async ({ availabilityId, slotIndex, appointmentId, token }) => {
  const baseUrl = process.env.DOCTOR_SERVICE_URL;

  if (!baseUrl) {
    throw new Error("DOCTOR_SERVICE_URL is not configured");
  }

  const endpointTemplate = process.env.DOCTOR_BOOK_SLOT_PATH || "/api/availability/:availabilityId/book";
  const endpoint = endpointTemplate.replace(":availabilityId", availabilityId);

  const response = await axios.put(
    `${baseUrl}${endpoint}`,
    { slotIndex, appointmentId },
    {
      headers: buildAuthHeaders(token),
      timeout: 5000,
    },
  );

  return response.data;
};

exports.releaseDoctorSlot = async ({ availabilityId, slotIndex, token }) => {
  const baseUrl = process.env.DOCTOR_SERVICE_URL;

  if (!baseUrl) {
    throw new Error("DOCTOR_SERVICE_URL is not configured");
  }

  const endpointTemplate =
    process.env.DOCTOR_RELEASE_SLOT_PATH || "/api/availability/:availabilityId/release";
  const endpoint = endpointTemplate.replace(":availabilityId", availabilityId);

  const response = await axios.put(
    `${baseUrl}${endpoint}`,
    { slotIndex },
    {
      headers: buildAuthHeaders(token),
      timeout: 5000,
    },
  );

  return response.data;
};
