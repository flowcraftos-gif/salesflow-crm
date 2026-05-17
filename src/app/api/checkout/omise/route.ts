import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

type OmisePlan = 'pro' | 'pro_plus'

const OMISE_AMOUNTS: Record<OmisePlan, number> = {
  pro: 14900,       // ฿149
  pro_plus: 29900,  // ฿299
}

interface OmiseChargeResponse {
  id: string
  object: string
  status: string
  failure_message?: string
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const omiseSecretKey = process.env.OMISE_SECRET_KEY
  if (!omiseSecretKey) {
    return NextResponse.json({ success: false, error: 'Omise not configured' })
  }

  const body = await req.json() as { token?: string; plan?: string }
  const { token, plan } = body

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 })
  }
  if (plan !== 'pro' && plan !== 'pro_plus') {
    return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })
  }

  const amount = OMISE_AMOUNTS[plan as OmisePlan]

  const credentials = Buffer.from(`${omiseSecretKey}:`).toString('base64')

  const response = await fetch('https://api.omise.co/charges', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'thb',
      card: token,
      description: `SalesFlow CRM ${plan === 'pro' ? 'Pro' : 'Pro Plus'} subscription`,
      metadata: {
        userId,
        plan,
      },
    }),
  })

  const charge = await response.json() as OmiseChargeResponse

  if (!response.ok || charge.object === 'error') {
    return NextResponse.json({
      success: false,
      error: charge.failure_message ?? 'Charge failed',
    })
  }

  return NextResponse.json({
    success: true,
    chargeId: charge.id,
  })
}
