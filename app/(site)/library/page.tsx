import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { eq } from "drizzle-orm"
import { manageCheckout } from "@/app/actions/checkout"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { db } from "@/lib/db"
import { pendingCheckouts, profiles, programs as programTable } from "@/lib/db/schema"
import { BookOpen, CalendarDays, MessageCircle, Video } from "lucide-react"
import { ProgramCard } from "@/components/cards"
import { EmptyState } from "@/components/empty-state"
import { LocalTime } from "@/components/local-time"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { requireProfile } from "@/lib/auth"
import { clientSessions, ownedPrograms } from "@/lib/queries"
import { cn, money } from "@/lib/utils"

export const metadata: Metadata = { title: "My library" }

export default function LibraryPage() {
  return (
    <div className="fx-library shell">
      <p className="fx-kicker">My library</p>
      <Suspense fallback={<LibrarySkeleton />}>
        <Library />
      </Suspense>
    </div>
  )
}

async function Library() {
  const me = await requireProfile()
  const [sessions, programs, pending] = await Promise.all([
    clientSessions(me.userId),
    ownedPrograms(me.userId),
    db.select({ id: pendingCheckouts.sessionId, amount: pendingCheckouts.amountCents, title: programTable.title, trainer: profiles.name })
      .from(pendingCheckouts)
      .innerJoin(profiles, eq(profiles.userId, pendingCheckouts.trainerId))
      .leftJoin(programTable, eq(programTable.id, pendingCheckouts.programId))
      .where(eq(pendingCheckouts.clientId, me.userId)),
  ])

  return (
    <>
      <h1>Welcome back, <em>{me.name.split(" ")[0]}.</em></h1>
      <p className="mt-3 text-muted-foreground">Your programs and upcoming sessions, all in one place.</p>

      <nav className="fx-library-nav" aria-label="Library sections">
        <a href="#video-calls"><CalendarDays size={16} /> Video calls <b>{sessions.length}</b></a>
        <a href="#my-programs"><BookOpen size={16} /> My programs <b>{programs.length}</b></a>
        {pending.length > 0 && <a href="#pending-checkouts">Pending checkouts <b>{pending.length}</b></a>}
      </nav>

      {pending.length > 0 && (
        <section id="pending-checkouts" className="mt-12 scroll-mt-24">
          <h2 className="text-2xl font-bold">Pending checkouts</h2>
          {pending.map((order) => (
            <div key={order.id} className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border p-4">
              <p className="mr-auto">{order.title ?? `Video session with ${order.trainer}`} · {money(order.amount)}</p>
              <ActionForm action={manageCheckout.bind(null, order.id, false)}><SubmitButton>Continue checkout</SubmitButton></ActionForm>
              <ActionForm action={manageCheckout.bind(null, order.id, true)}><SubmitButton variant="outline">Cancel checkout</SubmitButton></ActionForm>
            </div>
          ))}
        </section>
      )}

      <section id="video-calls" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-bold">Upcoming video calls</h2>
        <div className="mt-5">
          {sessions.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 sm:flex-nowrap">
                  <div className="grid w-16 shrink-0 place-items-center rounded-xl bg-accent py-2 text-accent-foreground">
                    <span className="text-xs font-semibold uppercase">
                      <LocalTime date={s.startsAt} format={{ month: "short" }} />
                    </span>
                    <span className="font-heading text-2xl leading-none font-bold">
                      <LocalTime date={s.startsAt} format={{ day: "numeric" }} />
                    </span>
                  </div>
                  <UserAvatar name={s.trainerName} src={s.trainerAvatarUrl} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Session with {s.trainerName}</p>
                    <p className="text-sm text-muted-foreground">
                      <LocalTime date={s.startsAt} format={{ weekday: "long", hour: "numeric", minute: "2-digit" }} /> · 60 min
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/messages?c=${s.trainerId}`} aria-label={`Message ${s.trainerName}`} className={buttonVariants({ variant: "outline", size: "icon-lg" })}>
                      <MessageCircle />
                    </Link>
                    <Link href={`/call/${s.id}`} className={cn(buttonVariants({ size: "lg" }), "px-4")}>
                      <Video /> Join call
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title="No sessions booked" description="Book a 1:1 video session with a coach to get personal feedback.">
              <Link href="/trainers" className={buttonVariants()}>Find a trainer</Link>
            </EmptyState>
          )}
        </div>
      </section>

      <section id="my-programs" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl font-bold">My programs</h2>
        <div className="mt-5">
          {programs.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="No programs yet" description="Programs you buy show up here with lifetime access.">
              <Link href="/trainers" className={buttonVariants()}>Browse programs</Link>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  )
}

function LibrarySkeleton() {
  return (
    <>
      <Skeleton className="mt-3 h-12 w-80" />
      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="aspect-4/3 rounded-2xl" />
        ))}
      </div>
    </>
  )
}
