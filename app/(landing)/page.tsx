import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense, type ReactNode } from "react"
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarCheck, Check, CirclePlay, Dumbbell, Globe, HeartPulse, Icon, MessageCircle, Mic, Play, Quote, Video } from "lucide-react"
import { GitHubIcon, LinkedInIcon } from "@neondatabase/auth/react/ui"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProgramCard, TrainerCard } from "@/components/cards"
import { Stars } from "@/components/rating"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"
import { featuredReviews, listTrainers, publishedPrograms } from "@/lib/queries"
import { specialties } from "@/lib/specialties"
import { LandingMotion } from "./motion"
import "./landing.css"

export const metadata: Metadata = {
  title: { absolute: "GRIPRACK FITNESS — Train with the best. Anywhere." },
  description: "Find elite personal trainers, follow their video programs, and book 1:1 coaching sessions with GRIPRACK FITNESS.",
  icons: { icon: "/griprack-mark.svg" },
}

const photos = {
  row: ["first.png", "An athlete rows a dumbbell with one hand braced on a bench."],
  stretch: ["Cinematic Gym Stretch with Orange Accents.png", "An athlete extends one leg into a deep lateral stretch by a squat rack."],
  portrait: ["Intense Pause in the Modern Gym.png", "A seated athlete takes a breath between strength sets."],
  swing: ["Teal Kettlebell Strength Session.png", "An athlete swings a kettlebell in a teal-lit training studio."],
  pushup: ["Focused Home Gym Push-Up Workout.png", "An athlete holds the bottom of a push-up in a sunlit home gym."],
  lunge: ["Focused Strength in Neon Light.png", "An athlete grips a kettlebell in a wide lateral lunge."],
  cable: ["Athlete Performing Cable Chest Fly.png", "An athlete brings two cable handles forward in a chest fly."],
  close: ["last .png", "An athlete in burgundy rests between sets against deep red studio light."],
} as const

function Photo({ shot, sizes = "100vw" }: { shot: keyof typeof photos; sizes?: string }) {
  const [file, alt] = photos[shot]
  return <div className="gr-photo" data-shot={shot}><Image src={`/new%20img/${encodeURIComponent(file)}`} alt={alt}
    width={1672} height={941} sizes={sizes} preload={shot === "row"} /></div>
}

function Brand() {
  return <Link href="/" className="gr-brand" aria-label="GRIPRACK FITNESS home">
    <svg viewBox="0 0 44 34" width="39" height="31" aria-hidden="true"><path fill="currentColor" d="M13 3h29l-4 7H17l-7 14h17l3-5H19l4-7h19L31 31H0z" /></svg>
    <span>GRIPRACK<small>FITNESS</small></span>
  </Link>
}

