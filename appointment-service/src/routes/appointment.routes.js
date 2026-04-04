const express = require("express");
const router = express.Router();

const {
  createAppointment,
} = require("../controllers/appointment.controller");

router.post("/", createAppointment);

module.exports = router;