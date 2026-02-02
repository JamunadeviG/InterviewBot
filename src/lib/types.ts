export type Role = "Software Engineer" | "Data Scientist" | "ML Engineer";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export type ResourceType = "video" | "documentation" | "course" | "article";

export interface Resource {
    id: string;
    title: string;
    url: string;
    type: ResourceType;
}

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: string;
    resources: Resource[];
    completedResources: string[];
}

export interface Section {
    title: string;
    items: RoadmapItem[];
}

export interface Roadmap {
    role: Role;
    sections: Section[];
}

export interface ProgressData {
    [role: string]: Roadmap;
}

export interface AnalyticsEvent {
    id: string;
    userId: string;
    action: string;
    data: any;
    timestamp: string;
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
