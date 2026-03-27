const dotenv = require("dotenv");
const app = require("./src/app");
const connectDB = require("./src/config/db");

dotenv.config();

const PORT = process.env.PORT || 5002;

// start server
const startServer = async () => {
  try {
    // connect to mongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Doctor Service Running on Port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
