const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];

exports.validateCreateAppointment = (req, res, next) => {
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
        return res.status(400).json({
            success: false,
            message: "doctorId, date, and time are required",
        });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Invalid date format",
        });
    }

    next();
};

exports.validateStatusUpdate = (req, res, next) => {
    const { status } = req.body;

    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status",
        });
    }

    next();
};