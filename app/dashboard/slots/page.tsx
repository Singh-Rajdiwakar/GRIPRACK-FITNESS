import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CalendarPlus, Clock, DollarSign, Trash2, Video } from "lucide-react"
import { deleteSlot } from "@/app/actions/slots"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { EmptyState } from "@/components/empty-state"
import { ByLocalDay, LocalTime } from "@/components/local-time"
import { StudioHeading } from "@/app/(studio)/dashboard/studio"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { requireTrainer } from "@/lib/auth"
import { trainerSlots } from "@/lib/queries"
import { money } from "@/lib/utils"
import { SlotForm } from "./slot-form"

export const metadata: Metadata = { title: "Slots & bookings" }

export default function SlotsPage() {
  return (
    <div className="mg-slots">
      <StudioHeading label="Session scheduling" title="Slots & video calls" description="Add available times here. After a client pays, use Join call on the booked slot." />
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <Slots />
      </Suspense>
    </div>
  )
}

async function Slots() {
  const me = await requireTrainer()
  const slots = await trainerSlots(me.userId)
  const count = (status: string) => slots.filter((s) => s.status === status).length

  return (
    <div className="mg-schedule">
      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Add a slot</h2>
          <SlotForm>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><Clock className="size-4" /> Duration</dt>
                <dd className="font-medium">60 min</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><DollarSign className="size-4" /> Price</dt>
                <dd className="font-medium">{money(me.sessionPriceCents ?? 0)}</dd>
              </div>
            </dl>
          </SlotForm>
        </section>

        <section className="mg-counts grid grid-cols-3 gap-2">
          {[
            { label: "Open", n: count("open") },
            { label: "Held", n: count("held") },
            { label: "Booked", n: count("booked") },
          ].map((s) => (
            <div key={s.label} data-status={s.label} className="rounded-2xl border bg-card p-4">
              <p className="font-heading text-2xl font-bold">{s.n}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>
      </div>

      {slots.length ? (
        <ByLocalDay
          variant="list"
          items={slots.map((s) => ({
            id: s.id,
            at: s.startsAt,
            node: (
              <div className="mg-slot-row flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="w-20 font-heading font-semibold">
                  <LocalTime date={s.startsAt} format={{ hour: "numeric", minute: "2-digit" }} />
                </span>
                {s.status === "open" && <Badge variant="outline">Open</Badge>}
                {s.status === "held" && <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">Held · checkout in progress</Badge>}
                {s.status === "booked" && <Badge>Booked</Badge>}
                {s.status !== "open" && s.clientName && (
                  <span className="flex items-center gap-2 text-sm">
                    <UserAvatar name={s.clientName} src={s.clientAvatarUrl} className="size-6" /> {s.clientName}
                  </span>
                )}
                <span className="ml-auto">
                  {s.status === "open" && (
                    <ActionForm action={deleteSlot.bind(null, s.id)}>
                      <SubmitButton variant="ghost" size="icon" aria-label="Delete slot">
                        <Trash2 />
                      </SubmitButton>
                    </ActionForm>
                  )}
                  {s.status === "booked" && (
                    <Link href={`/call/${s.id}`} className={buttonVariants({ variant: "outline" })}>
                      <Video /> Join call
                    </Link>
                  )}
                </span>
              </div>
            ),
          }))}
        />
      ) : (
        <EmptyState icon={CalendarPlus} title="No upcoming slots" description="Add the times you're free. Clients see them on your profile and can book right away." />
      )}
    </div>
  )
}
