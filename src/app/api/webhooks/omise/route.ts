import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

interface OmiseEvent {
  key: string
  data: {
    object: string
    id: string
    status: string
    metadata?: {
      userId?: string
      plan?: string
    }
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.OMISE_WEBHOOK_SECRET

  const body = await req.text()

  // Verify HMAC-SHA1 signature if secret is configured
  if (webhookSecret) {
    const sig = req.headers.get('x-omise-signature')
    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const expected = createHmac('sha1', webhookSecret)
      .update(body)
      .digest('hex')

    if (sig !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  let event: OmiseEvent

  try {
    event = JSON.parse(body) as OmiseEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Process async — respond 200 immediately
  void (async () => {
    try {
      if (event.key === 'charge.complete') {
        const charge = event.data
        if (charge.status === 'successful' && charge.metadata) {
          const { userId, plan } = charge.metadata
          if (userId && (plan === 'pro' || plan === 'pro_plus')) {
            await db.update(users)
              .set({ tier: plan })
              .where(eq(users.id, userId))
          }
        }
      }
    } catch (err) {
      console.error('[omise-webhook] processing error:', err)
    }
  })()

  return NextResponse.json({ received: true })
}
