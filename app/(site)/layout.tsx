import { FitnessBrand } from "@/components/fitness-brand"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata = { title: { template: "%s · GRIPRACK FITNESS", default: "GRIPRACK FITNESS" }, icons: { icon: "/griprack-mark.svg" } }

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fx-shell">
      <SiteHeader brand={<FitnessBrand />} />
      <main className="flex-1">{children}</main>
      <SiteFooter brand={<FitnessBrand />} name="GRIPRACK FITNESS" />
    </div>
  )
}
