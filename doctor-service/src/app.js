const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// testing route
app.get("/", (req, res) => {
  res.send("Doctor Service Running");
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

module.exports = app;
