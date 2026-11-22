import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { settleCheckout, stripe } from "@/lib/payments"

export async function GET(request: Request) {
  const me = await requireUser()
  const id = new URL(request.url).searchParams.get("session_id")
  if (!id || !/^cs_(test|live)_[a-zA-Z0-9]+$/.test(id)) return new Response("Invalid checkout", { status: 400 })
  const session = await stripe().checkout.sessions.retrieve(id)
  if (session.metadata?.app !== "griprack" || session.client_reference_id !== me.id) {
    return new Response("Checkout not found", { status: 404 })
  }
  await settleCheckout(session)
  redirect("/library")
}
