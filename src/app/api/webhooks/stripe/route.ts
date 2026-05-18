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
  metadata: Record<string, string> | null
  customer?: string | {
    id?: string
    metadata?: Record<string, string> | null
  } | null
  items?: {
    data?: Array<{
      price?: {
        id?: string
      } | null
    }>
  }
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
  const stripePriceProPlus = process.env.STRIPE_PRICE_PRO_PLUS

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  function tierFromPrice(priceId?: string) {
    if (priceId === stripePricePro) return 'pro'
    if (priceId === stripePriceProPlus) return 'pro_plus'
    return null
  }

  function tierFromMetadata(tier?: string) {
    return tier === 'pro' || tier === 'pro_plus' ? tier : null
  }

  function userIdFromSubscription(subscription: StripeSubscription) {
    if (subscription.metadata?.userId) return subscription.metadata.userId
    if (typeof subscription.customer === 'object') {
      return subscription.customer?.metadata?.clerkUserId ?? subscription.customer?.metadata?.userId ?? null
    }
    return null
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

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as StripeSession

      const userId = session.metadata?.userId
      const tier = tierFromMetadata(session.metadata?.tier)

      if (userId && tier) {
        await db.update(users)
          .set({ tier })
          .where(eq(users.id, userId))
      } else if (userId) {
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items'],
        })
        const priceId = fullSession.line_items?.data[0]?.price?.id
        const resolvedTier = tierFromPrice(priceId)
        if (resolvedTier) {
          await db.update(users)
            .set({ tier: resolvedTier })
            .where(eq(users.id, userId))
        }
      }
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as StripeSubscription
      const userId = userIdFromSubscription(subscription)
      const priceId = subscription.items?.data?.[0]?.price?.id
      const tier = tierFromMetadata(subscription.metadata?.tier) ?? tierFromPrice(priceId)
      if (userId && tier) {
        await db.update(users)
          .set({ tier })
          .where(eq(users.id, userId))
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as StripeSubscription
      const userId = userIdFromSubscription(subscription)
      if (userId) {
        await db.update(users)
          .set({ tier: 'free' })
          .where(eq(users.id, userId))
      }
    }
  } catch (err) {
    console.error('[stripe-webhook] processing error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
