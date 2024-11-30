require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const prisma = require("./config/prisma");
const resourceRoutes = require("./routes");
// const cronService = require("./services/cronService"); // Optional: If cron jobs are needed

// * making sure that upload directory is there
const uploadDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Uploads directory created.");
}

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/", resourceRoutes);

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    // Check Prisma Database Connection
    await prisma.$connect();
    res.status(200).json({ message: "API is running smoothly!" });
  } catch (error) {
    res.status(500).json({ error: "Database connection failed!" });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ error: message });
});

// Start Server
app.listen(PORT, async () => {
  try {
    console.log(`Server running on http://localhost:${PORT}`);
    // Ensure Prisma can connect to the database
    await prisma.$connect();
    console.log("Connected to the database successfully.");
    // Start any scheduled tasks (if applicable)
    // cronService.start(); // Optional: If using cron jobs
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  }
});

// Graceful Shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing server...");
  await prisma.$disconnect();
  process.exit(0);
});
