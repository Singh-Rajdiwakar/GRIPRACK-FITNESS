import Link from "next/link"
import type { ReactNode } from "react"
import { LogOut } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { StudioMenu } from "./studio-menu"

function Wordmark() {
  return <Link className="st-brand" href="/" aria-label="GRIPRACK FITNESS home">
    <svg viewBox="0 0 44 34" width="36" height="29" aria-hidden="true"><path fill="currentColor" d="M13 3h29l-4 7H17l-7 14h17l3-5H19l4-7h19L31 31H0z" /></svg>
    <span>GRIPRACK<small>FITNESS</small></span>
  </Link>
}

export function StudioShell({ trainer, children }: { trainer: { userId: string; name: string; avatarUrl: string | null }; children: ReactNode }) {
  const navigation = <DashboardNav profileHref={`/trainers/${trainer.userId}`} />
  const controls = <div className="st-tools"><ThemeToggle /><Link href="/auth/sign-out" aria-label="Sign out"><LogOut size={17} /></Link></div>
  return <div className="st-shell">
    <aside className="st-side">
      <Wordmark />{navigation}
      <div className="st-account"><UserAvatar name={trainer.name} src={trainer.avatarUrl} className="size-9" />
        <div><b>{trainer.name}</b><small>Trainer</small></div>{controls}</div>
    </aside>
    <div className="st-body"><header className="st-mobile"><StudioMenu>{navigation}</StudioMenu><Wordmark />{controls}</header>
      <main className="st-main">{children}</main>
    </div>
  </div>
}

export function StudioHeading({ label, title, description, children }: { label: string; title: ReactNode; description: string; children?: ReactNode }) {
  return <header className="st-heading"><div>
    <p className="st-label">{label}</p><h1>{title}</h1><p className="st-deck">{description}</p>
  </div>{children && <div className="st-actions">{children}</div>}</header>
}
