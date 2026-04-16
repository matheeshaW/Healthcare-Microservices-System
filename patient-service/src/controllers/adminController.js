const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const MedicalReport = require("../models/MedicalReport");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, data: users });
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account from the admin panel.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    if (user.role === "patient") {
      await PatientProfile.findOneAndDelete({ userId });
      await MedicalReport.deleteMany({ patientId: userId });
    }

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while deleting user" });
  }
};