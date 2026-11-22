import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { requireTrainer } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Layers, Plus } from "lucide-react"
import { createProgram } from "@/app/actions/programs"
import { DetailsFields } from "@/app/dashboard/programs/details-fields"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { StudioHeading } from "../../studio"

export const metadata: Metadata = { title: { absolute: "New program · GRIPRACK FITNESS" } }

export default function NewProgramPage() {
  return <Suspense fallback={<Skeleton className="h-96" />}><TrainerProgramForm /></Suspense>
}

async function TrainerProgramForm() {
  await requireTrainer()
  return <ProgramForm />
}

function ProgramForm() {
  return <>
    <Link className="st-back" href="/dashboard/programs"><ArrowLeft size={16} /> All programs</Link>
    <StudioHeading label="Create something powerful" title={<>Build your next <em>program.</em></>} description="Add the basics, then add your lessons." />
    <div className="st-compose">
      <ActionForm action={createProgram} className="st-panel st-form">
        <h2>Program details</h2><DetailsFields />
        <div className="st-submit"><SubmitButton size="lg" className="st-button"><Plus /> Create program</SubmitButton></div>
      </ActionForm>
      <aside className="st-guide"><div className="st-art" aria-hidden="true"><i /><i /><i><Layers /></i></div>
        <div><p className="st-label">Publication status</p><h2>Draft</h2><p>New programs start as drafts. Publish once your lessons are in.</p></div>
      </aside>
    </div>
  </>
}
