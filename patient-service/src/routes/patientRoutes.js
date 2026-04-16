const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  upsertProfile,
  getProfile,
  getUserById,
  deleteProfile
} = require("../controllers/patientController");

// Only PATIENT can access
router.post(
  "/profile",
  authenticate,
  authorize("patient"),
  upsertProfile
);

router.get(
  "/profile",
  authenticate,
  authorize("patient"),
  getProfile
);

router.get(
  "/users/:userId",
  authenticate,
  authorize("doctor", "admin"),
  getUserById
);

router.delete(
  "/profile",
  authenticate,
  authorize("patient"),
  deleteProfile
);

module.exports = router;