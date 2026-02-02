const router = require("express").Router();
const Analytics = require("../models/Analytics");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId, action, data } = req.body;

    // Ensure user can only log their own analytics
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!action) {
      return res.status(400).json({ message: "Action is required" });
    }

    await Analytics.create({
      userId,
      action,
      data: data || {}
    });

    res.json({ message: "Analytics logged successfully" });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get analytics for authenticated user (optional endpoint)
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const analytics = await Analytics.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(analytics);
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
