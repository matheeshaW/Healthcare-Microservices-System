const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointment.controller");

router.post("/", createAppointment);
router.get("/my", getMyAppointments);
router.get("/doctor", getDoctorAppointments);
router.put("/:id/status", updateAppointmentStatus);
router.delete("/:id", cancelAppointment);
module.exports = router;