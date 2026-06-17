const { GoogleGenAI } = require("@google/genai")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are a critical, elite technical recruiter and hiring manager. Your task is to perform an honest, objective, and rigorous comparison of the candidate's credentials against the job description. Do NOT be overly generous. If the candidate is not qualified, the match score must reflect that.

Job Description:
${jobDescription}

Candidate Resume/Experience:
${resume || "Not provided"}

Candidate Self Description:
${selfDescription || "Not provided"}

MATCH SCORE GRADING RUBRIC:
- 90-100: Perfect match. Meets all core, required, and preferred requirements with relevant years of experience.
- 75-89: Strong match. Meets all absolute core requirements, but lacks some secondary/preferred qualifications or minor tools.
- 50-74: Moderate match. Meets some of the core requirements (e.g., has the right language/framework, but lacks required seniority, experience depth, or adjacent tech stack).
- 20-49: Weak match. Candidate has general tech skills but lacks the main programming languages, frameworks, or experience required for this specific role.
- 0-19: Completely unqualified. No relevant experience or skills matching the job description.
*Note: If the candidate profile/resume is "Not provided" or empty, and only a brief self-description of a few words is given, critically penalize the score.*

Return ONLY this exact JSON structure:
{
  "matchScore": <integer 0-100 based on the rubric>,
  "title": "<job title from job description>",
  "technicalQuestions": [
    { 
      "question": "<tough, role-specific scenario or problem-solving question addressing core requirements or candidate gaps>", 
      "intention": "<what specific engineering capability or problem-solving skill the interviewer is evaluating>", 
      "answer": "<a comprehensive, structured, expert-level model response>" 
    }
  ],
  "behavioralQuestions": [
    { 
      "question": "<scenario-based behavioral question testing team collaboration, conflict resolution, or leadership tailored to this seniority level>", 
      "intention": "<what soft skill or cultural alignment indicator is being measured>", 
      "answer": "<STAR method structure outline showing a model response>" 
    }
  ],
  "skillGaps": [
    { 
      "skill": "<specific missing tech tool, language, or concept explicitly listed in the job description but missing or weak in candidate's profile>", 
      "severity": "<low or medium or high - high for core tech stack, low for preferred/optional tools>" 
    }
  ],
  "preparationPlan": [
    { 
      "day": 1, 
      "focus": "<highly specific focus area directly addressing the identified skill gaps>", 
      "tasks": [
        "<concrete, actionable task, e.g., 'Build a small project implementing custom React hooks'", 
        "<concrete task, e.g., 'Read documentation on database normalization patterns'>"
      ] 
    }
  ]
}

Requirements:
- technicalQuestions: at least 5 items, non-generic (avoid simple 'what is X?' questions).
- behavioralQuestions: at least 3 items.
- skillGaps: list all gaps, comparing job requirements word-for-word against the candidate's credentials.
- preparationPlan: exactly 7 days, day field must be an integer (1, 2, 3...).
- Return ONLY the JSON object, nothing else.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    })

    const text = response.text.trim()
    return JSON.parse(text)
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate a professional resume in HTML format for the candidate below. Return ONLY a valid JSON object with a single "html" field containing the complete HTML.

Candidate Resume/Experience: ${resume}
Self Description: ${selfDescription}
Target Job Description: ${jobDescription}

Requirements for the HTML resume:
- Tailored to the job description
- ATS friendly
- Professional and clean design
- 1-2 pages when printed
- Not AI-sounding content

Return ONLY: { "html": "<complete html here>" }`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    })

    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }
