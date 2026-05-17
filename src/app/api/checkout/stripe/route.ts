import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

type Tier = 'pro' | 'pro_plus'

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due', 'unpaid']

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ url: null, error: 'Unauthorized' }, { status: 401 })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const stripePricePro = process.env.STRIPE_PRICE_PRO
  const stripePriceProPlus = process.env.STRIPE_PRICE_PRO_PLUS

  if (!stripeSecretKey || !stripePricePro || !stripePriceProPlus) {
    return NextResponse.json({ url: null, error: 'Stripe not configured' })
  }

  const body = await req.json() as { priceId?: string }
  const { priceId } = body

  if (priceId !== 'pro' && priceId !== 'pro_plus') {
    return NextResponse.json({ url: null, error: 'Invalid priceId' }, { status: 400 })
  }

  const stripePriceId = priceId === 'pro' ? stripePricePro : stripePriceProPlus
  const tierLabel: Tier = priceId === 'pro' ? 'pro' : 'pro_plus'

  // Dynamic import stripe to avoid build error when keys not present
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeSecretKey)

  const origin = req.headers.get('origin') ?? 'http://localhost:3000'
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || undefined
  const escapedUserId = userId.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

  let customerId: string | undefined
  try {
    const existingCustomers = await stripe.customers.search({
      query: `metadata['clerkUserId']:'${escapedUserId}'`,
      limit: 1,
    })
    customerId = existingCustomers.data[0]?.id
  } catch (err) {
    console.error('[stripe-checkout] customer search failed:', err)
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { clerkUserId: userId },
    })
    customerId = customer.id
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10,
  })
  const existingSubscription = subscriptions.data.find((subscription) =>
    ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)
  )

  if (existingSubscription) {
    const itemId = existingSubscription.items.data[0]?.id
    if (!itemId) {
      return NextResponse.json({ url: null, error: 'Subscription item not found' }, { status: 400 })
    }

    await stripe.subscriptions.update(existingSubscription.id, {
      items: [{ id: itemId, price: stripePriceId }],
      metadata: {
        clerkUserId: userId,
        userId,
        tier: tierLabel,
      },
      proration_behavior: 'create_prorations',
    })

    await db.update(users)
      .set({ tier: tierLabel })
      .where(eq(users.id, userId))

    return NextResponse.json({ url: `${origin}/dashboard/contacts?upgraded=true&tier=${tierLabel}` })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${origin}/dashboard/contacts?upgraded=true&tier=${tierLabel}`,
    cancel_url: `${origin}/dashboard/contacts`,
    metadata: {
      clerkUserId: userId,
      userId,
      tier: tierLabel,
    },
    subscription_data: {
      metadata: {
        clerkUserId: userId,
        userId,
        tier: tierLabel,
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
