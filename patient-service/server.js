const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/patient", require("./src/routes/patientRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/reports", require("./src/routes/reportRoutes"));
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Patient Service running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.log(err));