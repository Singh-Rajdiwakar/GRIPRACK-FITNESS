import { settleCheckout, stripe } from "@/lib/payments"

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature) return new Response("Missing signature", { status: 400 })
  if (!secret || !process.env.STRIPE_SECRET_KEY) return new Response("Webhook not configured", { status: 503 })
  let event
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return new Response("Invalid signature", { status: 400 })
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.expired") {
    const session = event.data.object
    if (session.metadata?.app === "griprack") await settleCheckout(session)
  }
  return new Response(null, { status: 200 })
}
