"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Bot } from "lucide-react"

interface Verdict {
    id: string
    content: string
    reasoning: string | null
    aiConfidence: number | null
    isHuman: boolean
    createdAt: Date
}

interface AIJudgePanelProps {
    caseId: string
    verdicts: Verdict[]
    status: string
    mode?: "RESPONDENT" | "ARBITRATOR" | "VIEW"
}

export function AIJudgePanel({ caseId, verdicts, status, mode = "VIEW" }: AIJudgePanelProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [description, setDescription] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const router = useRouter()

    const handleGenerateVerdict = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/cases/${caseId}/verdict`, {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Failed to generate verdict")
            }

            toast.success("AI Verdict generated")
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitResponse = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            let documents = []
            if (file) {
                const formData = new FormData()
                formData.append("file", file)
                const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
                if (!uploadRes.ok) throw new Error("Upload failed")
                const upload = await uploadRes.json()
                documents.push({ url: upload.url, name: upload.name })
            }

            const res = await fetch(`/api/cases/${caseId}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, documents }),
            })

            if (!res.ok) throw new Error("Failed to submit response")

            toast.success("Response submitted successfully")
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    if (mode === "RESPONDENT") {
        return (
            <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Your Defense / Response</label>
                    <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Explain your side of the story..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Evidence (Optional)</label>
                    <input
                        type="file"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Response"
                    )}
                </Button>
            </form>
        )
    }

    if (mode === "ARBITRATOR") {
        return (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <Bot className="h-12 w-12 text-primary/80" />
                <div className="text-center">
                    <h3 className="text-lg font-medium">Ready to Adjudicate?</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                        Generate an AI verdict based on the claims, response, and evidence provided.
                    </p>
                </div>
                <Button onClick={handleGenerateVerdict} disabled={isLoading} size="lg">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Case...
                        </>
                    ) : (
                        "Generate AI Verdict"
                    )}
                </Button>
            </div>
        )
    }

    // Default View (just showing status or nothing if handled by page)
    return null
}
