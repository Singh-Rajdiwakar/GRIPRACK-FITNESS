import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpLeft } from "lucide-react"
import { Stars } from "@/components/rating"
import "./account-entry.css"

const photos = {
  "sign-in": { src: "/new%20img/sign%20in.png", alt: "An athlete in burgundy takes a water break beside a cable machine." },
  "sign-up": { src: "/new%20img/newsign%20up.png", alt: "An athlete stands at the top of a loaded barbell deadlift in the GRIPRACK gym." },
}

export function AccountEntry({ mode, children }: { mode: keyof typeof photos; children: ReactNode }) {
  const signIn = mode === "sign-in"
  return (
    <div className="gr-account" data-entry={mode}>
      <header className="ga-masthead">
        <Link href="/" className="ga-brand" aria-label="GRIPRACK FITNESS home">
          <svg viewBox="0 0 44 34" width="39" height="31" aria-hidden="true"><path fill="currentColor" d="M13 3h29l-4 7H17l-7 14h17l3-5H19l4-7h19L31 31H0z" /></svg>
          <span>GRIPRACK<small>FITNESS</small></span>
        </Link>
        <Link href="/" className="ga-home"><ArrowUpLeft aria-hidden="true" /> Back to home</Link>
      </header>
      <main className="ga-stage">
        <div className="ga-image">
          <Image src={photos[mode].src} alt={photos[mode].alt} width={1672} height={941} preload
            sizes="(max-width: 740px) 100vw, (max-width: 1000px) 45vw, 56vw" />
          {signIn && (
            <div className="ga-photo-note">
              <p className="ga-photo-title">
                <span>Stronger</span>{" "}<span>starts here.</span>
              </p>
              <p className="ga-photo-description">Every rep brings you closer to who you want to become.</p>
            </div>
          )}
        </div>
        <section className="ga-form-panel" aria-labelledby="ga-title">
          <div className="ga-form-wrap">
            <p className="ga-kicker">{signIn ? "Sign in" : "Sign up"}</p>
            <h1 id="ga-title">{signIn ? <>Welcome <em>back.</em></> : <>Create an <em>account.</em></>}</h1>
            {children}
          </div>
        </section>
        <figure className="ga-caption">
          <Stars value={5} />
          <blockquote>“Added 40 lb to my squat in eight weeks. Maya&apos;s cues just click.”</blockquote>
          <figcaption>Jordan Lee <span> / </span> Strength Foundations</figcaption>
        </figure>
      </main>
    </div>
  )
}

