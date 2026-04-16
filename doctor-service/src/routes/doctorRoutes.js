const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const doctorController = require("../controllers/doctorController");

/**
 * POST /api/doctors/register
 * Register new doctor (NO AUTH REQUIRED)
 * Called during user registration from frontend
 */
router.post("/register", doctorController.registerDoctor);

// All other routes require authentication
router.use(authMiddleware);

/**
 * POST /api/doctors
 * Create doctor profile
 */
router.post("/", doctorController.createDoctorProfile);

/**
 * GET /api/doctors/me
 * Get current logged-in doctor's profile
 */
router.get("/me", doctorController.getMyprofile);

/**
 * GET /api/doctors/search
 * Search doctors by specialization
 */
router.get("/search", doctorController.searchDoctors);

/**
 * GET /api/doctors/all
 * Get all doctors (ADMIN ONLY)
 */
router.get("/all", doctorController.getAllDoctors);

/**
 * GET /api/doctors/:id
 * Get doctor profile by ID
 */
router.get("/:id", doctorController.getDoctorProfile);

/**
 * PUT /api/doctors/:id
 * Update doctor profile
 */
router.put("/:id", doctorController.updateDoctorProfile);

/**
 * PUT /api/doctors/:id/verify
 * Verify doctor (ADMIN ONLY)
 */
router.put("/:id/verify", doctorController.verifyDoctor);

/**
 * DELETE /api/doctors/:id
 * Soft delete doctor account
 */
router.delete("/:id", doctorController.deleteDoctorProfile);

module.exports = router;
