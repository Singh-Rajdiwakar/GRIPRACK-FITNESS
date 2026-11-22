import Stripe from "stripe"
import { and, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { pendingCheckouts, profiles, programs, purchases, slots } from "@/lib/db/schema"

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
type Order = typeof pendingCheckouts.$inferSelect
type Kind = "program" | "session"

let client: Stripe | undefined
export function stripe() {
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { timeout: 10000, maxNetworkRetries: 1 }))
}

export class CheckoutError extends Error {}

function settings(trainerId: string) {
  const fee = process.env.STRIPE_PLATFORM_FEE_PERCENT?.trim()
  const origin = process.env.STRIPE_APP_URL
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !origin || !fee ||
      !/^\d{1,3}(\.\d{1,2})?$/.test(fee) || Number(fee) > 100) {
    throw new CheckoutError("Payments are not configured yet.")
  }
  const url = new URL(origin)
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new CheckoutError("The checkout return URL is not configured.")
  }
  const accounts = JSON.parse(process.env.STRIPE_TRAINER_ACCOUNTS || "{}")
  const destination = accounts?.[trainerId]
  if (typeof destination !== "string" || !/^acct_[a-zA-Z0-9]+$/.test(destination)) {
    throw new CheckoutError("This trainer hasn’t connected a payment account yet.")
  }
  return { origin: url.origin, destination, percent: Number(fee) }
}

// Use the same lock for the checkout action, return URL and webhook. Stripe can
// deliver events more than once or after a buyer has already returned.
async function lockItem(tx: Tx, clientId: string, programId: string | null, slotId: string | null) {
  const key = programId ? `program:${programId}:${clientId}` : `slot:${slotId}`
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`)
}

async function settle(tx: Tx, order: Order, session: Stripe.Checkout.Session) {
  const paid = session.status === "complete" && session.payment_status === "paid"
  if (!paid && session.status !== "expired") return
  if (session.id !== order.sessionId || session.client_reference_id !== order.clientId ||
      session.mode !== "payment" || session.currency !== "usd" || session.amount_total !== order.amountCents) {
    throw new Error("Checkout details do not match the reservation")
  }
  if (order.slotId) {
    const [slot] = await tx.update(slots)
      .set(paid ? { status: "booked", heldUntil: null } : { status: "open", clientId: null, heldUntil: null })
      .where(and(eq(slots.id, order.slotId), eq(slots.clientId, order.clientId), eq(slots.status, "held")))
      .returning({ id: slots.id })
    if (!slot) throw new Error("Checkout slot reservation is missing")
  }
  if (paid) {
    await tx.insert(purchases).values({
      clientId: order.clientId, trainerId: order.trainerId,
      programId: order.programId, slotId: order.slotId,
      amountCents: order.amountCents, kind: order.slotId ? "session" : "program", stripeSessionId: session.id,
    })
  }
  await tx.delete(pendingCheckouts).where(eq(pendingCheckouts.sessionId, session.id))
}

export async function settleCheckout(session: Stripe.Checkout.Session) {
  await db.transaction(async (tx) => {
    const byId = eq(pendingCheckouts.sessionId, session.id)
    const [order] = await tx.select().from(pendingCheckouts).where(byId)
    if (!order) return
    await lockItem(tx, order.clientId, order.programId, order.slotId)
    const [pending] = await tx.select().from(pendingCheckouts).where(byId)
    if (pending) await settle(tx, pending, session)
  })
}

export async function checkout(kind: Kind, itemId: string, clientId: string) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new CheckoutError("Payments are not configured yet.")
  }
  return db.transaction(async (tx) => {
    const programId = kind === "program" ? itemId : null
    const slotId = kind === "session" ? itemId : null
    await lockItem(tx, clientId, programId, slotId)
    const [existing] = await tx.select().from(pendingCheckouts).where(programId
      ? and(eq(pendingCheckouts.programId, programId), eq(pendingCheckouts.clientId, clientId))
      : eq(pendingCheckouts.slotId, itemId))
    if (existing) {
      const session = await stripe().checkout.sessions.retrieve(existing.sessionId)
      if (session.status === "open" && session.url && existing.clientId === clientId) return session.url
      if (session.status !== "expired" && session.payment_status !== "paid") {
        throw new CheckoutError("A checkout is already in progress for this item.")
      }
      await settle(tx, existing, session)
      if (session.payment_status === "paid") {
        // Commit fulfillment even when a different buyer triggered reconciliation.
        return existing.clientId === clientId ? "/library" : null
      }
    }

    let trainerId: string, amount: number, title: string
    const expires = Math.floor(Date.now() / 1000) + 31 * 60
    if (programId) {
      const [p] = await tx.select().from(programs).where(eq(programs.id, programId)).for("share")
      if (!p?.published) throw new CheckoutError("This program is unavailable.")
      const [owned] = await tx.select({ id: purchases.id }).from(purchases)
        .where(and(eq(purchases.programId, programId), eq(purchases.clientId, clientId)))
      if (owned) return "/library"
      trainerId = p.trainerId
      amount = p.priceCents
      title = p.title
    } else {
      const [s] = await tx.select().from(slots).where(eq(slots.id, itemId)).for("update")
      if (!s || s.status === "booked" || (s.status === "held" && (!s.heldUntil || s.heldUntil.getTime() > Date.now()))) {
        throw new CheckoutError("This time is already reserved.")
      }
      if (s.startsAt.getTime() <= expires * 1000) throw new CheckoutError("Choose a later slot to allow time for checkout.")
      const [trainer] = await tx.select().from(profiles).where(eq(profiles.userId, s.trainerId))
      trainerId = s.trainerId
      amount = trainer.sessionPriceCents ?? 0
      title = `1:1 video session with ${trainer.name} · ${s.startsAt.toISOString().slice(0, 16)} UTC`
    }
    if (trainerId === clientId || amount <= 0) throw new CheckoutError("This item cannot be purchased.")
    const { origin, destination, percent } = settings(trainerId)
    const session = await stripe().checkout.sessions.create({
      mode: "payment", allowed_payment_method_types: ["card"], adaptive_pricing: { enabled: false }, expires_at: expires,
      client_reference_id: clientId, metadata: { app: "griprack", kind, itemId },
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: amount, product_data: { name: title } } }],
      payment_intent_data: {
        application_fee_amount: Math.round(amount * percent / 100),
        transfer_data: { destination },
      },
      success_url: origin + "/api/checkout/return?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/library#pending-checkouts",
    })
    if (!session.url) throw new Error("Stripe did not return a Checkout URL")
    await tx.insert(pendingCheckouts).values({ sessionId: session.id, clientId, trainerId, programId, slotId, amountCents: amount })
    if (slotId) await tx.update(slots).set({ status: "held", clientId, heldUntil: new Date(expires * 1000) }).where(eq(slots.id, slotId))
    return session.url
  })
}
