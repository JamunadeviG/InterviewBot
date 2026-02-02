import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let text = '';
        const buffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        if (mimeType === 'application/pdf') {
            const data = await pdfParse(buffer);
            text = data.text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: buffer });
            text = result.value;
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload PDF or DOCX.' });
        }

        const cleanedText = text.replace(/\s+/g, ' ').trim();

        if (cleanedText.length < 50) {
            return res.status(422).json({ error: 'The document appears to be empty or unreadable. Please upload a clear text-based RESUME.' });
        }

        res.json({ text: cleanedText });

    } catch (error) {
        console.error('Error parsing resume:', error);
        res.status(500).json({ error: 'Failed to parsing resume' });
    }
});

app.post('/api/generate-questions', async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        const prompt = `
      Analyze the following resume text. 
      Identify the candidate's core skills, experience level (Junior, Mid, Senior), and main job role.
      Then, generate 5 technical interview questions tailored to their skills and experience, and 1 behavioral question.
      
      Resume Text:
      "${resumeText.substring(0, 15000)}" 
      
      Return the output as a valid JSON object with the following schema:
      {
        "candidateProfile": {
           "role": "string",
           "experienceLevel": "string",
           "skills": ["string"]
        },
        "questions": [
           {
             "id": number,
             "question": "string",
             "type": "Technical" | "Behavioral",
             "difficulty": "Easy" | "Medium" | "Hard",
             "topic": "string"
           }
        ]
      }
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are an expert technical interviewer." }, { role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error("Empty response from OpenAI");
        }

        const data = JSON.parse(content);
        // basic validation could go here

        res.json(data);

    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions. Please ensure your OpenAI API Key is valid.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
