const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to authenticate requests using JWT.
 * Expects Authorization header: "Bearer <token>"
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing or malformed" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Fetch user from database
    const user = await User.findById(decoded.userId).select("-password"); // exclude password

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user object to request
    req.user = user;
    next();

  } catch (error) {
    console.error("Auth error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authMiddleware;
