const Appointment = require("../models/appointment.model");

exports.create = (payload) => Appointment.create(payload);

exports.findByPatientId = (patientId) =>
  Appointment.find({ patientId }).sort({ createdAt: -1 });

exports.findByDoctorId = (doctorId) =>
  Appointment.find({ doctorId }).sort({ createdAt: -1 });

exports.findAll = () => Appointment.find().sort({ createdAt: -1 });

exports.findById = (id) => Appointment.findById(id);

exports.save = (appointment) => appointment.save();
