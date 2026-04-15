const MedicalReport = require("../models/MedicalReport");
const cloudinary = require("../config/cloudinary");

// Upload report
exports.uploadReport = async (req, res) => {
  try {
    const report = await MedicalReport.create({
      patientId: req.user.id,
      fileUrl: req.file.path,        // Cloudinary URL
      publicId: req.file.filename,  // Cloudinary ID
      originalName: req.file.originalname
    });

    res.json({
      success: true,
      data: report
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({
      patientId: req.user.id
    });

    res.json({
      success: true,
      data: reports
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete report

// DELETE report
exports.deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Security: ensure owner
    if (report.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(report.publicId);

    // Delete from DB
    await report.deleteOne();

    res.json({
      success: true,
      message: "Report deleted"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};