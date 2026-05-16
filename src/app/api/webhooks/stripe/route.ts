import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Types from the new stripe SDK (no longer under Stripe.* namespace)
interface StripeSession {
  id: string
  object: 'checkout.session'
  metadata: Record<string, string> | null
  // line_items only available when expanded
}

interface StripeSubscription {
  id: string
  object: 'subscription'
  metadata: Record<string, string>
}

interface StripeEvent {
  type: string
  data: {
    object: StripeSession | StripeSubscription
  }
}

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripePricePro = process.env.STRIPE_PRICE_PRO

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeSecretKey)

  let event: StripeEvent

  try {
    // constructEvent returns a verified Stripe event object
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret) as unknown as StripeEvent
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // Process async — respond 200 immediately
  void (async () => {
    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as StripeSession

        const userId = session.metadata?.userId
        const tier = session.metadata?.tier

        if (userId && (tier === 'pro' || tier === 'pro_plus')) {
          await db.update(users)
            .set({ tier })
            .where(eq(users.id, userId))
        } else if (userId) {
          // Fallback: resolve tier from line_item price
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items'],
          })
          const priceId = fullSession.line_items?.data[0]?.price?.id
          const resolvedTier = priceId === stripePricePro ? 'pro' : 'pro_plus'
          await db.update(users)
            .set({ tier: resolvedTier })
            .where(eq(users.id, userId))
        }
      } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as StripeSubscription
        const userId = subscription.metadata?.userId
        if (userId) {
          await db.update(users)
            .set({ tier: 'free' })
            .where(eq(users.id, userId))
        }
      }
    } catch (err) {
      console.error('[stripe-webhook] processing error:', err)
    }
  })()

  return NextResponse.json({ received: true })
}
