'use client'

import { useState } from 'react'

export function CrmTeaser() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'pro' }),
      })
      const data = await res.json() as { url: string | null }
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[20px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">CRM Dashboard</h1>
          <span className="rounded-full bg-[oklch(93%_0.04_265)] px-2.5 py-0.5 text-[10px] font-700 text-[oklch(42%_0.20_265)] uppercase tracking-wide">Pro</span>
        </div>
        <p className="text-[13px] text-[oklch(55%_0.022_254)]">วัดผลว่าเดือนนี้ทำนัดได้ตามเป้าไหม</p>
      </div>

      {/* Blurred preview */}
      <div className="relative rounded-xl border border-[oklch(90%_0.014_254)] bg-white overflow-hidden mb-6">
        {/* Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-[oklch(88%_0.025_265)] bg-white p-6 text-center shadow-lg max-w-sm mx-4">
            <div className="mb-3 text-[28px]">📊</div>
            <h2 className="text-[15px] font-700 text-[oklch(18%_0.012_254)] mb-1">ปลดล็อก CRM Dashboard</h2>
            <p className="text-[12px] text-[oklch(55%_0.022_254)] mb-4">
              ดูว่าเดือนนี้ทำนัดได้กี่คน มี follow-up รอกี่ราย และ conversion เป็นเท่าไหร่
            </p>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full rounded-lg bg-[oklch(52%_0.245_265)] px-4 py-2.5 text-[13px] font-700 text-white hover:bg-[oklch(46%_0.245_265)] transition-colors disabled:opacity-60"
            >
              {loading ? 'กำลังโหลด...' : 'อัปเกรด Pro ฿149/เดือน →'}
            </button>
            <p className="mt-2 text-[11px] text-[oklch(68%_0.016_254)]">ยกเลิกเมื่อไหรก็ได้</p>
          </div>
        </div>

        {/* Fake blurred content */}
        <div className="p-5 select-none pointer-events-none">
          {/* Summary strip */}
          <div className="grid grid-cols-4 divide-x divide-[oklch(90%_0.014_254)] border border-[oklch(90%_0.014_254)] rounded-lg mb-5 overflow-hidden">
            {[
              { label: 'นัดเดือนนี้', val: '12', sub: '/ 20' },
              { label: 'Follow-up วันนี้', val: '7', sub: 'คน' },
              { label: 'Client ใหม่', val: '2', sub: '/ 2 ✓' },
              { label: 'Conversion', val: '4.4', sub: '%' },
            ].map(m => (
              <div key={m.label} className="p-4">
                <div className="text-[10px] font-600 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)] mb-2">{m.label}</div>
                <div className="text-[22px] font-800 text-[oklch(18%_0.012_254)]">{m.val}<span className="text-[14px] font-500 text-[oklch(68%_0.016_254)]"> {m.sub}</span></div>
              </div>
            ))}
          </div>
          {/* Fake follow-up rows */}
          <div className="rounded-lg border border-[oklch(90%_0.014_254)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[oklch(90%_0.014_254)] bg-white">
              <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">Follow-up วันนี้</span>
            </div>
            {['นายก สมใจ — ค้าง 3 วัน', 'นางข ดีงาม — ค้าง 1 วัน', 'นายค วิจิตร — วันนี้'].map(name => (
              <div key={name} className="flex items-center gap-3 px-4 py-3 border-b border-[oklch(90%_0.014_254)] last:border-none">
                <div className="w-8 h-8 rounded-lg bg-[oklch(93%_0.04_265)]" />
                <div className="flex-1">
                  <div className="h-3 w-40 rounded bg-[oklch(92%_0.010_254)]" />
                </div>
                <div className="h-7 w-20 rounded-md bg-[oklch(92%_0.010_254)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature list */}
      <div className="grid grid-cols-2 gap-3">
        {[
          'วัดนัดต่อเดือนเทียบเป้าหมาย',
          'Follow-up รายวัน — เห็นทันทีว่าค้างใคร',
          'Pipeline Lead → Client พร้อม conversion %',
          'ตั้งเป้าหมายรายเดือนได้เอง',
        ].map(f => (
          <div key={f} className="flex items-center gap-2 text-[12px] text-[oklch(46%_0.022_254)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(52% 0.245 265)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {f}
          </div>
        ))}
      </div>
    </div>
  )
}
