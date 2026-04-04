const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointment.controller");

router.post("/", authenticate, authorize("patient"), createAppointment);
router.get("/my", authenticate, authorize("patient"), getMyAppointments);
router.get("/doctor", authenticate, authorize("doctor"), getDoctorAppointments);
router.put("/:id/status", authenticate, authorize("doctor", "admin"), updateAppointmentStatus);
router.delete("/:id", authenticate, authorize("patient", "admin"), cancelAppointment);

module.exports = router;