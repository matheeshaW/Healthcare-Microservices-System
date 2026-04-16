const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const MedicalReport = require("../models/MedicalReport");

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, ...safeUser } = user;
  return safeUser;
};

exports.getMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching account" });
  }
};

exports.updateMyAccount = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingEmailUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id },
    });

    if (existingEmailUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.name = String(name).trim();
    user.email = normalizedEmail;
    user.phone = phone ? String(phone).trim() : undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
      message: "Account updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while updating account" });
  }
};

exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword, newPassword, and confirmNewPassword are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while changing password" });
  }
};

exports.deleteMyAccount = async (req, res) => {
  try {
    const { currentPassword, confirmText } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: "Current password is required" });
    }

    if (confirmText !== "DELETE") {
      return res.status(400).json({
        success: false,
        message: "Please type DELETE to confirm account deletion",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    await User.findByIdAndDelete(req.user.id);

    if (user.role === "patient") {
      await PatientProfile.findOneAndDelete({ userId: req.user.id });
      await MedicalReport.deleteMany({ patientId: req.user.id });
    }

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while deleting account" });
  }
};
