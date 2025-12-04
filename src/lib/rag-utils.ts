import fs from "fs/promises"
import path from "path"

export interface RAGContext {
    text: string
    source: string
}

export class RAGService {
    private static instance: RAGService
    private pdfCache: string | null = null

    private constructor() { }

    public static getInstance(): RAGService {
        if (!RAGService.instance) {
            RAGService.instance = new RAGService()
        }
        return RAGService.instance
    }

    private async loadPDF(): Promise<string> {
        if (this.pdfCache) return this.pdfCache

        try {
            const pdfPath = path.join(process.cwd(), "guides", "Designing-The-Future-of-Dispute-Resolution-The-ODR-Policy-Plan-for-India.pdf")
            const dataBuffer = await fs.readFile(pdfPath)

            // Dynamic import to avoid build-time issues with canvas/dom dependencies
            const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")



            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(dataBuffer),
                useSystemFonts: true,
                disableFontFace: true
            })

            const pdfDocument = await loadingTask.promise

            let fullText = ""
            // Limit to first 20 pages to avoid memory issues and keep context relevant
            const maxPages = Math.min(pdfDocument.numPages, 20)

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdfDocument.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items
                    // @ts-ignore
                    .map(item => item.str)
                    .join(" ")
                fullText += pageText + "\n"
            }

            this.pdfCache = fullText
            return fullText
        } catch (error) {
            console.error("Error loading PDF guide:", error)
            return ""
        }
    }

    public async retrieveContext(query: string): Promise<string> {
        const fullText = await this.loadPDF()
        if (!fullText) return ""

        // Simple keyword-based chunking and retrieval
        const paragraphs = fullText.split(/\n\s*\n/)
        const queryTerms = query.toLowerCase().split(" ").filter(t => t.length > 3)

        const scoredParagraphs = paragraphs.map(para => {
            let score = 0
            const lowerPara = para.toLowerCase()
            for (const term of queryTerms) {
                if (lowerPara.includes(term)) {
                    score += 1
                }
            }
            return { text: para, score }
        })

        // Sort by score and take top 5
        scoredParagraphs.sort((a, b) => b.score - a.score)
        const topParagraphs = scoredParagraphs.slice(0, 5).filter(p => p.score > 0)

        if (topParagraphs.length === 0) {
            // Fallback: return first few paragraphs if no matches (introductory context)
            return paragraphs.slice(0, 3).join("\n\n")
        }

        return topParagraphs.map(p => p.text).join("\n\n")
    }
}

export const ragService = RAGService.getInstance()
