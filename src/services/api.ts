const API_URL = 'http://localhost:5000/api';

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
    }
};
