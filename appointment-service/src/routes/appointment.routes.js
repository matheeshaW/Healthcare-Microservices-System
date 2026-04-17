const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  validateCreateAppointment,
  validateRescheduleAppointment,
  validateStatusUpdate,
} = require("../middleware/validateAppointment");

const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
  streamMyAppointments,
  streamDoctorAppointments,
} = require("../controllers/appointment.controller");

router.get("/my", authenticate, authorize("patient"), getMyAppointments);
router.get(
  "/stream/my",
  authenticate,
  authorize("patient"),
  streamMyAppointments,
);
router.get(
  "/stream/doctor",
  authenticate,
  authorize("doctor"),
  streamDoctorAppointments,
);
router.get("/doctor", authenticate, authorize("doctor"), getDoctorAppointments);
router.get("/admin/all", authenticate, authorize("admin"), getAllAppointments);
router.post(
  "/",
  authenticate,
  authorize("patient"),
  validateCreateAppointment,
  createAppointment,
);
router.put(
  "/:id/status",
  authenticate,
  authorize("doctor", "admin"),
  validateStatusUpdate,
  updateAppointmentStatus,
);
router.put(
  "/:id/reschedule",
  authenticate,
  authorize("patient"),
  validateRescheduleAppointment,
  rescheduleAppointment,
);
router.delete(
  "/:id",
  authenticate,
  authorize("patient", "admin"),
  cancelAppointment,
);

module.exports = router;
