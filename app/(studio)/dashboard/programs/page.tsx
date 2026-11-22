import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ArrowUpRight, Film, Plus } from "lucide-react"
import { ProgramCover } from "@/components/cards"
import { Skeleton } from "@/components/ui/skeleton"
import { requireTrainer } from "@/lib/auth"
import { trainerPrograms } from "@/lib/queries"
import { money } from "@/lib/utils"
import { StudioHeading } from "../studio"

export const metadata: Metadata = { title: { absolute: "Training programs · GRIPRACK FITNESS" } }

export default function ProgramsPage() {
  return <>
    <StudioHeading label="Your training business" title={<>Training <em>programs.</em></>} description="Create programs, add lessons, and set your prices.">
      <Link href="/dashboard/programs/new" className="st-button"><Plus /> New program</Link>
    </StudioHeading>
    <Suspense fallback={<Skeleton className="h-64" />}><ProgramList /></Suspense>
  </>
}

async function ProgramList() {
  const me = await requireTrainer()
  const mine = await trainerPrograms(me.userId, true)
  return <Collection programs={mine} />
}

function Collection({ programs }: { programs: Awaited<ReturnType<typeof trainerPrograms>> }) {
  if (!programs.length) return <section className="st-empty st-panel">
    <Film /><h2>No programs yet</h2><p>Package your best workouts into a video program and start selling.</p>
    <Link href="/dashboard/programs/new" className="st-button"><Plus /> Create your first program</Link>
  </section>
  return <ul className="st-catalog">{programs.map(p => <li key={p.id} className="st-program">
    <div className="st-cover"><ProgramCover program={p} sizes="(max-width: 640px) 100vw, 400px" />
      <span className="st-cover-label"><Film size={14} />{p.lessonCount} {p.lessonCount === 1 ? "lesson" : "lessons"}</span>
    </div>
    <div className="st-program-body"><span className="st-status" data-published={p.published}>{p.published ? "Published" : "Draft"}</span>
      <h2>{p.title}</h2><p className="st-summary">{p.description}</p>
      <div className="st-program-bottom"><dl>{[["Price", money(p.priceCents)], ["Sales", p.sales], ["Revenue", money(p.revenueCents)]].map(([label, value]) =>
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <Link href={`/dashboard/programs/${p.id}`} aria-label={`Edit ${p.title}`} className="st-text-link">Edit <ArrowUpRight size={16} /></Link>
      </div>
    </div>
  </li>)}</ul>
}
