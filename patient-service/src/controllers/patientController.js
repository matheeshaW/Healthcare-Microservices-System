const PatientProfile = require("../models/PatientProfile");

// CREATE or UPDATE profile
exports.upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await PatientProfile.findOneAndUpdate(
      { userId },
      { ...req.body, userId },
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