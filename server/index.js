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
                if (!output.trim()) {
                    reject(new Error("OCR output is empty"));
                    return;
                }
                const result = JSON.parse(output);
                if (result.error) {
                    reject(new Error(result.error));
                } else {
                    resolve(result.text || "");
                }
            } catch (err) {
                console.error("OCR raw output:", output);
                reject(new Error(`Failed to parse OCR output: ${err.message}`));
            }
        });

        pythonProcess.on('error', (err) => {
            console.error("Failed to start OCR process:", err);
            reject(new Error(`Failed to start OCR process: ${err.message}`));
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
            console.log(`[Validation] Final text length too short (${cleanedText.length}). Returning 422.`);
            return res.status(422).json({ error: 'The document appears to be empty or unreadable even after OCR. Please upload a clearer PDF.' });
        }

        console.log(`[Success] Resume parsed successfully (${cleanedText.length} chars).`);
        res.json({ text: cleanedText });

    } catch (error) {
        console.error('CRITICAL Error parsing resume:', error);
        res.status(500).json({ error: `Failed to parse resume: ${error.message}` });
    }
});

app.post('/api/generate-questions', async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        console.log("[AI] Starting multi-stage analysis...");

        // Stage 1: Extraction
        const extractionPrompt = `
      Extract the following information from the resume text provided:
      - Core Skills (as a list)
      - Key Projects (summary of main projects)
      - Experience Level (Junior, Mid, Senior)
      - Total Years of Experience
      - Education (highest degree and university)
      - Job Role (the most suitable role based on the resume)

      Resume Text:
      "${resumeText.substring(0, 15000)}"

      Return the output as a valid JSON object with the following schema:
      {
        "role": "string",
        "experienceLevel": "string",
        "skills": ["string"],
        "projects": "string",
        "experience": "string",
        "education": "string"
      }
    `;

        const extractionResponse = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are an expert resume analyzer." }, { role: "user", content: extractionPrompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const profileData = JSON.parse(extractionResponse.choices[0].message.content);
        console.log("[AI] Profile extracted for role:", profileData.role);

        // Stage 2: Question Generation (Using User's Prompt Template)
        const generationPrompt = `You are an expert technical interviewer conducting a job interview.

Based on the following resume information, generate 5 relevant interview questions:

**Candidate Resume Data:**
- Skills: ${profileData.skills.join(', ')}
- Projects: ${profileData.projects}
- Experience: ${profileData.experience}
- Education: ${profileData.education}

**Instructions:**
1. Generate questions that test both theoretical knowledge and practical application
2. Include at least 2 questions about specific projects mentioned
3. Ask about real-world scenarios related to their skills
4. Mix difficulty levels (2 basic, 2 intermediate, 1 advanced)
5. Make questions open-ended to assess depth of understanding

**Output Format:**
Return a JSON array with this structure:
[
  {
    "question": "Your question here",
    "category": "technical/project/behavioral",
    "difficulty": "basic/intermediate/advanced",
    "skill_tested": "specific skill name"
  }
]

Generate the questions now.`;

        const generationResponse = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are an expert technical interviewer." }, { role: "user", content: generationPrompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        // The user prompt expects an array, but we asked for a json_object from openai.
        // Usually OpenAI wraps the array in an object if forced to json_object, 
        // OR we can just parse it if it returns the array directly (if allowed).
        // To be safe with JSON mode, let's just parse the content.

        let questionsRaw = JSON.parse(generationResponse.choices[0].message.content);

        // Handle case where some models return { "questions": [...] } instead of directly [...]
        if (!Array.isArray(questionsRaw) && questionsRaw.questions) {
            questionsRaw = questionsRaw.questions;
        }

        // Map to frontend schema
        const mappedQuestions = questionsRaw.map((q, index) => ({
            id: index + 1,
            question: q.question,
            type: q.category.charAt(0).toUpperCase() + q.category.slice(1), // technical -> Technical
            difficulty: q.difficulty === 'basic' ? 'Easy' : q.difficulty === 'intermediate' ? 'Medium' : 'Hard',
            topic: q.skill_tested
        }));

        res.json({
            candidateProfile: {
                role: profileData.role,
                experienceLevel: profileData.experienceLevel,
                skills: profileData.skills
            },
            questions: mappedQuestions
        });

    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions. Please ensure your OpenAI API Key is valid.' });
    }
});

