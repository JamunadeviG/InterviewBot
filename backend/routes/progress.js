const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");
const authMiddleware = require("../middleware/authMiddleware");

// ---------------- GET user progress ----------------
// GET /api/progress/:role
// Returns minimal progress data (topics array) for the logged-in user and role.
router.get("/:role", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = decodeURIComponent(req.params.role);

    console.log(`[GET Progress] User: ${userId}, Role: ${role}`);

    const progressDoc = await Progress.findOne({ userId, role });

    if (!progressDoc) {
      // No progress yet → return empty array
      console.log(`[GET Progress] No progress found for this user/role.`);
      return res.json([]);
    }

    console.log(`[GET Progress] Found ${progressDoc.topics.length} topic(s).`);
    res.json(progressDoc.topics);
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- SAVE/UPDATE topic progress ----------------
// POST /api/progress/:role
// Body: { topicId: string, completedResources: string[] }
// Upserts progress for a single topic.
router.post("/:role", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = decodeURIComponent(req.params.role);
    const { topicId, completedResources } = req.body;

    if (!topicId || !Array.isArray(completedResources)) {
      return res.status(400).json({
        message: "Invalid data. 'topicId' (string) and 'completedResources' (array) are required."
      });
    }

    console.log(`[POST Progress] User: ${userId}, Role: ${role}, Topic: ${topicId}, Resources: ${completedResources.length}`);

    // Find or create progress document for this user+role
    let progressDoc = await Progress.findOne({ userId, role });

    if (!progressDoc) {
      console.log(`[POST Progress] Creating new progress document.`);
      progressDoc = new Progress({ userId, role, topics: [] });
    }

    // Check if topic already exists
    const topicIndex = progressDoc.topics.findIndex(t => t.topicId === topicId);

    if (topicIndex > -1) {
      // Update completed resources for existing topic
      progressDoc.topics[topicIndex].completedResources = completedResources;
      console.log(`[POST Progress] Updated existing topic.`);
    } else {
      // Add new topic entry
      progressDoc.topics.push({ topicId, completedResources });
      console.log(`[POST Progress] Added new topic.`);
    }

    // Save document
    await progressDoc.save();
    console.log(`[POST Progress] Progress saved successfully.`);

    res.json({ message: "Progress saved successfully.", topics: progressDoc.topics });
  } catch (err) {
    console.error("Error saving progress:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
