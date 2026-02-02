import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mammoth from 'mammoth';
import OpenAI from 'openai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const runOcr = (filePath) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [path.join(__dirname, 'ocr_engine.py'), filePath]);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error("OCR stderr:", errorOutput);
                reject(new Error(`OCR process exited with code ${code}`));
                return;
            }
            try {
                const result = JSON.parse(output);
                if (result.error) {
                    reject(new Error(result.error));
                } else {
                    resolve(result.text);
                }
            } catch (err) {
                console.error("OCR raw output:", output);
                reject(new Error("Failed to parse OCR output"));
            }
        });
    });
};

app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let text = '';
        const buffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Stage 1: Direct Extraction
        console.log(`[Stage 1] Attempting direct extraction for mimeType: ${mimeType}`);
        try {
            if (mimeType === 'application/pdf') {
                const data = await pdfParse(buffer);
                text = data.text;
                console.log(`[Stage 1] pdf-parse extracted ${text?.length || 0} characters.`);
            } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ buffer: buffer });
                text = result.value;
                console.log(`[Stage 1] mammoth extracted ${text?.length || 0} characters.`);
            } else {
                return res.status(400).json({ error: 'Unsupported file type. Please upload PDF or DOCX.' });
            }
        } catch (extractErr) {
            console.warn("[Stage 1] Direct extraction failed:", extractErr.message);
        }

        let cleanedText = text ? text.replace(/\s+/g, ' ').trim() : '';
        const isLowQuality = cleanedText.length < 50;

        // Stage 2: OCR Fallback
        if (isLowQuality && mimeType === 'application/pdf') {
            console.log("[Stage 2] Text is empty or low quality (< 50 chars). Falling back to PaddleOCR...");

            const tempFilePath = path.join(tempDir, `resume_${Date.now()}.pdf`);
            fs.writeFileSync(tempFilePath, buffer);

            try {
                const ocrText = await runOcr(tempFilePath);
                cleanedText = ocrText.replace(/\s+/g, ' ').trim();
                console.log(`[Stage 2] OCR extracted ${cleanedText.length} characters.`);
            } catch (ocrErr) {
                console.error("[Stage 2] OCR fallback failed:", ocrErr.message);
            } finally {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            }
        } else if (isLowQuality) {
            console.log(`[Stage 1] Direct extraction returned low quality text for non-PDF format. Skipping OCR.`);
        } else {
            console.log(`[Stage 1] Direct extraction was successful (${cleanedText.length} chars). Skipping OCR.`);
        }

        if (cleanedText.length < 50) {
            return res.status(422).json({ error: 'The document appears to be empty or unreadable even after OCR. Please upload a clearer PDF.' });
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

        res.json(data);

    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions. Please ensure your OpenAI API Key is valid.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
