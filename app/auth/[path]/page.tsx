import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Image from "next/image"
import { AuthView } from "@neondatabase/auth/react/ui"
import { authViewPaths } from "@neondatabase/auth/react/ui/server"
import { FitnessBrand } from "@/components/fitness-brand"
import { Stars } from "@/components/rating"
import { Skeleton } from "@/components/ui/skeleton"
import { AccountEntry } from "./account-entry"

type Props = PageProps<"/auth/[path]">

const paths: string[] = Object.values(authViewPaths)
export const generateStaticParams = () => paths.map((path) => ({ path }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params
  if (path === "sign-in" || path === "sign-up") {
    return {
      title: { absolute: `${path === "sign-in" ? "Sign in" : "Create an account"} · GRIPRACK FITNESS` },
      icons: { icon: "/griprack-mark.svg" },
    }
  }
  const label = path.replaceAll("-", " ")
  return { title: { absolute: `${label.charAt(0).toUpperCase() + label.slice(1)} · GRIPRACK FITNESS` }, icons: { icon: "/griprack-mark.svg" } }
}

export default function AuthPage({ params }: Props) {
  return (
    <Suspense fallback={<div role="status" className="grid min-h-dvh place-items-center"><span>Loading…</span></div>}>
      <AuthPageContent params={params} />
    </Suspense>
  )
}

async function AuthPageContent({ params }: Pick<Props, "params">) {
  const { path } = await params
  if (path === "sign-in" || path === "sign-up") {
    return (
      <AccountEntry mode={path}>
        <Suspense fallback={<Skeleton className="h-112 rounded-sm" />}>
          <View params={params} />
        </Suspense>
      </AccountEntry>
    )
  }
  if (!paths.includes(path)) notFound()
  const transferring = path === "callback" || path === "sign-out"
  const view = <Suspense fallback={<Skeleton className="h-24 w-full" />}><View params={params} /></Suspense>
  return (
    <main className="fx-shell fx-auth">
      <header><FitnessBrand /></header>
      {transferring ? (
        <section className="fx-transfer" aria-live="polite">{view}
          <h1>{path === "sign-out" ? "Signing out…" : "Finishing sign-in…"}</h1>
        </section>
      ) : (
        <div className="fx-auth-grid">
          <figure className="fx-auth-visual">
            <Image src="/new%20img/Cinematic%20Gym%20Stretch%20with%20Orange%20Accents.png" alt="Athlete stretching on a gym mat" width={1672} height={941} sizes="(max-width: 760px) 100vw, 45vw" />
            <figcaption><Stars value={5} /><blockquote>“Added 40 lb to my squat in eight weeks. Maya&apos;s cues just click.”</blockquote><p>Jordan Lee · Strength Foundations</p></figcaption>
          </figure>
          <section className="fx-auth-fields" aria-label="Account access">
            <div><p className="fx-kicker">Account access</p>{view}</div>
          </section>
        </div>
      )}
    </main>
  )
}

async function View({ params }: Pick<Props, "params">) {
  const { path } = await params
  if (!paths.includes(path)) notFound()
  return <AuthView path={path} classNames={{ base: "border-0 bg-transparent p-0 shadow-none ring-0" }} />
}
