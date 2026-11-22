import { FitnessBrand } from "@/components/fitness-brand"
import { SiteHeader } from "@/components/site-header"

// Full-height app screens (messages, onboarding): header, no footer
export const metadata = { title: { template: "%s · GRIPRACK FITNESS", default: "GRIPRACK FITNESS" }, icons: { icon: "/griprack-mark.svg" } }

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fx-shell">
      <SiteHeader brand={<FitnessBrand />} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
