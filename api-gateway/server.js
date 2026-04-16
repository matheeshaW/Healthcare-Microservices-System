const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());

const requiredEnvVars = [
  "PATIENT_SERVICE_URL",
  "PAYMENT_SERVICE_URL",
  "TELEMEDICINE_SERVICE_URL",
  "APPOINTMENT_SERVICE_URL",
  "DOCTOR_SERVICE_URL",
  "NOTIFICATION_SERVICE_URL",
  "JWT_SECRET",
  "PORT",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `❌ FATAL: Required environment variables are missing: ${missingVars.join(", ")}`,
  );
  process.exit(1);
}

/* ================= AUTH MIDDLEWARE ================= */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.headers["x-user"] = JSON.stringify(decoded); // pass to services
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};

/* ================= ROUTES ================= */

// Public (no auth)
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.PATIENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/auth${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Patient Service is unreachable.",
        err.message,
      );
      res.status(502).json({
        success: false,
        error: "Patient Service is currently offline.",
      });
    },
  }),
);

// Protected (with auth)
app.use(
  "/api/patient",
  authenticate,
  createProxyMiddleware({
    target: process.env.PATIENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/patient${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Patient Service is unreachable.",
        err.message,
      );
      res.status(502).json({
        success: false,
        error: "Patient Service is currently offline.",
      });
    },
  }),
);

app.use(
  "/api/admin",
  authenticate,
  createProxyMiddleware({
    target: process.env.PATIENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/admin${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Patient Service is unreachable.",
        err.message,
      );
      res.status(502).json({
        success: false,
        error: "Patient Service is currently offline.",
      });
    },
  }),
);

// Payment Service Route
app.use(
  "/api/payment",
  authenticate,
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/payment${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Payment Service is unreachable.",
        err.message,
      );
      res.status(502).json({
        success: false,
        error: "Payment Service is currently offline.",
      });
    },
  }),
);

// Telemedicine Service Route
app.use(
  "/api/telemedicine",
  authenticate,
  createProxyMiddleware({
    target: process.env.TELEMEDICINE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/telemedicine${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Telemedicine Service unreachable.",
        err.message,
      );
      res
        .status(502)
        .json({ success: false, error: "Telemedicine Service offline." });
    },
  }),
);

app.use(
  "/api/reports",
  authenticate,
  createProxyMiddleware({
    target: process.env.PATIENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/reports${path}`,
  }),
);

app.use(
  "/api/appointments",
  authenticate,
  createProxyMiddleware({
    target: process.env.APPOINTMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/appointments${path}`,
  }),
);

// Doctor Service - Public Route (no auth required)
app.use(
  "/api/doctors/register",
  createProxyMiddleware({
    target: process.env.DOCTOR_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/doctors/register${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Doctor Service is unreachable.",
        err.message,
      );
      res.status(502).json({
        success: false,
        error: "Doctor Service is currently offline.",
      });
    },
  }),
);

// Doctor Service Routes (protected)
app.use(
  "/api/doctors",
  authenticate,
  createProxyMiddleware({
    target: process.env.DOCTOR_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/doctors${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Doctor Service is unreachable.",
        err.message,
      );
      res.status(502).json({
        success: false,
        error: "Doctor Service is currently offline.",
      });
    },
  }),
);

// Availability Routes
app.use(
  "/api/availability",
  authenticate,
  createProxyMiddleware({
    target: process.env.DOCTOR_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/availability${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Doctor Service is unreachable.",
        err.message,
      );
      res.status(502).json({
        success: false,
        error: "Doctor Service is currently offline.",
      });
    },
  }),
);

// Notification Routes
app.use(
  "/api/notifications",
  authenticate,
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/notifications${path}`,
    onError: (err, req, res) => {
      console.error(
        "Gateway Error: Notification Service is unreachable.",
        err.message,
      );
      res.status(502).json({
        success: false,
        error: "Notification Service is currently offline.",
      });
    },
  }),
);

/* ================= START ================= */
app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});
