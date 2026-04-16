const PatientProfile = require("../models/PatientProfile");
const User = require("../models/User");

// CREATE or UPDATE profile
exports.upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      age,
      gender,
      address,
      medicalHistory,
      allergies
    } = req.body;

    const profile = await PatientProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        age,
        gender,
        address,
        medicalHistory,
        allergies
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: profile
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({
      userId: req.user.id
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("name role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};