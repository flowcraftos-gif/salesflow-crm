import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

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
  const tierLabel = priceId === 'pro' ? 'pro' : 'pro_plus'

  // Dynamic import stripe to avoid build error when keys not present
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeSecretKey)

  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${origin}/dashboard/contacts?upgraded=true`,
    cancel_url: `${origin}/dashboard/contacts`,
    metadata: {
      userId,
      tier: tierLabel,
    },
  })

  return NextResponse.json({ url: session.url })
}
