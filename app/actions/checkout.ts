"use server"

import { and, eq } from "drizzle-orm"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import type { ActionResult } from "@/components/action-form"
import { requireProfile } from "@/lib/auth"
import { db } from "@/lib/db"
import { pendingCheckouts } from "@/lib/db/schema"
import { checkout, CheckoutError, settleCheckout, stripe } from "@/lib/payments"
import { isUuid } from "@/lib/utils"

async function start(kind: "program" | "session", id: string): Promise<ActionResult> {
  const me = await requireProfile()
  if (!isUuid(id)) return { error: "Item not found." }
  let url: string | null
  try {
    url = await checkout(kind, id, me.userId)
  } catch (error) {
    if (error instanceof CheckoutError) return { error: error.message }
    console.error("Stripe checkout failed", error instanceof Error ? error.name : "unknown")
    return { error: "Couldn’t start checkout. Please try again." }
  }
  if (!url) return { error: "This session has already been booked." }
  redirect(url)
}

export async function buyProgram(id: string) {
  return start("program", id)
}

export async function bookSlot(id: string) {
  return start("session", id)
}

export async function manageCheckout(id: string, cancel: boolean): Promise<ActionResult> {
  const me = await requireProfile()
  const [order] = await db.select().from(pendingCheckouts)
    .where(and(eq(pendingCheckouts.sessionId, id), eq(pendingCheckouts.clientId, me.userId)))
  let url: string | null = null
  if (order) {
    try {
      let session = await stripe().checkout.sessions.retrieve(id)
      if (session.status === "open" && cancel) session = await stripe().checkout.sessions.expire(id)
      if (session.status === "open") url = session.url
      else await settleCheckout(session)
    } catch {
      return { error: "Couldn’t update checkout. Refresh and try again." }
    }
  }
  if (url) redirect(url)
  refresh()
}
