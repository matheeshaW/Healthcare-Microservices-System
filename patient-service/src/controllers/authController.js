const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const allowedRoles = ["patient", "doctor", "admin"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // If registering as doctor, create doctor profile
    if (userRole === "doctor") {
      try {
        const token = jwt.sign(
          { id: user._id, role: userRole },
          process.env.JWT_SECRET,
          { expiresIn: "1d" },
        );

        const doctorServiceURL =
          process.env.DOCTOR_SERVICE_URL || "http://localhost:5002";

        await axios.post(
          `${doctorServiceURL}/api/doctors`,
          {
            name,
            specialization,
            experience: parseInt(experience),
            hospital,
            licenseNumber,
            phoneNumber,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        res.json({
          success: true,
          user,
          message: "Doctor profile created. Awaiting admin verification.",
        });
      } catch (doctorError) {
        console.error("Error creating doctor profile:", doctorError.message);
        // Even if doctor profile creation fails, user is created, so we respond with success
        // but inform about the issue
        res.status(500).json({
          success: false,
          error:
            "User created but doctor profile creation failed: " +
            doctorError.message,
        });
      }
    } else {
      res.json({ success: true, user });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
