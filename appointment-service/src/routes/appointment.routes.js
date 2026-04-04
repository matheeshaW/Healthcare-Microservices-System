const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
} = require("../controllers/appointment.controller");

router.post("/", createAppointment);
router.get("/my", getMyAppointments);
router.get("/doctor", getDoctorAppointments);

module.exports = router;