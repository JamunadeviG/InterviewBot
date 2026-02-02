// Native fetch in Node 22+
const BASE_URL = "http://localhost:3000/api";

async function testApi() {
    try {
        console.log("1. Logging in...");
        // Assuming a user exists or we can create one. Let's try to signup first to be safe.
        const email = `test${Date.now()}@example.com`;
        const password = "password123";

        let token;
        let userId;

        const signupRes = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test User", email, password, role: "Software Engineer" })
        });

        const signupData = await signupRes.json();
        if (signupRes.ok) {
            console.log("Signup successful");
            token = signupData.token;
            userId = signupData.user.id || signupData.user._id;
        } else {
            // Try login if signup failed (maybe user exists)
            console.log("Signup failed (maybe exists), logging in...");
            const loginRes = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            if (!loginRes.ok) throw new Error(loginData.message);
            token = loginData.token;
            userId = loginData.user.id || loginData.user._id;
        }

        console.log(`Logged in as User: ${userId}`);

        // 2. Save Progress
        console.log("2. Saving Progress...");
        const role = "Software Engineer";
        const topicId = "html";
        const completedResources = ["html1"];

        const saveRes = await fetch(`${BASE_URL}/progress/${encodeURIComponent(role)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ topicId, completedResources })
        });

        if (!saveRes.ok) {
            throw new Error(await saveRes.text());
        }
        console.log("Save Response:", await saveRes.json());

        // 3. Get Progress
        console.log("3. Fetching Progress...");
        const getRes = await fetch(`${BASE_URL}/progress/${encodeURIComponent(role)}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const progressData = await getRes.json();
        console.log("Fetched Progress:", JSON.stringify(progressData, null, 2));

        const topic = progressData.find(t => t.topicId === "html");
        if (topic && topic.completedResources.includes("html1")) {
            console.log("✅ SUCCESS: Progress persisted and fetched via API.");
        } else {
            console.error("❌ FAILURE: Data mismatch.");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

testApi();
