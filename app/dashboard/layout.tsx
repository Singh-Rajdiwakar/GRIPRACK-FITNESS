import StudioLayout from "@/app/(studio)/dashboard/layout"
import "./management.css"

export const metadata = { title: { template: "%s · GRIPRACK FITNESS", default: "Trainer dashboard · GRIPRACK FITNESS" }, icons: { icon: "/griprack-mark.svg" } }

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <StudioLayout><div className="mg-workspace">{children}</div></StudioLayout>
}
