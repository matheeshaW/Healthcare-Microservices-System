const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");

/**
 * Issue a new prescription for an appointment
 * Called after doctor confirms appointment
 */
exports.issuePrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, notes, medicines, expiryDate } = req.body;

    // Validation
    if (!appointmentId || !patientId || !notes || !medicines) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide appointmentId, patientId, notes, and medicines array.",
        example: {
          appointmentId: "apt-123",
          patientId: "pat-456",
          notes: "Take complete rest for 3 days. Avoid heavy food.",
          medicines: [
            {
              name: "Paracetamol",
              dosage: "500mg",
              frequency: "Twice daily",
              duration: "7 days",
              instructions: "Take with food",
            },
          ],
        },
      });
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one medicine.",
      });
    }

    // Verify doctor
    const doctor = await Doctor.findOne({
      userId: req.userId,
      isActive: true,
      verified: true,
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found, inactive, or not verified.",
      });
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({
      appointmentId,
    });

    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: "Prescription already issued for this appointment.",
      });
    }

    // Create prescription
    const prescription = new Prescription({
      appointmentId,
      doctorId: doctor._id,
      patientId,
      notes,
      medicines: medicines.map((med) => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions || "",
      })),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    await prescription.save();

    res.status(201).json({
      success: true,
      data: prescription,
      message: "Prescription issued successfully.",
    });
  } catch (error) {
    console.error("Error issuing prescription:", error);
    res.status(500).json({
      success: false,
      message: "Server error while issuing prescription.",
    });
  }
};

/**
 * Get prescription by appointment ID
 * Used to check if prescription already exists and retrieve details
 */
exports.getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({
      appointmentId,
    }).populate("doctorId", "name specialization hospital");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "No prescription found for this appointment.",
      });
    }

    res.status(200).json({
      success: true,
      data: prescription,
      message: "Prescription retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching prescription.",
    });
  }
};

/**
 * Get all prescriptions issued by current doctor
 */
exports.getMyPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      userId: req.userId,
      isActive: true,
      verified: true,
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found, inactive, or not verified.",
      });
    }

    const prescriptions = await Prescription.find({
      doctorId: doctor._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions,
      count: prescriptions.length,
      message: "Your prescriptions retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching prescriptions.",
    });
  }
};

/**
 * Update prescription status
 */
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["issued", "filled", "expired", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid status. Must be "issued", "filled", "expired", or "cancelled".',
      });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate("doctorId", "name specialization");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: prescription,
      message: "Prescription status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating prescription status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating prescription status.",
    });
  }
};

/**
 * Update prescription details (notes and medicines)
 */
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, medicines } = req.body;

    // Validate required fields
    if (!notes || !medicines) {
      return res.status(400).json({
        success: false,
        message: "Please provide notes and medicines array.",
      });
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one medicine.",
      });
    }

    // Verify doctor owns this prescription
    const doctor = await Doctor.findOne({
      userId: req.userId,
      isActive: true,
      verified: true,
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found, inactive, or not verified.",
      });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    // Update prescription
    prescription.notes = notes;
    prescription.medicines = medicines.map((med) => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions || "",
    }));

    await prescription.save();

    res.status(200).json({
      success: true,
      data: prescription,
      message: "Prescription updated successfully.",
    });
  } catch (error) {
    console.error("Error updating prescription:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating prescription.",
    });
  }
};

/**
 * Completely delete a prescription from the database
 */
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify doctor exists
    const doctor = await Doctor.findOne({
      userId: req.userId,
      isActive: true,
      verified: true,
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found, inactive, or not verified.",
      });
    }

    // Find and delete prescription
    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Prescription removed completely.",
    });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting prescription.",
    });
  }
};
