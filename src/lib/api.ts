import type {
  Evaluation,
  InterviewSession,
  Message,
  Roadmap,
  Role,
  User,
} from "./types";

const API_BASE = "http://localhost:3000/api";

// Helper to get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ---------------- Predefined Study Topics (MASTER DATA) ----------------
const DEFAULT_ROADMAPS: Record<Role, Roadmap> = {
  "Software Engineer": {
    role: "Software Engineer",
    sections: [
      {
        title: "Web Fundamentals",
        items: [
          {
            id: "html",
            title: "HTML & CSS",
            description: "Learn structure and styling of web pages",
            status: "not-started",
            resources: [
              { id: "html1", title: "HTML Crash Course - Traversy", url: "https://www.youtube.com/watch?v=UB1O30fR-EE", type: "video" },
              { id: "html2", title: "MDN HTML Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", type: "documentation" },
            ],
            completedResources: [],
          },
          {
            id: "js",
            title: "JavaScript",
            description: "Core JS concepts",
            status: "not-started",
            resources: [
              { id: "js1", title: "JS Full Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", type: "video" },
              { id: "js2", title: "JavaScript.info", url: "https://javascript.info", type: "documentation" },
            ],
            completedResources: [],
          },
        ],
      },
      {
        title: "Backend Fundamentals",
        items: [
          {
            id: "node",
            title: "Node.js & Express",
            description: "Learn server-side JavaScript",
            status: "not-started",
            resources: [
              { id: "node1", title: "Node.js Crash Course - Traversy", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", type: "video" },
              { id: "node2", title: "Express Docs", url: "https://expressjs.com/en/starter/installing.html", type: "documentation" },
            ],
            completedResources: [],
          },
        ],
      },
    ],
  },

  "Data Scientist": {
    role: "Data Scientist",
    sections: [
      {
        title: "Python & Data Analysis",
        items: [
          {
            id: "python",
            title: "Python Programming",
            description: "Learn Python for data analysis",
            status: "not-started",
            resources: [
              { id: "py1", title: "Python Full Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", type: "video" },
              { id: "py2", title: "Python Docs", url: "https://docs.python.org/3/", type: "documentation" },
            ],
            completedResources: [],
          },
          {
            id: "pandas",
            title: "Pandas & NumPy",
            description: "Data manipulation and analysis",
            status: "not-started",
            resources: [
              { id: "pd1", title: "Pandas Tutorial - freeCodeCamp", url: "https://www.youtube.com/watch?v=vmEHCJofslg", type: "video" },
              { id: "pd2", title: "NumPy Docs", url: "https://numpy.org/doc/", type: "documentation" },
            ],
            completedResources: [],
          },
        ],
      },
    ],
  },

  "ML Engineer": {
    role: "ML Engineer",
    sections: [
      {
        title: "Machine Learning Basics",
        items: [
          {
            id: "ml1",
            title: "ML Fundamentals",
            description: "Introduction to Machine Learning concepts",
            status: "not-started",
            resources: [
              { id: "mlvid1", title: "ML Crash Course - Google", url: "https://developers.google.com/machine-learning/crash-course", type: "video" },
              { id: "mldoc1", title: "Scikit-Learn Docs", url: "https://scikit-learn.org/stable/documentation.html", type: "documentation" },
            ],
            completedResources: [],
          },
          {
            id: "dl1",
            title: "Deep Learning Basics",
            description: "Learn neural networks and deep learning",
            status: "not-started",
            resources: [
              { id: "dlvid1", title: "Deep Learning - Coursera", url: "https://www.coursera.org/specializations/deep-learning", type: "video" },
              { id: "dldoc1", title: "TensorFlow Docs", url: "https://www.tensorflow.org/learn", type: "documentation" },
            ],
            completedResources: [],
          },
        ],
      },
    ],
  },
};

// ---------------- Merge Helper ----------------
// Merges minimal backend progress ({ topicId, completedResources[] }) 
// into the full static DEFAULT_ROADMAPS structure.
function mergeProgressWithDefaults(
  defaults: Roadmap["sections"],
  userTopics: { topicId: string; completedResources: string[] }[]
): Roadmap["sections"] {
  if (!Array.isArray(userTopics)) return defaults;

  return defaults.map(section => ({
    ...section,
    items: section.items.map(item => {
      // Find the user's progress for this specific topic
      const userTopic = userTopics.find(t => t.topicId === item.id);
      const completedResources = userTopic ? userTopic.completedResources : [];

      // Determine status based on local merge
      const status =
        completedResources.length === 0
          ? "not-started"
          : completedResources.length >= item.resources.length
            ? "completed"
            : "in-progress";

      return {
        ...item,
        completedResources,
        status,
      };
    }),
  }));
}

// ---------------- API ----------------
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Login failed");
      const data = await res.json();
      const user: User = { id: data.user.id || data.user._id, name: data.user.name, email: data.user.email, role: data.user.role };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      return { user, token: data.token };
    },

    signup: async (data: { name: string; email: string; password: string; role: Role }) => {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Signup failed");
      const responseData = await res.json();
      const user: User = { id: responseData.user.id || responseData.user._id, name: responseData.user.name, email: responseData.user.email, role: responseData.user.role };
      localStorage.setItem("token", responseData.token);
      localStorage.setItem("user", JSON.stringify(user));
      return { user, token: responseData.token };
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    getCurrentUser: (): User | null => {
      const userStr = localStorage.getItem("user");
      if (!userStr || userStr === "undefined") return null;
      try { return JSON.parse(userStr); }
      catch { localStorage.removeItem("user"); localStorage.removeItem("token"); return null; }
    },
  },

  roadmap: {
    getRoles: async (): Promise<Role[]> => {
      return Object.keys(DEFAULT_ROADMAPS) as Role[];
    },

    getRoadmap: async (role: Role): Promise<Roadmap> => {
      return DEFAULT_ROADMAPS[role];
    },

    // Fetches minimal progress and merges it with static roadmap
    getProgress: async (role: Role): Promise<Roadmap["sections"]> => {
      try {
        console.log(`[API] Fetching progress for role: ${role}`);
        const res = await fetch(`${API_BASE}/progress/${encodeURIComponent(role)}`, { headers: getAuthHeaders() });

        if (!res.ok) {
          // If 401/403, might need login, but we can fail gracefully or throw
          if (res.status === 401) throw new Error("Authentication required");
          const txt = await res.text();
          console.error(`[API] Fetch failed: ${res.status} ${txt}`);
          throw new Error("Failed to fetch progress");
        }

        const userTopics = await res.json(); // EXPECT ARRAY: [{ topicId, completedResources: [] }]
        console.log(`[API] Fetched ${userTopics.length} topics from backend`);

        // MERGE LOGIC
        return mergeProgressWithDefaults(DEFAULT_ROADMAPS[role].sections, userTopics);

      } catch (error) {
        console.warn("Could not fetch progress from backend (offline? new user?), showing default.", error);
        // Fallback: return default roadmap with 0 progress
        return DEFAULT_ROADMAPS[role].sections;
      }
    },

    // Updates a SINGLE topic's progress
    saveTopicProgress: async (role: Role, topicId: string, completedResources: string[]) => {
      const res = await fetch(`${API_BASE}/progress/${encodeURIComponent(role)}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ topicId, completedResources }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Failed to save progress:", errText);
        throw new Error(errText || "Failed to save progress");
      }
    },

    // Legacy support or analytics
    logAnalytics: async (userId: string, action: string, data?: any) => {
      await fetch(`${API_BASE}/analytics`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, action, data }),
      });
    },
  },

  interview: {
    start: async (role: Role): Promise<InterviewSession> => ({
      id: "int1",
      role,
      step: 1,
      totalSteps: 5,
      messages: [{ id: "m1", sender: "bot", text: `Hello! Let's start the ${role} interview.`, timestamp: new Date().toISOString() }],
      status: "active",
    }),

    answer: async (): Promise<Message> => ({
      id: `m${Date.now()}`,
      sender: "bot",
      text: "Next question: How do you handle merge conflicts in Git?",
      timestamp: new Date().toISOString(),
    }),
  },

  evaluation: {
    get: async (interviewId: string): Promise<Evaluation> => ({
      interviewId,
      overallScore: 85,
      breakdown: { technical: 90, communication: 80, problemSolving: 85, confidence: 85 },
      feedback: {
        strengths: ["Strong technical vocabulary"],
        weaknesses: ["Could improve system design"],
        suggestions: ["Practice system design mocks"],
      },
    }),
  },
};

// ---------------- Backward compatible exports ----------------
export const getRoles = api.roadmap.getRoles;
export const getRoadmap = api.roadmap.getRoadmap;
export const getProgress = api.roadmap.getProgress;
export const saveTopicProgress = api.roadmap.saveTopicProgress; // New Export
export const logAnalytics = api.roadmap.logAnalytics;
