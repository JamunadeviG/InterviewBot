const API_URL = 'http://localhost:5000/api';
const AUTH_URL = 'http://localhost:5001/api';

export interface Question {
    id: number;
    question: string;
    type: 'Technical' | 'Behavioral';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
}

export interface InterviewData {
    candidateProfile: {
        role: string;
        experienceLevel: string;
        skills: string[];
    };
    questions: Question[];
}

export const api = {
    // --- Auth Methods (Flask + MongoDB) ---
    login: async (credentials: any) => {
        const response = await fetch(`${AUTH_URL}/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gmail: credentials.email, // Map frontend 'email' to backend 'gmail'
                password: credentials.password
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data;
    },

    signup: async (userData: any) => {
        const response = await fetch(`${AUTH_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: userData.name,
                gmail: userData.email, // Map frontend 'email' to backend 'gmail'
                password: userData.password,
                role: userData.role
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData) || 'Signup failed');
        }
        return response.json();
    },

    getProfile: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${AUTH_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Unauthorized');
        return response.json();
    },

    // --- Interview Methods (Node) ---
    uploadResume: async (file: File): Promise<{ text: string }> => {
        const formData = new FormData();
        formData.append('resume', file);
        const response = await fetch(`${API_URL}/upload-resume`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Upload failed');
        }
        return response.json();
    },

    generateQuestions: async (resumeText: string): Promise<InterviewData> => {
        const response = await fetch(`${API_URL}/generate-questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Generation failed');
        }
        return response.json();
    },

    evaluateAnswer: async (question: string, skill: string, answer: string): Promise<any> => {
        const response = await fetch(`${API_URL}/evaluate-answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question,
                skill_tested: skill,
                candidate_answer: answer
            }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Evaluation failed');
        }
        return response.json();
    },

    generateReport: async (data: any): Promise<any> => {
        const response = await fetch(`${API_URL}/generate-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Report generation failed');
        }
        return response.json();
    }
};
