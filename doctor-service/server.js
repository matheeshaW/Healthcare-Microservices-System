const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5002;

// start server
const startServer = async () => {
  try {
    // connect to mongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Doctor Service running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Docs: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
