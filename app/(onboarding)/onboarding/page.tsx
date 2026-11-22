import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { SiteHeader } from "@/components/site-header"
import { homeFor, requireUser } from "@/lib/auth"
import { OnboardingForm } from "./onboarding-form"
import "../../(landing)/landing.css"
import "./onboarding.css"

export const metadata: Metadata = {
  title: { absolute: "Choose your path · GRIPRACK FITNESS" },
  icons: { icon: "/griprack-mark.svg" },
}

export default function OnboardingPage() {
  return (
    <div className="gr-home ob-page">
      <SiteHeader brand={
        <Link href="/" className="gr-brand" aria-label="GRIPRACK FITNESS home">
          <svg viewBox="0 0 44 34" width="39" height="31" aria-hidden="true"><path fill="currentColor" d="M13 3h29l-4 7H17l-7 14h17l3-5H19l4-7h19L31 31H0z" /></svg>
          <span>GRIPRACK<small>FITNESS</small></span>
        </Link>
      } />
      <main className="ob-stage">
        <Suspense fallback={<Skeleton className="ob-skeleton" />}>
          <Onboarding />
        </Suspense>
      </main>
    </div>
  )
}

// Every sign-in lands here: users who already onboarded go straight to their home
async function Onboarding() {
  const { profile } = await requireUser()
  if (profile) redirect(homeFor(profile.role))
  return <OnboardingForm />
}
