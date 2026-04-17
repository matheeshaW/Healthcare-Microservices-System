const express = require("express");
const {
  issuePrescription,
  getPrescriptionByAppointment,
  getMyPrescriptions,
  updatePrescriptionStatus,
  updatePrescription,
  deletePrescription,
} = require("../controllers/prescriptionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All prescription routes require authentication
router.use(authMiddleware);

/**
 * POST /api/prescriptions
 * Issue a new prescription
 * Required: appointmentId, patientId, notes, medicines[]
 */
router.post("/", issuePrescription);

/**
 * GET /api/prescriptions/me
 * Get all prescriptions issued by current doctor
 */
router.get("/me", getMyPrescriptions);

/**
 * GET /api/prescriptions/appointment/:appointmentId
 * Get prescription by appointment ID
 */
router.get("/appointment/:appointmentId", getPrescriptionByAppointment);

/**
 * PUT /api/prescriptions/:id
 * Update prescription details (notes and medicines)
 * Required: notes, medicines[]
 */
router.put("/:id", updatePrescription);

/**
 * PUT /api/prescriptions/:id/status
 * Update prescription status
 * Required: status ("issued" | "filled" | "expired" | "cancelled")
 */
router.put("/:id/status", updatePrescriptionStatus);

/**
 * DELETE /api/prescriptions/:id
 * Completely remove prescription from database
 */
router.delete("/:id", deletePrescription);

module.exports = router;
