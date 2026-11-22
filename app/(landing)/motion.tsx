"use client"

import { useEffect } from "react"

export function LandingMotion() {
  useEffect(() => {
    const home = document.getElementById("griprack-home")
    if (!home || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-entered", "")
          observer.unobserve(entry.target)
        }
      }
    }, { rootMargin: "0px 0px -4% 0px" })
    home.querySelectorAll("[data-scene]").forEach(scene => observer.observe(scene))
    return () => observer.disconnect()
  }, [])
  return null
}

