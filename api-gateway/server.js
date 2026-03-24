const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// JWT Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).send("Invalid token");
  }
};

// Public routes
app.use("/api/auth", createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL,
  changeOrigin: true
}));

// Protected routes example
app.use("/api/patient", authenticate, createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL,
  changeOrigin: true
}));

app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on port ${process.env.PORT}`);
});