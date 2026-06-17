const { GoogleGenAI } = require("@google/genai")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert technical interviewer. Analyze the candidate profile and job description below, then return ONLY a valid JSON object with no extra text, no markdown, no code blocks.

Job Description:
${jobDescription}

Candidate Resume/Experience:
${resume || "Not provided"}

Candidate Self Description:
${selfDescription || "Not provided"}

Return ONLY this exact JSON structure:
{
  "matchScore": <integer 0-100>,
  "title": "<job title from job description>",
  "technicalQuestions": [
    { "question": "<question>", "intention": "<why asked>", "answer": "<how to answer>" }
  ],
  "behavioralQuestions": [
    { "question": "<question>", "intention": "<why asked>", "answer": "<how to answer>" }
  ],
  "skillGaps": [
    { "skill": "<skill name>", "severity": "<low or medium or high>" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "<focus area>", "tasks": ["<task>", "<task>"] }
  ]
}

Requirements:
- technicalQuestions: at least 5 items
- behavioralQuestions: at least 3 items
- skillGaps: list all gaps, severity must be exactly "low", "medium", or "high"
- preparationPlan: 7 days, day field must be an integer (1, 2, 3...)
- Return ONLY the JSON object, nothing else`

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
