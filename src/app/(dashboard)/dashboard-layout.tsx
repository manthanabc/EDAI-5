"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Gavel, LogOut, PlusCircle } from "lucide-react"

export default function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { data: session } = useSession()

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            color: "text-sky-500",
        },
        {
            label: "New Dispute",
            icon: PlusCircle,
            href: "/cases/new",
            color: "text-violet-500",
            role: "PARTY",
        },
        {
            label: "Admin Panel",
            icon: Gavel,
            href: "/admin",
            color: "text-orange-700",
            role: "ADMIN",
        },
    ]

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <div className="space-y-4 py-4 flex flex-col h-full text-white">
                    <div className="px-3 py-2 flex-1">
                        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                            <h1 className="text-2xl font-bold">ODR Platform</h1>
                        </Link>
                        <div className="space-y-1">
                            {routes.map((route) => {
                                if (route.role && session?.user?.role !== route.role && session?.user?.role !== "ADMIN") {
                                    return null
                                }
                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                            pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                                        )}
                                    >
                                        <div className="flex items-center flex-1">
                                            <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                            {route.label}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                    <div className="px-3 py-2">
                        <div className="flex items-center p-3 mb-4 text-zinc-400">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                                <p className="text-xs">{session?.user?.email}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            variant="destructive"
                            className="w-full justify-start"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
            <main className="md:pl-72">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}


