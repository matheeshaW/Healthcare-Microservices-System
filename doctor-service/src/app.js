const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// load environment variables
dotenv.config();

// initialize express app
const app = express();

// Middleware
// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (enable for frontend)
app.use(cors());

// request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
const doctorRoutes = require("./routes/doctorRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

app.use("/api/doctors", doctorRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Doctor service is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handlers
// 404 not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
