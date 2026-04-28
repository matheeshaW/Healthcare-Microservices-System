const PatientProfile = require("../models/PatientProfile");
const User = require("../models/User");

// CREATE or UPDATE profile
exports.upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      age,
      dob,
      gender,
      bloodGroup,
      heightCm,
      weightKg,
      address,
      emergencyContact,
      insuranceProvider,
      insurancePolicyNumber,
      medicalHistory,
      allergies,
      chronicConditions,
      currentMedications,
      notes
    } = req.body;

    const profile = await PatientProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        age,
        dob,
        gender,
        bloodGroup,
        heightCm,
        weightKg,
        address,
        emergencyContact,
        insuranceProvider,
        insurancePolicyNumber,
        medicalHistory,
        allergies,
        chronicConditions,
        currentMedications,
        notes
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Profile saved successfully",
      data: profile
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE profile
exports.deleteProfile = async (req, res) => {
  try {
    const deletedProfile = await PatientProfile.findOneAndDelete({
      userId: req.user.id
    });

    if (!deletedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      success: true,
      message: "Profile deleted successfully"
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
      return res.json({
        success: true,
        data: null,
        message: "Profile not created yet"
      });
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