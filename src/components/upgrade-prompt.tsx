'use client'

import { useState } from 'react'

const SUPPORT_EMAIL = 'support@salesflow.app'

interface Plan {
  id: 'pro' | 'pro_plus'
  name: string
  price: string
  features: string[]
  highlight: boolean
}

const PLANS: Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: '฿199/เดือน',
    features: ['contacts ไม่จำกัด', 'CRM Dashboard + Goal tracking', 'CSV Import/Export', 'ดูย้อนหลัง 12 เดือน'],
    highlight: true,
  },
  {
    id: 'pro_plus',
    name: 'Pro Plus',
    price: '฿349/เดือน',
    features: ['ทุกอย่างใน Pro', 'Insurance templates สำเร็จรูป', 'รายงานเชิงลึก + export PDF', 'Priority Support'],
    highlight: false,
  },
]

export function UpgradePrompt() {
  const [loading, setLoading] = useState<'pro' | 'pro_plus' | null>(null)
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null)

  async function handleUpgrade(planId: 'pro' | 'pro_plus') {
    setLoading(planId)
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: planId }),
      })
      const data = await res.json() as { url: string | null; error?: string }

      if (data.error === 'Stripe not configured' || data.url === null) {
        setStripeConfigured(false)
        setLoading(null)
        return
      }

      if (data.url) {
        window.location.assign(data.url)
      }
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-xl border border-[oklch(88%_0.025_265)] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 text-center">
        <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[oklch(93%_0.04_265)] px-3 py-1 text-[11px] font-700 uppercase tracking-wider text-[oklch(42%_0.20_265)]">
          ถึงขีดจำกัด Free
        </div>
        <h2 className="mt-2 text-[16px] font-700 text-[oklch(18%_0.012_254)]">
          คุณมี contacts ครบ 20 รายการแล้ว
        </h2>
        <p className="mt-1 text-[13px] text-[oklch(55%_0.022_254)]">
          อัปเกรดเพื่อเพิ่ม contacts ได้ไม่จำกัด
        </p>
      </div>

      {stripeConfigured === false ? (
        <div className="rounded-lg border border-[oklch(88%_0.025_265)] bg-[oklch(97%_0.010_254)] px-5 py-4 text-center">
          <p className="text-[13px] text-[oklch(46%_0.022_254)]">
            กรุณาติดต่อผู้ดูแลระบบที่:{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-600 text-[oklch(52%_0.245_265)] underline underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={[
                'relative flex flex-col rounded-xl border p-4 transition-shadow',
                plan.highlight
                  ? 'border-[oklch(52%_0.245_265)] shadow-[0_0_0_1px_oklch(52%_0.245_265)]'
                  : 'border-[oklch(88%_0.025_265)]',
              ].join(' ')}
            >
              {plan.highlight && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[oklch(52%_0.245_265)] px-3 py-0.5 text-[10px] font-700 uppercase tracking-wider text-white">
                  ยอดนิยม
                </div>
              )}
              {plan.id === 'pro_plus' && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[oklch(68%_0.016_254)] px-3 py-0.5 text-[10px] font-700 uppercase tracking-wider text-white">
                  Coming Soon
                </div>
              )}

              <div className="mb-3">
                <p className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">{plan.name}</p>
                <p className="mt-0.5 text-[18px] font-800 text-[oklch(52%_0.245_265)]">
                  {plan.price}
                </p>
              </div>

              <ul className="mb-4 flex-1 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[12px] text-[oklch(46%_0.022_254)]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="oklch(52% 0.245 265)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.id !== 'pro_plus' && void handleUpgrade(plan.id)}
                disabled={loading !== null || plan.id === 'pro_plus'}
                className={[
                  'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-700 transition-all',
                  plan.highlight
                    ? 'bg-[oklch(52%_0.245_265)] text-white hover:bg-[oklch(46%_0.245_265)] disabled:opacity-60'
                    : 'border border-[oklch(52%_0.245_265)] text-[oklch(52%_0.245_265)] hover:bg-[oklch(96%_0.015_265)] disabled:opacity-60',
                ].join(' ')}
              >
                {loading === plan.id ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    กำลังโหลด...
                  </>
                ) : (
                  'อัปเกรด'
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
