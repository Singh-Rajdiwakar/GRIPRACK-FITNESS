import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense, type CSSProperties } from "react"
import { Image as TrainerImage } from "@imagekit/next"
import { ArrowUpRight, LayoutGrid, SearchX, SlidersHorizontal, Star } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { listTrainers, type TrainerSummary } from "@/lib/queries"
import { specialties, specialtyLabel } from "@/lib/specialties"
import { imageProps, initials, money } from "@/lib/utils"
import "../../(landing)/landing.css"
import "./discovery.css"

const description = "Browse certified trainers, watch a free lesson, and book a 1:1 session when you're ready."

export const metadata: Metadata = {
  title: { absolute: "Find your coach · GRIPRACK FITNESS" },
  description,
  icons: { icon: "/griprack-mark.svg" },
}

function Brand() {
  return (
    <Link href="/" className="gr-brand" aria-label="GRIPRACK FITNESS home">
      <svg viewBox="0 0 44 34" width="39" height="31" aria-hidden="true">
        <path fill="currentColor" d="M13 3h29l-4 7H17l-7 14h17l3-5H19l4-7h19L31 31H0z" />
      </svg>
      <span>GRIPRACK<small>FITNESS</small></span>
    </Link>
  )
}

export default function TrainersPage({ searchParams }: PageProps<"/trainers">) {
  return (
    <div className="gr-home td-discovery">
      <SiteHeader brand={<Brand />}>
        <nav className="gr-editorial-nav" aria-label="Homepage sections">
          <Link href="/#programs">Programs</Link><Link href="/#coaching">Coaching</Link>
        </nav>
      </SiteHeader>
      <main>
        <header className="td-hero">
          <div className="td-plate">
            <Image src="/new%20img/Athlete%20Performing%20Cable%20Chest%20Fly.png"
              width={1672} height={941} sizes="(max-width: 600px) 43vw, 52vw" preload
              alt="An athlete training on a cable fly machine." />
          </div>
          <div className="td-heading">
            <p className="gr-label">Find your edge</p>
            <h1><span><b>Find your</b></span>{" "}<span><em>perfect coach.</em></span></h1>
          </div>
          <p className="td-intro">{description}</p>
        </header>
        <Suspense fallback={<DirectorySkeleton />}>
          <Directory searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter brand={<Brand />} name="GRIPRACK FITNESS" />
    </div>
  )
}

async function Directory({ searchParams }: Pick<PageProps<"/trainers">, "searchParams">) {
  const { specialty } = await searchParams
  const active = specialties.find((s) => s.slug === specialty)?.slug
  const list = await listTrainers({ specialty: active })

  return (
    <>
      <nav className="td-filters" aria-label="Filter by specialty">
        <div className="td-filter-title"><SlidersHorizontal aria-hidden="true" /> Specialty</div>
        <div className="td-rail">
          <Link href="/trainers" aria-current={!active ? "page" : undefined}><LayoutGrid />All</Link>
          {specialties.map(({ slug, label, icon: Icon }) => (
            <Link key={slug} href={`/trainers?specialty=${slug}`} aria-current={active === slug ? "page" : undefined}>
              <Icon />{label}
            </Link>
          ))}
        </div>
      </nav>
      <section className="td-results" aria-labelledby="td-list-heading">
        <div className="td-results-heading">
          <h2 id="td-list-heading">Coaches</h2>
          <span aria-hidden="true" />
          <p role="status">{list.length} {list.length === 1 ? "trainer" : "trainers"}</p>
        </div>
        {list.length ? (
          <ul className="td-grid" key={active ?? "all"}>
            {list.map((trainer, index) => (
              <li key={trainer.id} style={{ "--td-index": index % 3 } as CSSProperties}>
                <CoachCard trainer={trainer} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="td-empty">
            <SearchX aria-hidden="true" />
            <div><h3>No trainers yet</h3><p>Nobody coaches this specialty yet. Try another one, or check back soon.</p></div>
            <Link href="/trainers" className="td-cta">Show all trainers <ArrowUpRight /></Link>
          </div>
        )}
      </section>
    </>
  )
}

function CoachCard({ trainer }: { trainer: TrainerSummary }) {
  const { name, avatarUrl, headline, bio, rating, reviewCount } = trainer
  return (
    <Link className="td-card" href={`/trainers/${trainer.id}`} aria-label={`View profile of ${name}`}>
      <div className="td-portrait">
        {avatarUrl ? (
          <TrainerImage {...imageProps(avatarUrl, [{ width: 640, height: 700, focus: "face" }])}
            alt={name} fill sizes="(min-width: 1000px) 30vw, (min-width: 620px) 45vw, 92vw" />
        ) : <span className="td-initials">{initials(name)}</span>}
      </div>
      <div className="td-dossier">
        <p className="td-rating">{reviewCount > 0 ? <>
          <Star aria-hidden="true" /><strong>{rating.toFixed(1)}</strong>
          <span>({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
        </> : "New coach"}</p>
        <h3>{name}</h3>
        {headline && <p className="td-headline">{headline}</p>}
        {bio && <p className="td-bio">{bio}</p>}
        {!!trainer.specialties?.length && <ul className="td-tags" aria-label="Coaching specialties">
          {trainer.specialties.map(slug => <li key={slug}>{specialtyLabel(slug)}</li>)}
        </ul>}
      </div>
      <div className="td-book">
        <p className="td-price"><strong>{money(trainer.sessionPriceCents ?? 0)}</strong><span> / session</span></p>
        <span className="td-cta">View profile <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </Link>
  )
}

function DirectorySkeleton() {
  return (
    <div className="td-placeholder" aria-busy="true" aria-label="Loading trainers">
      <div /><div />
    </div>
  )
}

