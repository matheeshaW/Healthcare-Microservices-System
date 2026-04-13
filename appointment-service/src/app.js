const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const appointmentRoutes = require("./routes/appointment.routes");

// Middleware
app.use(express.json());
app.use("/api/appointments", appointmentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Appointment Service is Running");
});

const PORT = process.env.PORT || 5003;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });