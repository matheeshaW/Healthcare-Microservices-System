const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());

if (!process.env.PATIENT_SERVICE_URL || !process.env.PAYMENT_SERVICE_URL) {
  console.error('❌ FATAL: Required Service URLs are missing from the .env file!');
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
app.use("/api/auth", createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/auth${path}`,
  onError: (err, req, res) => {
      console.error('Gateway Error: Patient Service is unreachable.', err.message);
      res.status(502).json({ success: false, error: 'Patient Service is currently offline.' });
  }
}));

// Protected (with auth)
app.use("/api/patient", authenticate, createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/patient${path}`,
  onError: (err, req, res) => {
      console.error('Gateway Error: Patient Service is unreachable.', err.message);
      res.status(502).json({ success: false, error: 'Patient Service is currently offline.' });
  }
}));

app.use("/api/admin", authenticate, createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/admin${path}`,
  onError: (err, req, res) => {
      console.error('Gateway Error: Patient Service is unreachable.', err.message);
      res.status(502).json({ success: false, error: 'Patient Service is currently offline.' });
  }
}));

// Payment Service Route
app.use("/api/payment", authenticate, createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/payment${path}`,
  onError: (err, req, res) => {
      console.error('Gateway Error: Payment Service is unreachable.', err.message);
      res.status(502).json({ success: false, error: 'Payment Service is currently offline.' });
  }
}));

app.use("/api/reports", authenticate, createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/reports${path}`
}));

app.use("/api/appointments", authenticate, createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => `/api/appointments${path}`
}));

/* ================= START ================= */
app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});