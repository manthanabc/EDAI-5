import DashboardLayoutContent from "./dashboard-layout"

export const dynamic = "force-dynamic"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayoutContent>{children}</DashboardLayoutContent>
}
