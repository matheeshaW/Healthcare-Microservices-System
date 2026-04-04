const axios = require("axios");
const Appointment = require("../models/appointment.model");

exports.create = (payload) => Appointment.create(payload);

exports.findByPatientId = (patientId) =>
  Appointment.find({ patientId }).sort({ createdAt: -1 });

exports.findByDoctorId = (doctorId) =>
  Appointment.find({ doctorId }).sort({ createdAt: -1 });

exports.findAll = () => Appointment.find().sort({ createdAt: -1 });

exports.findById = (id) => Appointment.findById(id);

exports.save = (appointment) => appointment.save();

exports.checkDoctorAvailability = async ({ doctorId, date, time, token }) => {
  const baseUrl = process.env.DOCTOR_SERVICE_URL;

  if (!baseUrl) {
    throw new Error("DOCTOR_SERVICE_URL is not configured");
  }

  const endpointTemplate =
    process.env.DOCTOR_AVAILABILITY_PATH || "/api/doctors/:doctorId/availability";
  const endpoint = endpointTemplate.replace(":doctorId", doctorId);

  const response = await axios.get(`${baseUrl}${endpoint}`, {
    params: { date, time },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 5000,
  });

  if (typeof response.data?.data?.available === "boolean") {
    return response.data.data.available;
  }

  if (typeof response.data?.available === "boolean") {
    return response.data.available;
  }

  return false;
};
