const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const {
  getMyAccount,
  updateMyAccount,
  changeMyPassword,
  deleteMyAccount,
} = require("../controllers/userController");

router.get("/me", authenticate, getMyAccount);
router.put("/me", authenticate, updateMyAccount);
router.put("/password", authenticate, changeMyPassword);
router.delete("/me", authenticate, deleteMyAccount);

module.exports = router;
