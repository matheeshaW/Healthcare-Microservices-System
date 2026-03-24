const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  upsertProfile,
  getProfile
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

module.exports = router;