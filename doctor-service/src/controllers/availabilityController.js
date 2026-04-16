const Availability = require("../models/Availability");
const Doctor = require("../models/Doctor");

// Map day names to day index (0 = Sunday, 1 = Monday, ... 6 = Saturday)
const getDayIndex = (dayName) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days.indexOf(dayName);
};

// Get start of day (00:00:00) for a given date
const getStartOfDay = (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

// Get end of day (23:59:59) for a given date
const getEndOfDay = (date) => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

// Get the current week's Monday date
const getNextWeekStartDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday belongs to the week ending on Sunday
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() - daysSinceMonday);
  return getStartOfDay(currentWeekMonday); // Normalize to start of day
};

// Save or update weekly availability (handles day-based format from frontend)
exports.saveWeeklyAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    // Validation
    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: "Please provide availability array with days and slots.",
      });
    }

    // Find doctor by userId
    const doctor = await Doctor.findOne({
      userId: req.userId,
      isActive: true,
      verified: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor profile not found. Please create your doctor profile first.",
      });
    }

    // Get the start date (next Monday)
    const weekStartDate = getNextWeekStartDate();
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 7);
    const weekEndDateMidnight = getStartOfDay(weekEndDate);

    // Fetch all existing records for this week
    const existingRecords = await Availability.find({
      doctorId: doctor._id,
      date: {
        $gte: weekStartDate,
        $lt: weekEndDateMidnight,
      },
    });

    // Determine which days are in the request
    const requestedDays = new Set(availability.map((d) => d.day));
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Delete records for days NOT in the request (stale records)
    const recordsToDelete = existingRecords.filter((record) => {
      const recordDay = days[record.date.getDay()];
      return !requestedDays.has(recordDay);
    });

    let deletedCount = 0;
    for (const record of recordsToDelete) {
      await Availability.findByIdAndDelete(record._id);
      deletedCount++;
    }

    // Log cleanup
    console.log("📝 Saving availability for doctor:", doctor._id);
    console.log("📅 Week start date:", weekStartDate);
    console.log(
      "📊 Received availability data:",
      JSON.stringify(availability, null, 2),
    );
    if (deletedCount > 0) {
      console.log(`🗑️  Deleted ${deletedCount} stale records`);
    }

    let savedCount = 0;
    const results = [];

    // Process each day
    for (const dayData of availability) {
      const { day, slots } = dayData;

      // Skip if day is not provided
      if (!day) {
        console.log("Skipping - no day name provided");
        continue;
      }

      // Calculate the date for this day
      const dayIndex = getDayIndex(day);
      if (dayIndex === -1) {
        console.log(`Skipping - invalid day name: ${day}`);
        continue; // Invalid day name
      }

      const availabilityDate = new Date(weekStartDate);
      const currentDayIndex = weekStartDate.getDay();
      const daysToAdd = dayIndex - currentDayIndex;
      availabilityDate.setDate(weekStartDate.getDate() + daysToAdd);
      const dateStartOfDay = getStartOfDay(availabilityDate);
      const dateEndOfDay = getEndOfDay(availabilityDate);

      // Format slots - preserve available flag and initialize booking fields
      const formattedSlots = Array.isArray(slots)
        ? slots.map((slot) => ({
            time: slot.time,
            available: slot.available !== false, // Preserve doctor's availability marking
            isBooked: false,
            appointmentId: null,
          }))
        : [];

      console.log(
        `${day} (${availabilityDate.toDateString()}): ${formattedSlots.length} slots`,
      );
      console.log(
        `   Query range: ${dateStartOfDay.toISOString()} to ${dateEndOfDay.toISOString()}`,
      );

      // Check if availability already exists for this date using proper date range
      let availabilityRecord = await Availability.findOne({
        doctorId: doctor._id,
        date: {
          $gte: dateStartOfDay,
          $lte: dateEndOfDay,
        },
      });

      if (availabilityRecord) {
        // Merge new slots with existing, preserving booked appointments
        const existingSlotMap = new Map(
          availabilityRecord.slots.map((s) => [s.time, s]),
        );

        const mergedSlots = formattedSlots.map((newSlot) => {
          const existing = existingSlotMap.get(newSlot.time);
          if (existing && existing.isBooked) {
            // Preserve booked appointment - don't allow overwrites of locked slots
            return {
              time: newSlot.time,
              available: newSlot.available,
              isBooked: true,
              appointmentId: existing.appointmentId,
            };
          }
          // New slot or unbooked existing slot - use incoming values
          return newSlot;
        });

        availabilityRecord.slots = mergedSlots;
        console.log(`  Updating existing record: ${availabilityRecord._id}`);
        await availabilityRecord.save();
      } else {
        // Create new
        console.log(
          `  Creating new record for ${dateStartOfDay.toISOString()}`,
        );
        availabilityRecord = new Availability({
          doctorId: doctor._id,
          date: dateStartOfDay, // Store as start of day
          slots: formattedSlots,
        });
        await availabilityRecord.save();
      }

      results.push(availabilityRecord);
      savedCount++;
    }

    console.log(`Saved availability for ${savedCount} days`);

    res.status(201).json({
      success: true,
      data: results,
      message: `Availability saved for ${savedCount} days`,
    });
  } catch (error) {
    console.error("Error saving weekly availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving availability",
    });
  }
};

