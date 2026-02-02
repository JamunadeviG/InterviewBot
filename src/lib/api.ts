import type { Evaluation, InterviewSession, Message, Roadmap, Role, User } from "./types";

const DELAY_MS = 800;

const delay = <T>(data: T): Promise<T> => {
    return new Promise((resolve) => setTimeout(() => resolve(data), DELAY_MS));
};

// Mock Data
const MOCK_USER: User = {
    id: "u1",
    name: "Alex Dev",
    email: "alex@example.com",
    role: "Software Engineer",
};

const MOCK_ROADMAPS: Record<Role, Roadmap> = {
    "Software Engineer": {
        role: "Software Engineer",
        sections: [
            {
                title: "Foundations",
                items: [
                    { id: "r1", title: "Data Structures", description: "Arrays, Linked Lists, Trees", status: "completed", category: "CS Basics" },
                    { id: "r2", title: "Algorithms", description: "Sorting, Searching, DP", status: "in-progress", category: "CS Basics" },
                ],
            },
            {
                title: "Frontend",
                items: [
                    { id: "r3", title: "React", description: "Hooks, Context, Lifecycle", status: "pending", category: "Web" },
                ],
            },
        ],
    },
    "Data Analyst": {
        role: "Data Analyst",
        sections: [
            {
                title: "Data Handling",
                items: [
                    { id: "da1", title: "SQL", description: "Joins, Aggregations", status: "completed", category: "Database" },
                    { id: "da2", title: "Python Pandas", description: "Dataframes, cleaning", status: "in-progress", category: "Scripting" },
                ],
            },
        ],
    },
    "ML Engineer": {
        role: "ML Engineer",
        sections: [
            {
                title: "Math",
                items: [
                    { id: "ml1", title: "Linear Algebra", description: "Vectors, Matrices", status: "completed", category: "Math" },
                ],
            },
            {
                title: "Models",
                items: [
                    { id: "ml2", title: "Regression", description: "Linear, Logistic", status: "pending", category: "ML" },
                ],
            },
        ],
    },
};

export const api = {
    auth: {
        login: async (email: string, password: string): Promise<User> => {
            console.log("Login:", email, password);
            return delay(MOCK_USER);
        },
        signup: async (data: Omit<User, "id"> & { password: string }): Promise<User> => {
            console.log("Signup:", data);
            return delay({ ...data, id: "uNew" });
        },
        logout: async (): Promise<void> => delay(undefined),
    },
    roadmap: {
        get: async (role: Role): Promise<Roadmap> => {
            return delay(MOCK_ROADMAPS[role] || MOCK_ROADMAPS["Software Engineer"]);
        },
    },
    interview: {
        start: async (role: Role): Promise<InterviewSession> => {
            return delay({
                id: "int1",
                role,
                step: 1,
                totalSteps: 5,
                messages: [
                    { id: "m1", sender: "bot", text: `Hello! I'm your interviewer for the ${role} position. Let's start with a simple question: Tell me about yourself.`, timestamp: new Date().toISOString() },
                ],
                status: "active",
            });
        },
        answer: async (sessionId: string, answer: string): Promise<Message> => {
            console.log("Answer for session", sessionId, ":", answer);
            return delay({
                id: `m${Date.now()}`,
                sender: "bot",
                text: "That's a great answer. Moving on to the next topic: How do you handle merge conflicts in Git?",
                timestamp: new Date().toISOString(),
            });
        },
    },
    evaluation: {
        get: async (interviewId: string): Promise<Evaluation> => {
            console.log("Get evaluation for", interviewId);
            return delay({
                interviewId,
                overallScore: 85,
                breakdown: {
                    technical: 90,
                    communication: 80,
                    problemSolving: 85,
                    confidence: 85,
                },
                feedback: {
                    strengths: ["Strong technical vocabulary", "Clear articulation", "Good examples"],
                    weaknesses: ["Slight hesitation on system design", "Could provide more quantitative results"],
                    suggestions: ["Practice system design mocks", "Use STAR method more consistently"],
                },
            });
        },
    },
};
