"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { Menu, X } from "lucide-react"

export function StudioMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => { if (desktop.matches) ref.current?.close() }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])
  return <>
    <button type="button" aria-label="Open dashboard navigation" aria-haspopup="dialog" onClick={() => ref.current?.showModal()}><Menu size={21} /></button>
    <dialog ref={ref} className="st-drawer" aria-label="Dashboard navigation" onClick={e => {
      if (e.target === ref.current || (e.target instanceof Element && e.target.closest("a"))) ref.current?.close()
    }}>
      <div><div className="st-drawer-head"><strong>Dashboard</strong><button type="button" onClick={() => ref.current?.close()} aria-label="Close dashboard navigation"><X size={21} /></button></div>
      {children}</div>
    </dialog>
  </>
}
