const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const prescriptionController = require("../controllers/prescriptionController");

// all routes require authentication
router.use(authMiddleware);

/**
 * POST /api/prescriptions
 * Issue a new prescription
 */
router.post("/", prescriptionController.issuePrescription);

/**
 * GET /api/prescriptions/me
 * Get all prescriptions issued by current doctor
 */
router.get("/me", prescriptionController.getMyPrescriptions);

/**
 * GET /api/prescriptions/patient/:patientId
 * Get all prescriptions for a patient
 */
router.get(
  "/patient/:patientId",
  prescriptionController.getPatientPrescriptions,
);

/**
 * GET /api/prescriptions/:id
 * Get single prescription by ID
 */
router.get("/:id", prescriptionController.getPrescriptionById);

/**
 * PUT /api/prescriptions/:id
 * Edit prescription (notes, medicines)
 */
router.put("/:id", prescriptionController.editPrescription);

/**
 * PUT /api/prescriptions/:id/status
 * Update prescription status
 */
router.put("/:id/status", prescriptionController.updatePrescriptionStatus);

module.exports = router;
