const Availability = require("../models/Availability");
const Doctor = require("../models/Doctor");
const AVAILABILITY_WINDOW_DAYS = 28;
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Map day names to day index (0 = Sunday, 1 = Monday, ... 6 = Saturday)
const getDayIndex = (dayName) => {
  return DAYS.indexOf(dayName);
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

const toDateKey = (date) => getStartOfDay(date).toISOString().slice(0, 10);

const getDatesForDayInWindow = (startDate, endDate, dayIndex) => {
  const matchingDates = [];

  for (
    const cursor = new Date(startDate);
    cursor < endDate;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    if (cursor.getDay() === dayIndex) {
      matchingDates.push(getStartOfDay(cursor));
    }
  }

  return matchingDates;
};

// Save or update recurring availability for the next 4 weeks (day-based format)
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

    // Build 4-week rolling window from current week Monday
    const windowStartDate = getNextWeekStartDate();
    const windowEndDate = new Date(windowStartDate);
    windowEndDate.setDate(windowStartDate.getDate() + AVAILABILITY_WINDOW_DAYS);

    // Fetch all existing records for this 4-week window
    const existingRecords = await Availability.find({
      doctorId: doctor._id,
      date: {
        $gte: windowStartDate,
        $lt: windowEndDate,
      },
    });

    const existingRecordMap = new Map(
      existingRecords.map((record) => [toDateKey(record.date), record]),
    );

    // Determine the exact dates that should exist inside this window
    const targetDateKeys = new Set();
    for (const dayData of availability) {
      const dayIndex = getDayIndex(dayData?.day);
      if (dayIndex === -1) {
        continue;
      }

      const matchingDates = getDatesForDayInWindow(
        windowStartDate,
        windowEndDate,
        dayIndex,
      );

      for (const matchingDate of matchingDates) {
        targetDateKeys.add(toDateKey(matchingDate));
      }
    }

    // Delete stale records only when no booked slot exists
    const recordsToDelete = existingRecords.filter((record) => {
      if (targetDateKeys.has(toDateKey(record.date))) {
        return false;
      }

      const hasBookedSlots = Array.isArray(record.slots)
        ? record.slots.some((slot) => slot.isBooked)
        : false;

      return !hasBookedSlots;
    });

    let deletedCount = 0;
    for (const record of recordsToDelete) {
      await Availability.findByIdAndDelete(record._id);
      deletedCount++;
    }

    // Log cleanup
    console.log("📝 Saving availability for doctor:", doctor._id);
    console.log(
      `📅 Window range: ${windowStartDate.toISOString()} to ${windowEndDate.toISOString()}`,
    );
    console.log(
      "📊 Received availability data:",
      JSON.stringify(availability, null, 2),
    );
    if (deletedCount > 0) {
      console.log(`🗑️  Deleted ${deletedCount} stale records`);
    }

    let savedCount = 0;
    const results = [];

    // Process each day template for all matching dates in the window
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

      const matchingDates = getDatesForDayInWindow(
        windowStartDate,
        windowEndDate,
        dayIndex,
      );

      // Format slots - preserve available flag and initialize booking fields
      const formattedSlots = Array.isArray(slots)
        ? slots.map((slot) => ({
            time: slot.time,
            available: slot.available !== false, // Preserve doctor's availability marking
            isBooked: false,
            appointmentId: null,
          }))
        : [];

      for (const dateStartOfDay of matchingDates) {
        let availabilityRecord = existingRecordMap.get(toDateKey(dateStartOfDay));

        if (availabilityRecord) {
          // Merge new slots with existing, preserving booked appointments
          const existingSlotMap = new Map(
            availabilityRecord.slots.map((s) => [s.time, s]),
          );

          const mergedSlots = formattedSlots.map((newSlot) => {
            const existing = existingSlotMap.get(newSlot.time);
            if (existing && existing.isBooked) {
              return {
                time: newSlot.time,
                available: newSlot.available,
                isBooked: true,
                appointmentId: existing.appointmentId,
              };
            }
            return newSlot;
          });

          availabilityRecord.slots = mergedSlots;
          await availabilityRecord.save();
        } else {
          availabilityRecord = new Availability({
            doctorId: doctor._id,
            date: dateStartOfDay,
            slots: formattedSlots,
          });
          await availabilityRecord.save();
          existingRecordMap.set(toDateKey(dateStartOfDay), availabilityRecord);
        }

        console.log(
          `  Upserted ${day} (${dateStartOfDay.toDateString()}): ${formattedSlots.length} slots`,
        );

        results.push(availabilityRecord);
        savedCount++;
      }
    }

    console.log(`Saved availability for ${savedCount} day records`);

    res.status(201).json({
      success: true,
      data: results,
      message: `Availability saved for ${savedCount} day records (next 4 weeks)`,
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
