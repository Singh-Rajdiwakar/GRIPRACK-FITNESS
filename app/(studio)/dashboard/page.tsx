import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CalendarDays, DollarSign, Film, Plus, Receipt, Star, Video } from "lucide-react"
import { ProgramCover } from "@/components/cards"
import { LiveFeed, LiveSales, LiveSalesCount, LiveStatus, LiveTotal } from "@/components/live-sales"
import { LocalTime } from "@/components/local-time"
import { StudioHeading } from "./studio"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { requireTrainer } from "@/lib/auth"
import { getTrainer, trainerPrograms, trainerSessions, weeklyEarnings } from "@/lib/queries"
import { loadSales } from "@/lib/realtime"
import { formatDate, money } from "@/lib/utils"

export const metadata: Metadata = { title: { absolute: "Trainer dashboard · GRIPRACK FITNESS" } }

export default function DashboardPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview />
    </Suspense>
  )
}

async function Overview() {
  const me = await requireTrainer()
  const [sales, weeks, sessions, programs, trainer] = await Promise.all([
    loadSales(me.userId),
    weeklyEarnings(me.userId),
    trainerSessions(me.userId),
    trainerPrograms(me.userId, true),
    getTrainer(me.userId),
  ])
  return (
    <LiveSales
      key={sales.sealedQuery.queryFingerprint}
      url={process.env.NEON_REALTIME_URL!}
      sealedQuery={sales.sealedQuery}
      initialData={sales.rows}
      userId={me.userId}
    >
      <OverviewContent name={me.name} weeks={weeks} sessions={sessions} programs={programs} trainer={trainer} />
    </LiveSales>
  )
}

type OverviewProps = {
  name: string
  weeks: Awaited<ReturnType<typeof weeklyEarnings>>
  sessions: Awaited<ReturnType<typeof trainerSessions>>
  programs: Awaited<ReturnType<typeof trainerPrograms>>
  trainer: Awaited<ReturnType<typeof getTrainer>>
}

function OverviewContent({ name, weeks, sessions, programs, trainer }: OverviewProps) {
  const eightWeeks = weeks.reduce((sum, w) => sum + w.cents, 0)
  const max = Math.max(1, ...weeks.map((w) => w.cents))
  const next = sessions[0]

  const stats = [
    { label: "Total earnings", value: <LiveTotal />, note: "Gross, all time · updates live", icon: DollarSign },
    { label: "Sales", value: <LiveSalesCount />, note: "Programs and sessions", icon: Receipt },
    {
      label: "Upcoming sessions",
      value: sessions.length,
      note: next ? <>Next: <LocalTime date={next.startsAt} format={{ weekday: "short", hour: "numeric", minute: "2-digit" }} /></> : "None booked yet",
      icon: CalendarDays,
    },
    {
      label: "Average rating",
      value: trainer?.reviewCount ? trainer.rating.toFixed(1) : "—",
      note: `${trainer?.reviewCount ?? 0} ${trainer?.reviewCount === 1 ? "review" : "reviews"}`,
      icon: Star,
    },
  ]

  return <div className="st-overview">
    <StudioHeading label="Trainer command center" title={<>Welcome back, <em>{name.split(" ")[0]}.</em></>} description="Here's how your coaching business is doing.">
      <Link href="/dashboard/slots" className="st-button st-secondary"><CalendarDays /> Add slots</Link>
      <Link href="/dashboard/programs/new" className="st-button"><Plus /> New program</Link>
    </StudioHeading>
    <div className="st-metrics">{stats.map(({label, value, note, icon: Icon}) => (
      <section className="st-stat" key={label}>
        <h2><Icon size={17} />{label}</h2><p className="st-kpi">{value}</p><p className="st-note">{note}</p>
      </section>
    ))}</div>
    <div className="st-analytics">
      <figure className="st-panel st-earn">
        <figcaption className="st-panel-head"><div><h2>Earnings</h2><p>Gross revenue per week, last 8 weeks</p></div><strong>{money(eightWeeks)}</strong></figcaption>
        <div className="st-chart">
          <div className="st-axis" aria-hidden="true"><span>{eightWeeks > 0 && money(max)}</span><span>{money(0)}</span></div>
          <div className="st-plot">{weeks.map(w => {
          const date = formatDate(w.start, { month: "short", day: "numeric", timeZone: "UTC" })
          return <div key={w.key} className="st-week" tabIndex={0} role="img" aria-label={`Week of ${date}: ${money(w.cents)}`}>
            <div className="st-track"><div className="st-bar" style={{height: `${(w.cents / max) * 100}%`}} /></div>
            <span className="st-tip" aria-hidden="true">{date} · {money(w.cents)}</span>
            <span className="st-date">{date}</span>
          </div>
        })}</div></div>
      </figure>
      <section className="st-panel st-feed"><div className="st-panel-head"><h2>Live sales</h2><LiveStatus /></div><LiveFeed /></section>
    </div>
    <div className="st-lower">
      <section className="st-panel">
        <div className="st-panel-head">
          <h2 className="font-semibold">Upcoming sessions</h2>
          <Link href="/dashboard/slots" className="st-text-link">Manage slots</Link>
        </div>
        {sessions.length ? (
          <ul className="divide-y">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-6 py-3.5">
                <UserAvatar name={s.clientName} src={s.clientAvatarUrl} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{s.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    <LocalTime date={s.startsAt} format={{ weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }} />
                  </p>
                </div>
                <Link href={`/call/${s.id}`} className={buttonVariants({ variant: "outline" })}>
                  <Video /> Join call
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">No sessions booked yet. Post open slots so clients can book you.</p>
        )}
      </section>

      <section className="st-panel">
        <div className="st-panel-head">
          <h2 className="font-semibold">Your programs</h2>
          <Link href="/dashboard/programs" className="st-text-link">View all</Link>
        </div>
        {programs.length ? (
          <ul className="divide-y">
            {programs.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/programs/${p.id}`} className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-muted/50">
                  <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-sm">
                    <ProgramCover program={p} sizes="80px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.title}</span>
                    <span className="text-xs text-muted-foreground">{money(p.priceCents)} · {p.lessonCount} {p.lessonCount === 1 ? "lesson" : "lessons"} · {p.sales} {p.sales === 1 ? "sale" : "sales"}</span>
                  </span>
                  <span className="st-status" data-published={p.published}>{p.published ? "Published" : "Draft"}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
            <Film className="size-5" /> No programs yet.
          </div>
        )}
      </section>
    </div>
    </div>
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl xl:col-span-2" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  )
}
