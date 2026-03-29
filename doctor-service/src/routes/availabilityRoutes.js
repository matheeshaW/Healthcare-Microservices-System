const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const availabilityController = require("../controllers/availabilityController");

// all routes require authentication
router.use(authMiddleware);

/**
 * POST /api/availability
 * Create availability slots for a doctor
 */
router.post("/", availabilityController.createAvailability);

/**
 * GET /api/availability/me
 * Get current doctor's availability
 */
router.get("/me", availabilityController.getMyAvailability);

/**
 * GET /api/availability/doctor/:doctorId
 * Get availability for specific doctor
 */
router.get("/doctor/:doctorId", availabilityController.getAvailability);

/**
 * PUT /api/availability/:id
 * Update availability slots
 */
router.put("/:id", availabilityController.UpdateAvailability);

/**
 * PUT /api/availability/:id/book
 * Mark slot as booked (called by Appointment Service)
 */
router.put("/:id/book", availabilityController.bookSlot);

/**
 * PUT /api/availability/:id/release
 * Release a booked slot (appointment cancelled)
 */
router.put("/:id/release", availabilityController.releaseSlot);

module.exports = router;
