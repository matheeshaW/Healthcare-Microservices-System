const Availability = require("../models/Availability");
const Doctor = require("../models/Doctor");

// create availability slots for a doctor
exports.createAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body;

    // validation
    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide date and at least one time slot.",
      });
    }

    // find doctor by userId
    const doctor = await Doctor.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor profile not found. Please create your doctor profile first.",
      });
    }

    const existingAvailability = await Availability.findOne({
      doctorId: doctor._id,
      date: new Date(date),
    });

    if (existingAvailability) {
      return res.status(400).json({
        success: false,
        message: "Availability already exists for this date.",
      });
    }

    const formattedSlots = slots.map((slot) => ({
      time: slot.time,
      isBooked: false,
    }));

    // create availability document
    const availability = new Availability({
      doctorId: doctor._id,
      date: new Date(date),
      slots: formattedSlots,
    });

    await availability.save();

    res.status(201).json({
      success: true,
      data: availability,
      message: `Availability created with ${slots.length} slots`,
    });
  } catch (error) {
    console.error("Error creating availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating availability",
    });
  }
};

// get availability for a specific doctor
exports.getAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { fromDate, toDate } = req.query;

    const filter = { doctorId };

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) {
        filter.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.date.$lte = new Date(toDate);
      }
    }

    const availabilities = await Availability.find(filter).sort({ date: 1 });

    if (availabilities.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No availability found for this doctor.",
      });
    }

    res.status(200).json({
      success: true,
      data: availabilities,
      count: availabilities.length,
      message: "Availability retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability.",
    });
  }
};

// get my (current doctor's) availability
exports.getMyAvailability = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // find doctor by userId
    const doctor = await Doctor.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    // build filter
    const filter = { doctorId: doctor._id };

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) {
        filter.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.date.$lte = new Date(toDate);
      }
    }

    const availabilities = await Availability.find(filter).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: availabilities,
      count: availabilities.length,
      message: "Your availability retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching my availability.");
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability.",
    });
  }
};

// update availability slots
exports.UpdateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "Please provide slots array.",
      });
    }

    const availability = await Availability.findByIdAndUpdate(
      id,
      {
        slots: slots.map((slot) => ({
          time: slot.time,
          isBooked: slot.isBooked || false,
          appointmentId: slot.appointmentId || null,
        })),
      },
      { new: true },
    );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
      message: "Availability updated successfully.",
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating availability.",
    });
  }
};

// Mark a slot as booked (called by Appointment Service)
exports.bookSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotIndex, appointmentId } = req.body;

    if (slotIndex === undefined || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide slotIndex and appointmentId.",
      });
    }

    // find availability
    const availability = await Availability.findById(id);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    if (slotIndex < 0 || slotIndex >= availability.slots.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot index.",
      });
    }

    if (availability.slots[slotIndex].isBooked) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked.",
      });
    }

    // mark slot as booked
    availability.slots[slotIndex].isBooked = true;
    availability.slots[slotIndex].appointmentId = appointmentId;

    await availability.save();

    res.status(200).json({
      success: true,
      data: availability,
      message: "Slot booked successfully.",
    });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({
      success: false,
      message: "Server error while booking slot.",
    });
  }
};

// release a booked slot (appointment cancelled)
exports.releaseSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotIndex } = req.body;

    if (slotIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide slotIndex.",
      });
    }

    const availability = await Availability.findById(id);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    if (slotIndex < 0 || slotIndex >= availability.slots.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot index.",
      });
    }

    // release slot
    availability.slots[slotIndex].isBooked = false;
    availability.slots[slotIndex].appointmentId = null;

    await availability.save();

    res.status(200).json({
      success: true,
      data: availability,
      message: "Slot released successfully.",
    });
  } catch (error) {
    console.error("Error releasing slot:", error);
    res.status(500).json({
      success: false,
      message: "Server error while releasing slot.",
    });
  }
};
