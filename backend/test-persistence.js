const mongoose = require("mongoose");
const Progress = require("./models/Progress");
const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/interviewBot";

async function testPersistence() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // Mock User ID
        const userId = new mongoose.Types.ObjectId();
        const role = "Software Engineer";
        const topicId = "html";
        const resources = ["html1", "html2"];

        console.log(`Testing for User: ${userId}, Role: ${role}`);

        // 1. Save Progress
        let progressDoc = await Progress.findOne({ userId, role });
        if (!progressDoc) {
            progressDoc = new Progress({ userId, role, topics: [] });
        }

        progressDoc.topics.push({ topicId, completedResources: resources });
        await progressDoc.save();
        console.log("Saved Progress:", JSON.stringify(progressDoc, null, 2));

        // 2. Fetch Progress
        const fetched = await Progress.findOne({ userId, role });
        console.log("Fetched Progress:", JSON.stringify(fetched, null, 2));

        if (fetched && fetched.topics.length > 0 && fetched.topics[0].completedResources.includes("html1")) {
            console.log("SUCCESS: Data persisted correctly.");
        } else {
            console.log("FAILURE: Data lost or format incorrect.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testPersistence();
