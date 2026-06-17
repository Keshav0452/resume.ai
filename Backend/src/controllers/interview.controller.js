const { PDFParse } = require('pdf-parse');

async function parsePdf(buffer) {
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    return result
}
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body

        let resumeText = ""

        if (req.file) {
            const parsed = await parsePdf(req.file.buffer)
            resumeText = parsed.text || parsed
        }

        if (!resumeText && !selfDescription) {
            return res.status(400).json({ message: "Please provide a resume or self description" })
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        console.log("AI RAW RESPONSE:", JSON.stringify(interviewReportByAi, null, 2))

        // Gemini sometimes returns array items as JSON strings — parse and normalize
        const parseArray = (arr) => {
            if (!Array.isArray(arr)) return []
            return arr.map(item => {
                if (typeof item === 'string') {
                    try { return JSON.parse(item) } catch { return null }
                }
                return item
            }).filter(Boolean)
        }

        const technicalQuestions = parseArray(interviewReportByAi.technicalQuestions)
            .map(({ question, intention, answer }) => ({ question, intention, answer }))

        const behavioralQuestions = parseArray(interviewReportByAi.behavioralQuestions)
            .map(({ question, intention, answer }) => ({ question, intention, answer }))

        const skillGaps = parseArray(interviewReportByAi.skillGaps)
            .map(({ skill, severity }) => ({
                skill,
                severity: (severity || "low").toLowerCase()
            }))
            .filter(({ severity }) => ["low", "medium", "high"].includes(severity))

        const preparationPlan = parseArray(interviewReportByAi.preparationPlan)
            .map((item, index) => ({
                day: typeof item.day === 'number' ? item.day : index + 1,
                focus: item.focus || "",
                tasks: Array.isArray(item.tasks) ? item.tasks : []
            }))

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            matchScore: interviewReportByAi.matchScore,
            title: interviewReportByAi.title || "Untitled Position",
            technicalQuestions,
            behavioralQuestions,
            skillGaps,
            preparationPlan,
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.log("generateInterViewReportController error:", error)
        res.status(500).json({ message: "Failed to generate interview report", error: error.message })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to fetch interview report" })
    }
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to fetch interview reports" })
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to generate resume PDF" })
    }
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }
