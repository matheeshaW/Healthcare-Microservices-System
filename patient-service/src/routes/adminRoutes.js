const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getAllUsers } = require("../controllers/adminController");

router.get(
  "/users",
  authenticate,
  authorize("admin"),
  getAllUsers
);

module.exports = router;