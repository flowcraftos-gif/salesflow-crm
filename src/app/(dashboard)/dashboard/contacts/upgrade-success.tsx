'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function UpgradeSuccessHandler({ tier }: { tier: string }) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      router.refresh()
      setVisible(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [router])

  if (!visible) return null

  const label = tier === 'pro_plus' ? 'Pro+' : 'Pro'

  return (
    <div style={{
      position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
      background: 'oklch(95% 0.038 160)', border: '1px solid oklch(82% 0.08 160)',
      borderRadius: '12px', padding: '12px 16px', maxWidth: '320px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 4px 16px oklch(40% 0.10 160 / 0.18)',
    }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '999px', background: 'oklch(52% 0.175 160)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'oklch(28% 0.10 160)', marginBottom: '1px' }}>
          อัปเกรดเป็น {label} สำเร็จ
        </p>
        <p style={{ fontSize: '11px', color: 'oklch(42% 0.10 160)' }}>
          กำลังอัปเดตบัญชีของคุณ...
        </p>
      </div>
    </div>
  )
}