// Get my weekly availability (formatted for frontend)
exports.getMyWeeklyAvailability = async (req, res) => {
  try {
    // Find doctor by userId
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

    // Get availability for the upcoming week
    const weekStartDate = getNextWeekStartDate();
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 7);
    const weekEndDateMidnight = getStartOfDay(weekEndDate); // Start of Sunday next week

    console.log("Loading availability...");
    console.log(
      `   Week range: ${weekStartDate.toISOString()} to ${weekEndDateMidnight.toISOString()}`,
    );

    const availabilities = await Availability.find({
      doctorId: doctor._id,
      date: {
        $gte: weekStartDate,
        $lt: weekEndDateMidnight,
      },
    }).sort({ date: 1 });

    console.log(`   Found ${availabilities.length} availability records`);
    availabilities.forEach((av) => {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dateStr = av.date.toISOString();
      const dayOfWeek = av.date.getDay();
      console.log(
        `   - ${dayNames[dayOfWeek]} (${dateStr}): ${av.slots.length} slots`,
      );
    });

    // Transform to day-based format for frontend
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weeklyAvailability = [];

    for (let i = 1; i < 7; i++) {
      // Skip Sunday (index 0), use Monday-Saturday
      const dayName = days[i];
      const dayDate = new Date(weekStartDate);
      dayDate.setDate(weekStartDate.getDate() + (i - 1));
      const dayDateStart = getStartOfDay(dayDate);

      console.log(
        `   Looking for ${dayName} (${dayDateStart.toISOString()})...`,
      );

      const dayAvailability = availabilities.find((av) => {
        const avDateStart = getStartOfDay(av.date);
        const match = avDateStart.getTime() === dayDateStart.getTime();
        if (match) {
          console.log(`     ✓ Found match with ${av.slots.length} slots`);
        }
        return match;
      });

      if (!dayAvailability) {
        console.log(`     ✗ No match found`);
      }

      // Transform slots to use 'available' property from storage, not computed from isBooked
      const transformedSlots =
        dayAvailability?.slots.map((slot) => ({
          time: slot.time,
          available: slot.available !== false, // Use stored flag, default to true for backward compat
        })) || [];

      weeklyAvailability.push({
        day: dayName,
        slots: transformedSlots,
      });
    }

    res.status(200).json({
      success: true,
      availability: weeklyAvailability,
      message: "Your weekly availability retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching weekly availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability.",
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
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "Please provide slots array.",
      });
    }

    // Find the availability
    const availability = await Availability.findById(id).populate("doctorId");

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    // Authorization: only the doctor who owns this availability or admin can update
    if (
      availability.doctorId.userId !== req.userId &&
      req.userRole !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only update your own availability.",
      });
    }

    // WARNING: Only allow updating time field, NOT booking fields
    // Booking must go through bookSlot/releaseSlot endpoints
    const sanitizedSlots = slots.map((slot) => ({
      time: slot.time,
      available: slot.available !== false, // Preserve doctor's availability marking
      // NEVER allow direct setting of booking state from client
      // These are managed by bookSlot and releaseSlot only
      isBooked: false, // Force reset (or preserve existing)
      appointmentId: null, // Force reset (or preserve existing)
    }));

    const updated = await Availability.findByIdAndUpdate(
      id,
      { slots: sanitizedSlots },
      { new: true },
    );

    res.status(200).json({
      success: true,
      data: updated,
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

// TODO: When moving to production, implement service-to-service auth
// for bookSlot and releaseSlot using X-Service-Token header
// to prevent accidental misuse or unauthorized internal calls
// Mark a slot as booked (called by Appointment Service)
/**
 * Mark a slot as booked (called by Appointment Service)
 * This is the critical function for appointment system integration
 */
exports.bookSlot = async (req, res) => {
  try {
    const { id } = req.params;

    // Better validation - check if body exists first
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Request body is required. Expected format: { slotIndex: 0, appointmentId: 'apt-123' }",
      });
    }

    const { slotIndex, appointmentId } = req.body;

    // Validate required fields
    if (slotIndex === undefined || slotIndex === null) {
      return res.status(400).json({
        success: false,
        message: "slotIndex is required and must be a number (0-based index)",
      });
    }

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "appointmentId is required",
      });
    }

    // Find availability
    const availability = await Availability.findById(id);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found.",
      });
    }

    // Check if slot exists
    if (slotIndex < 0 || slotIndex >= availability.slots.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid slot index. Valid range: 0-${availability.slots.length - 1}`,
      });
    }

    // Check if slot is already booked
    if (availability.slots[slotIndex].isBooked) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked.",
      });
    }

    // Mark slot as booked
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