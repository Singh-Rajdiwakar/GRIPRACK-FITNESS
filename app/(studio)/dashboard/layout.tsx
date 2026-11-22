import { Suspense, type ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { requireTrainer } from "@/lib/auth"
import { StudioShell } from "./studio"
import "./studio.css"

export const metadata = { icons: { icon: "/griprack-mark.svg" } }

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Skeleton className="m-6 min-h-[90vh] rounded-lg" />}><TrainerShell>{children}</TrainerShell></Suspense>
}

async function TrainerShell({ children }: { children: ReactNode }) {
  const trainer = await requireTrainer()
  return <StudioShell trainer={trainer}>{children}</StudioShell>
}
