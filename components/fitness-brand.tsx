import Link from "next/link"
import "./fitness.css"

export function FitnessBrand() {
  return (
    <Link href="/" className="fx-brand" aria-label="GRIPRACK FITNESS home">
      <svg viewBox="0 0 44 34" width="36" height="28" aria-hidden="true"><path fill="currentColor" d="M13 3h29l-4 7H17l-7 14h17l3-5H19l4-7h19L31 31H0z" /></svg>
      <span>GRIPRACK<small>FITNESS</small></span>
    </Link>
  )
}
