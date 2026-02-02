export type Role = "Software Engineer" | "Data Analyst" | "ML Engineer";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
    category: string;
}

export interface Roadmap {
    role: Role;
    sections: {
        title: string;
        items: RoadmapItem[];
    }[];
}

export interface Message {
    id: string;
    sender: "user" | "bot";
    text: string;
    timestamp: string;
}

export interface InterviewSession {
    id: string;
    role: Role;
    step: number;
    totalSteps: number;
    messages: Message[];
    status: "active" | "completed";
}

export interface Evaluation {
    interviewId: string;
    overallScore: number;
    breakdown: {
        technical: number;
        communication: number;
        problemSolving: number;
        confidence: number;
    };
    feedback: {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
    };
}
