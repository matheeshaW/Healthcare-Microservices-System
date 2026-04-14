const MedicalReport = require("../models/MedicalReport");

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