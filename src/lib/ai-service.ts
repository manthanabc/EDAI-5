import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs/promises"
import path from "path"

// @ts-ignore
const pdf = require("pdf-parse")

// Mocked AI Service for ODR Platform
// Now integrated with Gemini API

interface VerdictResult {
    content: string
    reasoning: string
    confidence: number
    passedBiasCheck: boolean
    biasCheckReasoning?: string
    error?: boolean
}


export class AIService {
    private genAI: GoogleGenerativeAI
    private model: any

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || ""
        this.genAI = new GoogleGenerativeAI(apiKey)
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })
    }

    // Simulate RAG - Retrieval Augmented Generation
    private async retrieveContext(caseTitle: string, description: string): Promise<string> {
        let context = ""
        try {
            const guidelinesPath = path.join(process.cwd(), "src/lib/guidelines/standard-rules.md")
            const guidelines = await fs.readFile(guidelinesPath, "utf-8")
            context = `
            Standard Arbitration Rules:
            ${guidelines}
            `
        } catch (error) {
            console.error("Error reading guidelines:", error)
            context = "Standard arbitration rules could not be loaded."
        }
        return context
    }

    // Helper to load evidence files for multimodal input
    private async loadEvidence(documents: any[]): Promise<any[]> {
        const parts: any[] = []
        if (!documents) return parts

        for (const doc of documents) {
            try {
                // Construct local path. doc.url is like "/uploads/123_file.jpg"
                // Remove leading slash to join correctly
                const relativePath = doc.url.startsWith("/") ? doc.url.slice(1) : doc.url
                const localPath = path.join(process.cwd(), "public", relativePath)

                // Check if file exists
                await fs.access(localPath)

                const fileBuffer = await fs.readFile(localPath)
                // Default to image/jpeg if type is missing, but try to use doc.type
                const mimeType = doc.type || "image/jpeg"

                // Only add supported types (images for now, Gemini supports images)
                // We can also support PDF if the model supports it (Gemini 1.5 Pro does, Flash Lite might)
                // For now, let's focus on images as requested.
                if (mimeType.startsWith("image/")) {
                    parts.push({
                        inlineData: {
                            data: fileBuffer.toString("base64"),
                            mimeType: mimeType
                        }
                    })
                }
            } catch (error) {
                console.error(`Error loading evidence ${doc.name}:`, error)
            }
        }
        return parts
    }

    // Helper to extract JSON from text
    private extractJson(text: string): any {
        try {
            // Remove markdown code blocks first
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim()
            return JSON.parse(cleanText)
        } catch (e) {
            // If that fails, try to find the first '{' and last '}'
            const start = text.indexOf('{')
            const end = text.lastIndexOf('}')
            if (start !== -1 && end !== -1) {
                const jsonStr = text.substring(start, end + 1)
                try {
                    return JSON.parse(jsonStr)
                } catch (innerError) {
                    throw e // Throw original error if extraction fails
                }
            }
            throw e
        }
    }

    // Real Large LLM - Verdict Generation
    private async generateVerdict(context: string, caseDetails: any): Promise<{ content: string; reasoning: string; citations: string[]; error?: boolean }> {
        const promptText = `
        You are an AI Arbitrator. Your job is to decide a dispute based on the provided context, case details, and VISUAL EVIDENCE.
        
        Context (Legal Guidelines):
        ${context}

        Case Details:
        Title: ${caseDetails.title}
        
        Normalized Analysis:
        Claimant Arguments: ${JSON.stringify(caseDetails.analysis?.claimantArguments)}
        Respondent Arguments: ${JSON.stringify(caseDetails.analysis?.respondentArguments)}

        Original Description (Claimant): ${caseDetails.description}
        Original Response (Respondent): ${caseDetails.respondentDescription || "No response provided."}
        
        Evidence Files (Metadata):
        ${caseDetails.documents?.map((d: any) => `- ${d.name} (${d.type})`).join("\n") || "No evidence uploaded."}

        Task:
        1. Analyze the case based on the guidelines and the normalized arguments.
        2. EXAMINE THE PROVIDED IMAGES (if any) as evidence. They are attached to this request.
        3. Provide a clear verdict (In favor of Claimant or Respondent).
        4. Provide a detailed reasoning.
        5. Cite specific rules from the guidelines that support your decision.

        Output Format (JSON):
        {
            "content": "Verdict statement...",
            "reasoning": "Detailed reasoning...",
            "citations": ["Rule 1.1: Fairness", "Rule 2.2: Performance"]
        }
        `

        try {
            // Load evidence images
            const evidenceParts = await this.loadEvidence(caseDetails.documents)

            // Construct multimodal request
            const parts = [
                { text: promptText },
                ...evidenceParts
            ]

            const result = await this.model.generateContent(parts)
            const response = result.response
            const text = response.text()

            try {
                return this.extractJson(text)
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError)
                console.log("Raw Text:", text)

                // Check for refusal
                if (text.toLowerCase().includes("unable to") || text.toLowerCase().includes("i cannot")) {
                    return {
                        content: "Verdict: AI Refusal",
                        reasoning: "The AI model refused to process this case, likely due to safety filters or content policy restrictions regarding the evidence provided.",
                        citations: [],
                        error: true
                    }
                }

                return {
                    content: "Verdict: Parsing Error",
                    reasoning: "The AI generated a response that could not be parsed. Please try again.",
                    citations: [],
                    error: true
                }
            }
        } catch (error) {
            console.error("Gemini API Error (Verdict):", error)
            // Fallback to mock if API fails
            return {
                content: "Verdict: Unable to generate at this time.",
                reasoning: "AI Service is currently unavailable.",
                citations: [],
                error: true
            }
        }
    }

    // Real Small LLM - Bias/Fallacy Check
    private async checkBias(verdict: string, reasoning: string): Promise<{ passed: boolean; reasoning: string }> {
        const prompt = `
        You are an AI Bias Auditor. Check the following verdict and reasoning for logical fallacies or bias.

        Verdict: ${verdict}
        Reasoning: ${reasoning}

        Task:
        1. Identify any logical fallacies (e.g., ad hominem, straw man).
        2. Check for bias against any party.
        3. Determine if the verdict is sound based on the reasoning provided.

        Output Format (JSON):
        {
            "passed": boolean,
            "reasoning": "Explanation of the check..."
        }
        `

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response
            const text = response.text()
            // Clean up markdown code blocks if present
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim()

            return JSON.parse(cleanText)
        } catch (error) {
            console.error("Gemini API Error (Bias Check):", error)
            return {
                passed: true,
                reasoning: "Bias check skipped due to service unavailability."
            }
        }
    }

    // Normalization Layer - Rephrase and Structure Arguments
    public async normalizeClaims(caseData: any): Promise<{ claimantArguments: any[]; respondentArguments: any[] }> {
        const promptText = `
        You are an AI Case Analyst. Your job is to read the raw descriptions from both the Claimant and the Respondent and normalize them into structured arguments.
        
        You also have access to VISUAL EVIDENCE (images) attached to this request.

        Case Title: ${caseData.title}
        
        Claimant's Description:
        ${caseData.description}

        Respondent's Response:
        ${caseData.respondentDescription || "No response provided."}

        Evidence Files (Metadata):
        ${caseData.documents?.map((d: any) => `- ${d.name} (${d.type})`).join("\n") || "No evidence uploaded."}

        Task:
        1. Extract distinct arguments/claims made by the Claimant.
        2. Extract distinct arguments/counter-claims made by the Respondent.
        3. For each argument, identify if there is any supporting evidence mentioned or uploaded.
        4. IF YOU SEE EVIDENCE IN THE IMAGES, describe it briefly in the 'evidence' field.
        5. Rephrase everything into clear, professional language.

        Output Format (JSON):
        {
            "claimantArguments": [
                { "claim": "Claim statement...", "evidence": "Reference to evidence or 'None'" }
            ],
            "respondentArguments": [
                { "claim": "Counter-claim statement...", "evidence": "Reference to evidence or 'None'" }
            ]
        }
        `

        try {
            // Load evidence images
            const evidenceParts = await this.loadEvidence(caseData.documents)

            // Construct multimodal request
            const parts = [
                { text: promptText },
                ...evidenceParts
            ]

            const result = await this.model.generateContent(parts)
            const response = result.response
            const text = response.text()
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim()
            return JSON.parse(cleanText)
        } catch (error) {
            console.error("Gemini API Error (Normalization):", error)
            return { claimantArguments: [], respondentArguments: [] }
        }
    }

    // Main Orchestrator
    public async adjudicateCase(caseData: any): Promise<VerdictResult & { citations: string[]; analysis: any }> {
        // 1. Normalize Claims
        const analysis = await this.normalizeClaims(caseData)

        // 2. Retrieve Context (Guidelines)
        const context = await this.retrieveContext(caseData.title, caseData.description)

        // 3. Generate Verdict (using Normalized Analysis)
        const initialVerdict = await this.generateVerdict(context, { ...caseData, analysis })

        // 4. Bias Check
        const biasCheck = await this.checkBias(initialVerdict.content, initialVerdict.reasoning)

        return {
            content: initialVerdict.content,
            reasoning: initialVerdict.reasoning,
            confidence: 0.9,
            passedBiasCheck: biasCheck.passed,
            biasCheckReasoning: biasCheck.reasoning,
            citations: initialVerdict.citations || [],
            analysis: analysis
        }
    }
}

export const aiService = new AIService()