function DeveloperStrip() {
  const links = [
    { label: "Portfolio", href: "https://www.rajdiwakar.tech/", icon: <Globe /> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/rajdiwakar-singh-b46a762b4/", icon: <LinkedInIcon /> },
    { label: "GitHub", href: "https://github.com/Singh-Rajdiwakar", icon: <GitHubIcon /> },
    { label: "Instagram", href: "https://www.instagram.com/reels/DNYEEfLRIK4/", icon: <Icon iconNode={[
      ["rect", { x: 3, y: 3, width: 18, height: 18, rx: 5, key: "frame" }],
      ["circle", { cx: 12, cy: 12, r: 4, key: "lens" }],
      ["circle", { cx: 17.4, cy: 6.7, r: 1, fill: "currentColor", stroke: "none", key: "dot" }],
    ]} /> },
  ]
  return <div className="gr-developer">
    <nav aria-labelledby="gr-developer-label">
      <p id="gr-developer-label">Connect with the developer</p>
      <div className="gr-developer-links">
        {links.map(({ label, href, icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">{icon}</span>{label}
        </a>)}
      </div>
    </nav>
    <p className="gr-developer-credit">Designed &amp; Built by <strong>Singh Rajdiwakar</strong></p>
  </div>
}

function Label({ n, children }: { n?: string; children: ReactNode }) {
  return <p className="gr-label">{n && <span>{n} /</span>}{children}</p>
}

function Action({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={secondary ? "gr-secondary" : "gr-action"}>{children}</Link>
}

const stats = [["120+", "Elite coaches"], ["2,400+", "Video lessons"], ["4.9", "Average rating"]]
const pillars = [
  { icon: Dumbbell, title: "Train", text: "Video programs, anytime" },
  { icon: MessageCircle, title: "Connect", text: "Chat with your coach" },
  { icon: HeartPulse, title: "Thrive", text: "Real, lasting results" },
]
const features = [
  { icon: Play, title: "Video programs", text: "Follow step-by-step lessons. The first one is always free." },
  { icon: Video, title: "1:1 video calls", text: "Book a slot and train face-to-face with your coach." },
  { icon: MessageCircle, title: "Chat & threads", text: "Ask questions, share progress, react to wins." },
  { icon: CalendarCheck, title: "Book in seconds", text: "Pick an open time and pay securely with Stripe." },
]

export default function HomePage() {
  return <div className="gr-home" id="griprack-home">
    <LandingMotion />
    <SiteHeader brand={<Brand />}><nav className="gr-editorial-nav" aria-label="Homepage sections"><a href="#programs">Programs</a><a href="#coaching">Coaching</a></nav></SiteHeader>
    <main>
      <section className="gr-hero" aria-labelledby="home-title">
        <Photo shot="row" />
        <div className="gr-hero-inner">
          <div className="gr-hero-copy">
            <Label>Stronger every day</Label>
            <h1 id="home-title" aria-label="Train with the best. Anywhere."><span><b>Train with</b></span><span><b>the best.</b></span><span><em>Anywhere.</em></span></h1>
            <p className="gr-deck">Elite personal trainers, step-by-step video programs, and 1:1 coaching calls — all in one place, built around your schedule.</p>
            <div className="gr-actions"><Action href="/trainers">Find your trainer <ArrowUpRight /></Action><Action href="#programs" secondary><CirclePlay /> Watch a free lesson</Action></div>
          </div>
        </div>
        <a href="#goals" aria-label="Scroll to workout categories" className="gr-scroll"><ArrowDown /> Scroll to explore</a>
      </section>
      <div className="gr-stats"><dl>{stats.map(([value,label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>Stronger. Fitter. <i>Unstoppable.</i></p></div>

      <section id="goals" className="gr-goals" data-scene="left">
        <div className="gr-goals-visual"><Photo shot="stretch" sizes="(min-width: 900px) 45vw, 100vw" /><p>Discipline <i>builds freedom</i></p></div>
        <div className="gr-goals-copy" data-copy><Label n="01">The disciplines</Label><h2>Workouts for<br /><em>every goal.</em></h2>
          <p>From heavy barbells to deep stretches — find a coach for what moves you.</p>
          <div className="gr-categories">{specialties.map(({ slug, label, icon: Icon }) =>
            <Link key={slug} href={`/trainers?specialty=${slug}`}><Icon /><span>{label}</span><ArrowUpRight /></Link>)}</div>
        </div>
      </section>

      <section className="gr-spread" data-scene="right">
        <div className="gr-banner"><Photo shot="portrait" /><div className="gr-banner-copy" data-copy><Label n="02">Trainer directory</Label>
          <h2>Meet your<br /><em>coaches.</em></h2><p>Certified pros who&apos;ve helped thousands get results.</p>
          <Action href="/trainers" secondary>View all trainers <ArrowRight /></Action></div></div>
        <div className="gr-trainer-grid"><Suspense fallback={<Loading count={4} />}><FeaturedTrainers /></Suspense></div>
      </section>

      <section id="coaching" className="gr-coaching" data-scene="iris">
        <div className="gr-banner"><Photo shot="swing" /><div className="gr-banner-copy" data-copy><Label n="03">Built for real coaching</Label>
          <h2>Your coach.<br /><em>One tap away.</em></h2>
          <p>Everything you need to train with a world-class coach: lessons you can follow at your own pace, live sessions when you need feedback, and a direct line between them.</p>
          <Action href="/trainers" secondary>Find your trainer <ArrowUpRight /></Action></div></div>
        <div className="gr-experience">
          <div className="gr-feature-list">{features.map(({ icon: Icon, title, text }) => <div key={title}><Icon /><div><h3>{title}</h3><p>{text}</p></div></div>)}</div>
          <aside className="gr-preview" aria-label="Example coaching session"><Label>Session preview</Label>
            <div className="gr-live"><span>Live · 24:13</span><div><Mic /><Video /><small>Leave</small></div></div>
            <div className="gr-chat"><UserAvatar name="Maya Chen" src="/images/trainers/maya-chen.jpg" className="size-9" /><div><b>Maya Chen</b><p>Great depth on that last set! Keep the chest up 💪</p><small>🔥 2</small></div><UserAvatar name="Alex Morgan" className="size-7" /></div>
            <div className="gr-booked"><CalendarCheck /><span><b>Session booked</b><small>Mon, Nov 2 · 10:00 AM</small></span></div>
          </aside>
        </div>
      </section>

      <section id="programs" className="gr-programs" data-scene="up">
        <div className="gr-program-intro"><div className="gr-program-visual"><Photo shot="pushup" sizes="(min-width: 900px) 52vw, 100vw" /><p>Small steps. <i>Big changes.</i></p></div>
          <div data-copy><Label n="04">The training library</Label><h2>Training<br /><em>programs.</em></h2>
          <p>Goal-based plans designed by experts. Watch the first lesson of any program free.</p><Action href="/trainers" secondary>Browse coaches <ArrowRight /></Action></div></div>
        <div className="gr-program-grid"><Suspense fallback={<Loading count={3} />}><LatestPrograms /></Suspense></div>
      </section>

      <section className="gr-results" data-scene="left">
        <div className="gr-results-intro"><Photo shot="lunge" sizes="(min-width: 900px) 50vw, 100vw" /><div data-copy><Label n="05">Client reviews</Label><h2>Real people.<br /><em>Real results.</em></h2>
          <p>Thousands of clients have transformed their training with GRIPRACK.</p></div></div>
        <div className="gr-reviews"><Suspense fallback={<Loading count={3} />}><Testimonials /></Suspense></div>
      </section>

      <section className="gr-acquire" data-scene="right">
        <Photo shot="cable" sizes="(min-width: 900px) 50vw, 100vw" />
        <div data-copy><Label n="06">For coaches</Label><h2>Turn your expertise<br /><em>into income.</em></h2>
          <p>Sell video programs, fill your calendar with 1:1 sessions, and chat with clients. We handle payments, video hosting, and calls.</p>
          <ul>{["Set your own prices","Live earnings dashboard","No monthly fees"].map(t => <li key={t}><Check />{t}</li>)}</ul>
          <div className="gr-actions"><Action href="/auth/sign-up">Become a trainer <ArrowUpRight /></Action><Action href="/dashboard" secondary>See the dashboard</Action></div>
        </div>
      </section>

      <div className="gr-pillars">{pillars.map(({icon: Icon,title,text}) => <div key={title}><Icon /><span><b>{title}</b><small>{text}</small></span></div>)}</div>
      <section className="gr-closing" data-scene="iris">
        <div className="gr-banner"><Photo shot="close" /><div className="gr-banner-copy" data-copy><Label>GRIPRACK FITNESS</Label>
          <h2>Stronger.<br />Fitter.<br /><em>Unstoppable.</em></h2>
          <p>Find your coach. Choose a program or book your next 1:1 session.</p>
          <div className="gr-actions"><Action href="/trainers">Find your trainer <ArrowUpRight /></Action><Action href="#programs" secondary>Explore programs <ArrowRight /></Action></div></div></div>
      </section>
    </main>
    <SiteFooter brand={<Brand />} name="GRIPRACK FITNESS" />
    <DeveloperStrip />
  </div>
}

async function FeaturedTrainers() {
  const trainers = await listTrainers({ limit: 4 })
  return trainers.map(t => <TrainerCard key={t.id} trainer={t} />)
}
async function LatestPrograms() {
  const programs = await publishedPrograms(6)
  return programs.map(p => <ProgramCard key={p.id} program={p} />)
}
async function Testimonials() {
  const reviews = await featuredReviews()
  return reviews.map(r => <figure key={r.id}><Quote aria-hidden="true" /><Stars value={r.rating} />
    <blockquote>“{r.comment}”</blockquote><figcaption><UserAvatar name={r.clientName} src={r.clientAvatarUrl} className="size-10" />
    <span><b>{r.clientName}</b><small>Trained with {r.trainerName}</small></span></figcaption></figure>)
}
function Loading({ count }: { count: number }) {
  return Array.from({length: count}, (_,i) => <Skeleton key={i} className="gr-loading" />)
}
