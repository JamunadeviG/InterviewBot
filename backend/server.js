const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const roadmapsRoutes = require("./routes/roadmaps");
const rolesRoutes = require("./routes/roles");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/roadmaps", roadmapsRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Version check (for debugging)
app.get("/api/version", (req, res) => {
  res.json({ version: "v2-refactored" });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/interviewBot";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("!!! NEW CODE LOADED !!!"); // Verification log
});
