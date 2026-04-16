const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
  uploadReport,
  getReports,
  deleteReport
} = require("../controllers/reportController");

// Upload (patient only)
router.post(
  "/upload",
  authenticate,
  authorize("patient"),
  upload.single("file"),
  uploadReport
);

// Get reports
router.get(
  "/",
  authenticate,
  authorize("patient"),
  getReports
);

// Delete report
router.delete(
  "/:id",
  authenticate,
  authorize("patient"),
  deleteReport
);

module.exports = router;