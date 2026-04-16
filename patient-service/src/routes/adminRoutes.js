const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getAllUsers, deleteUser } = require("../controllers/adminController");

router.get(
  "/users",
  authenticate,
  authorize("admin"),
  getAllUsers
);

router.delete(
  "/users/:userId",
  authenticate,
  authorize("admin"),
  deleteUser
);

module.exports = router;