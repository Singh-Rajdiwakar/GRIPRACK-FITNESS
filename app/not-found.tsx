import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FitnessBrand } from "@/components/fitness-brand"

export const metadata = { title: { absolute: "Page not found · GRIPRACK FITNESS" }, icons: { icon: "/griprack-mark.svg" } }

export default function NotFound() {
  return (
    <main className="fx-shell fx-missing">
      <header><FitnessBrand /></header>
      <div className="fx-missing-stage">
        <div className="fx-track-art" aria-hidden="true"><strong>404</strong></div>
        <section><p className="fx-kicker">Page not found · 404</p>
          <h1>Wrong turn.<br /><em>Keep moving.</em></h1>
          <p>This page isn’t part of your training plan. Let’s get you back on track.</p>
          <nav aria-label="Continue browsing"><Link href="/">Back to home <ArrowRight size={16} /></Link><Link href="/trainers">Find a trainer</Link></nav>
        </section>
      </div>
    </main>
  )
}