app.post('/api/evaluate-answer', async (req, res) => {
    try {
        const { question, skill_tested, candidate_answer } = req.body;

        if (!question || !candidate_answer) {
            return res.status(400).json({ error: 'Question and answer are required' });
        }

        const prompt = `You are an expert interviewer evaluating a candidate's response.

**Question Asked:** ${question}

**Expected Skills/Topics:** ${skill_tested || 'General Technical/Behavioral'}

**Candidate's Answer:** ${candidate_answer}

**Evaluation Criteria:**
Evaluate the answer on these parameters (score each from 0-10):

1. **Technical Accuracy**: Correctness of information and concepts
2. **Depth of Knowledge**: How thoroughly they understand the topic
3. **Communication Clarity**: How well they articulated their answer
4. **Practical Understanding**: Ability to apply knowledge to real scenarios
5. **Completeness**: Whether they addressed all parts of the question

**Output Format:**
Return a JSON object:
{
  "scores": {
    "technical_accuracy": <0-10>,
    "depth_of_knowledge": <0-10>,
    "communication_clarity": <0-10>,
    "practical_understanding": <0-10>,
    "completeness": <0-10>
  },
  "overall_score": <0-100>,
  "strengths": ["list of strengths observed"],
  "areas_for_improvement": ["list of areas to improve"],
  "feedback": "2-3 sentence constructive feedback",
  "follow_up_question": "optional follow-up question if answer was incomplete"
}

Evaluate the answer now.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are an expert technical interviewer." }, { role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(completion.choices[0].message.content);
        res.json(data);

    } catch (error) {
        console.error('Error evaluating answer:', error);
        res.status(500).json({ error: 'Failed to evaluate answer.' });
    }
});

app.post('/api/generate-report', async (req, res) => {
    try {
        const { candidate_name, position, interview_date, skills, experience_level, total_questions, average_scores, questions_list, answers_list, detailed_scores } = req.body;

        const prompt = `You are an expert HR analyst generating a comprehensive interview report.

**Candidate Information:**
- Name: ${candidate_name || 'Candidate'}
- Position Applied: ${position}
- Interview Date: ${interview_date}

**Resume Summary:**
- Skills: ${skills}
- Experience Level: ${experience_level}

**Interview Performance Data:**
- Total Questions: ${total_questions}
- Average Scores: ${average_scores}
- Questions Asked: ${questions_list}
- Answers Given: ${answers_list}
- Individual Scores: ${detailed_scores}

**Task:**
Generate a comprehensive interview report that includes:

1. **Overall Performance Summary** (2-3 paragraphs)
2. **Strength Areas** (top 3-4 strengths with examples)
3. **Areas for Improvement** (3-4 areas with specific recommendations)
4. **Skill-wise Breakdown** (performance on each technical skill)
5. **Recommendation** (Strongly Recommend / Recommend / Consider / Not Recommend)
6. **Hiring Decision Rationale** (2-3 sentences explaining the recommendation)
7. **Next Steps** (suggested follow-up actions)

**Output Format:**
Return a well-structured JSON object:
{
  "overall_summary": "text",
  "overall_rating": <1-10>,
  "strengths": [{ "area": "name", "description": "detail", "example": "specific example" }],
  "improvements": [{ "area": "name", "description": "detail", "suggestion": "how to improve" }],
  "skill_breakdown": [{ "skill": "name", "score": <0-10>, "assessment": "brief assessment" }],
  "recommendation": "Strongly Recommend/Recommend/Consider/Not Recommend",
  "rationale": "explanation",
  "next_steps": ["action 1", "action 2"],
  "interviewer_notes": "any additional observations"
}

Generate the report now.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are an expert HR consultant." }, { role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(completion.choices[0].message.content);
        res.json(data);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
