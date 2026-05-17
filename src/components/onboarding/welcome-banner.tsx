'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useSyncExternalStore } from 'react'

const DISMISSED_KEY = 'sf_onboarding_dismissed'
const CRM_VISITED_KEY = 'sf_crm_visited'
const ONBOARDING_EVENT = 'sf_onboarding_changed'

type Step = {
  label: string
  completed: boolean
}

function subscribe(callback: () => void) {
  window.addEventListener(ONBOARDING_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(ONBOARDING_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function getDismissedSnapshot() {
  return localStorage.getItem(DISMISSED_KEY) === 'true'
}

function getCrmVisitedSnapshot() {
  return localStorage.getItem(CRM_VISITED_KEY) === 'true'
}

function getServerSnapshot() {
  return true
}

export function WelcomeBanner({ contactCount }: { contactCount: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTour = searchParams.get('tour') === '1'
  const dismissed = useSyncExternalStore(subscribe, getDismissedSnapshot, getServerSnapshot)
  const crmVisited = useSyncExternalStore(subscribe, getCrmVisitedSnapshot, () => false)

  // Don't show if dismissed (and not forced by ?tour=1)
  if (dismissed && !isTour) return null
  if (!isTour && contactCount > 0) return null

  const steps: Step[] = [
    { label: 'สร้างบัญชี', completed: true },
    { label: 'เพิ่ม Contact แรก', completed: contactCount > 0 },
    { label: 'ตั้งเป้าหมาย', completed: crmVisited },
  ]

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    window.dispatchEvent(new Event(ONBOARDING_EVENT))
  }

  function goToAddContact() {
    router.push('/dashboard/contacts/new')
  }

  return (
    <div className="mx-5 mt-5 overflow-hidden rounded-xl border border-[oklch(88%_0.06_265)] bg-[oklch(97.5%_0.025_265)]">
      <div className="flex items-start gap-5 px-5 py-4">
        {/* Left: text + steps */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[oklch(52%_0.245_265)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2 className="text-sm font-700 text-[oklch(18%_0.012_254)]">
              ยินดีต้อนรับสู่ SalesFlow CRM
            </h2>
          </div>
          <p className="mb-4 text-xs text-[oklch(55%_0.020_254)]">
            3 ขั้นตอนเริ่มต้นใช้งาน
          </p>

          {/* Steps */}
          <div className="flex items-center gap-2 flex-wrap">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-700 ${
                      step.completed
                        ? 'bg-[oklch(52%_0.175_160)] text-white'
                        : 'border-2 border-[oklch(80%_0.04_265)] bg-white text-[oklch(65%_0.016_254)]'
                    }`}
                  >
                    {step.completed ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-500 ${
                      step.completed
                        ? 'text-[oklch(42%_0.17_160)] line-through decoration-[oklch(65%_0.016_254)]'
                        : i === steps.findIndex(s => !s.completed)
                          ? 'text-[oklch(18%_0.012_254)] font-600'
                          : 'text-[oklch(68%_0.016_254)]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="h-px w-6 bg-[oklch(84%_0.025_265)] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTAs */}
        <div className="flex flex-shrink-0 items-center gap-2 pt-0.5">
          <button
            onClick={goToAddContact}
            className="flex items-center gap-1.5 rounded-md bg-[oklch(52%_0.245_265)] px-4 py-2 text-xs font-700 text-white transition-colors hover:bg-[oklch(46%_0.245_265)]"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            เพิ่ม Contact แรก
          </button>
          <button
            onClick={dismiss}
            className="rounded-md px-3 py-2 text-xs font-500 text-[oklch(55%_0.020_254)] transition-colors hover:bg-[oklch(90%_0.014_254)] hover:text-[oklch(30%_0.015_254)]"
          >
            ข้ามไปก่อน
          </button>
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 rounded-md p-1 text-[oklch(68%_0.016_254)] transition-colors hover:bg-[oklch(88%_0.04_265)] hover:text-[oklch(30%_0.015_254)]"
          aria-label="ปิด"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[oklch(90%_0.025_265)]">
        <div
          className="h-full bg-[oklch(52%_0.245_265)] transition-all duration-500"
          style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
