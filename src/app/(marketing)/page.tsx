import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Scale, ShieldCheck, Zap } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col">
            <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                    <Link
                        href="/about"
                        className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
                        target="_blank"
                    >
                        Introducing the Future of Arbitration
                    </Link>
                    <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                        Fair, Fast, and AI-Powered Dispute Resolution
                    </h1>
                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        Resolve disputes in days, not months. Our platform combines advanced AI analysis with human oversight to deliver legally binding verdicts at a fraction of the cost.
                    </p>
                    <div className="space-x-4">
                        <Link href="/register">
                            <Button size="lg" className="h-11 px-8">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="outline" size="lg" className="h-11 px-8">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section id="features" className="container space-y-6 bg-slate-50 dark:bg-slate-950 py-8 md:py-12 lg:py-24">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                        Features
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Built for modern businesses and individuals who value time and fairness.
                    </p>
                </div>
                <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                        <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                            <Zap className="h-12 w-12 text-indigo-500" />
                            <div className="space-y-2">
                                <h3 className="font-bold">Instant AI Analysis</h3>
                                <p className="text-sm text-muted-foreground">
                                    Get a preliminary verdict in seconds using our advanced legal LLMs.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                        <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                            <ShieldCheck className="h-12 w-12 text-green-500" />
                            <div className="space-y-2">
                                <h3 className="font-bold">Secure & Private</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your evidence and case details are encrypted and accessible only to parties involved.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                        <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                            <Scale className="h-12 w-12 text-blue-500" />
                            <div className="space-y-2">
                                <h3 className="font-bold">Human Oversight</h3>
                                <p className="text-sm text-muted-foreground">
                                    Complex cases are escalated to certified arbitrators for final review.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="container py-8 md:py-12 lg:py-24">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                    <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                        How It Works
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        A simple, transparent process designed to get you results.
                    </p>
                </div>
                <div className="mx-auto grid justify-center gap-8 sm:grid-cols-3 md:max-w-[64rem] pt-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-2xl font-bold text-indigo-600 dark:text-indigo-400">1</div>
                        <h3 className="text-xl font-bold">File a Dispute</h3>
                        <p className="text-muted-foreground">Submit your claim and upload evidence in minutes.</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</div>
                        <h3 className="text-xl font-bold">Respondent Replies</h3>
                        <p className="text-muted-foreground">The other party is notified and submits their defense.</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-2xl font-bold text-indigo-600 dark:text-indigo-400">3</div>
                        <h3 className="text-xl font-bold">Get a Verdict</h3>
                        <p className="text-muted-foreground">Receive an AI-generated or human-reviewed decision.</p>
                    </div>
                </div>
            </section>

            <section className="container py-8 md:py-12 lg:py-24 bg-indigo-50 dark:bg-indigo-950/20 rounded-3xl my-8">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                    <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
                        Ready to resolve your dispute?
                    </h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Join thousands of users who trust our platform for fair and fast arbitration.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="mt-4">
                            Start a Case Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
