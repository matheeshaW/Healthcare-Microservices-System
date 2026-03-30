const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const patientService = require("../services/patientService");

// Issue a new prescription
exports.issuePrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, notes, medicines, expiryDate } = req.body;

    // validation
    if (!appointmentId || !patientId || !notes || !medicines) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide appointmentId, patientId, notes, and medicines array.",
        example: {
          appointmentId: "apt-123",
          patientId: "pat-456",
          notes: "Take complete rest for 3 days.",
          medicines: [
            {
              name: "Paracetamol",
              dosage: "200mg",
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

    const doctor = await Doctor.findOne({
      userId: req.userId,
      isActive: true,
      verified: true,
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const existingPrescription = await Prescription.findOne({
      appointmentId,
    });
    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: "Prescription already issued for this appointment.",
      });
    }

    // verify patient exists (call Patient service)
    const patientProfile = await patientService.getPatientProfile(patientId);
    if (!patientProfile) {
      console.warn(
        `Warning: Could not verify patient ${patientId}, but proceeding...`,
      );
      // don't block if patient service is down. Continue anyway.
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

    // populate doctor info for response
    await prescription.populate("doctorId", "name specialization hospital");

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

// Get all prescriptions for a patient
exports.getMyPrescriptions = async (req, res) => {
  try {
    // fetch doctor profile to get doctor ID
    const doctor = await Doctor.findOne({
      userId: req.userId,
      isActive: true,
      verified: true,
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    // get prescriptions issued by this doctor
    const prescriptions = await Prescription.find({
      doctorId: doctor._id,
    })
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 });

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

// Get all prescriptions for a specific patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({
      patientId,
      status: { $ne: "expired" },
    })
      .populate("doctorId", "name specialization hospital")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions,
      count: prescriptions.length,
      message: "Patient prescriptions retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching patient prescriptions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching patient prescriptions.",
    });
  }
};

// Get single prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id).populate(
      "doctorId",
      "name specialization hospital",
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
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

// Update prescription status
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["issued", "filled", "expired"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "issued", "filled", or "expired".',
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
    console.error("Error updating prescription:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating prescription.",
    });
  }
};

// Edit prescription
exports.editPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, medicines } = req.body;

    // find prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    // Check authorization
    const doctor = await Doctor.findOne({
      userId: req.userId,
      isActive: true,
      verified: true,
    });
    if (!doctor || doctor._id.toString() !== prescription.doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized. Only the doctor issued this prescription can edit it.",
      });
    }

    if (prescription.status !== "issued") {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit prescription. Status must be "issued".',
      });
    }

    if (notes) prescription.notes = notes;
    if (medicines) {
      prescription.medicines = medicines.map((med) => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions || "",
      }));
    }

    await prescription.save();
    await prescription.populate("doctorId", "name specialization");

    res.status(200).json({
      success: true,
      data: prescription,
      message: "Prescription updated successfully.",
    });
  } catch (error) {
    console.error("Error editing prescription:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating prescription.",
    });
  }
};
