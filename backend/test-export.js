try {
    const roadmapsRoute = require("./routes/roadmaps");
    console.log("Roadmaps route loaded successfully.");
} catch (error) {
    console.error("Error loading roadmaps route:", error.message);
}

try {
    const Progress = require("./models/Progress");
    console.log("Progress model loaded successfully.");
} catch (error) {
    console.error("Error loading Progress model:", error.message);
}
