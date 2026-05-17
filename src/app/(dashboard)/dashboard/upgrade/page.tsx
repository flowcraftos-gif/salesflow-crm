'use client'

import { useState } from 'react'

const FEATURES = [
  { label: 'Contacts', free: '20 รายการ', pro: 'ไม่จำกัด', proPlus: 'ไม่จำกัด',
    hint: 'จำนวน prospect/ลูกค้าที่เก็บได้ในระบบ ตัวแทนส่วนใหญ่มีลูกค้า 50-200 คน Free tier เต็มใน 1-2 สัปดาห์' },
  { label: 'Tasks + Calendar + Board', free: true, pro: true, proPlus: true,
    hint: 'จัดการ to-do รายวัน ดูนัดหมายแบบปฏิทิน และ Kanban board สำหรับติดตามงาน' },
  { label: 'Follow-up tracking + โทร modal', free: true, pro: true, proPlus: true,
    hint: 'กดโทรแล้วบันทึกผลทันที — ติดต่อได้ / ไม่รับสาย / โทรกลับ พร้อมตั้งวันนัด follow-up ครั้งต่อไป ลดโอกาสลืมลูกค้า' },
  { label: 'นัดหมายจาก contact list', free: true, pro: true, proPlus: true,
    hint: 'กดนัดได้เลยจากหน้ารายชื่อ ไม่ต้องไปเปิด Calendar แยก เลือกวันด้วย chip พรุ่งนี้/+3 วัน และเวลาได้ใน 2 tap' },
  { label: 'Export CSV', free: true, pro: true, proPlus: true,
    hint: 'ดาวน์โหลดรายชื่อลูกค้าทั้งหมดเป็น Excel เพื่อ backup หรือส่งต่อทีม' },
  { label: 'Import CSV', free: false, pro: true, proPlus: true,
    hint: 'อัปโหลดรายชื่อจาก Excel ได้ครั้งละหลาย 100 คน ไม่ต้องกรอกทีละคน ประหยัดเวลาชั่วโมง' },
  { label: 'CRM Dashboard', free: true, pro: true, proPlus: true,
    hint: 'ภาพรวมรายเดือน — นัดกี่ครั้ง / follow-up ค้างกี่คน / ปิดดีลได้กี่คน Free ดูได้แค่เดือนปัจจุบัน' },
  { label: 'ย้อนดูย้อนหลัง 12 เดือน', free: false, pro: true, proPlus: true,
    hint: 'เปรียบเทียบ performance เดือนนี้กับเดือนก่อน เห็นแนวโน้ม ใช้วางแผนเป้าหมายปีหน้า' },
  { label: 'ตั้งเป้าหมายรายเดือน', free: false, pro: true, proPlus: true,
    hint: 'กำหนดเป้า เช่น นัด 20 ครั้ง / รับ client ใหม่ 3 คน ระบบแสดง progress bar เทียบเป้าแบบ real-time' },
  { label: 'Insurance templates สำเร็จรูป', free: false, pro: false, proPlus: true,
    hint: 'ฟอร์ม note และ script สำหรับสินค้า AIA ยอดนิยม ช่วยให้ agent ใหม่เริ่มได้เร็วขึ้น' },
  { label: 'รายงานเชิงลึก + export PDF', free: false, pro: false, proPlus: true,
    hint: 'สรุปผลงานรายปี พร้อม export PDF เพื่อนำเสนอหัวหน้าทีมหรือเก็บเป็นพอร์ตโฟลิโอ' },
  { label: 'Priority Support', free: false, pro: false, proPlus: true,
    hint: 'ได้รับการตอบกลับภายใน 4 ชั่วโมง มี dedicated line สำหรับแจ้งปัญหาเร่งด่วน' },
]

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="oklch(52% 0.175 160)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function Cross() {
  return <span className="text-[oklch(80%_0.012_254)]">—</span>
}

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') return <span className="text-[13px] font-600 text-[oklch(18%_0.012_254)]">{value}</span>
  return value ? <Check /> : <Cross />
}

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [notConfigured, setNotConfigured] = useState(false)
  const [openHint, setOpenHint] = useState<string | null>(null)

  async function handleUpgrade(planId: string) {
    setLoading(planId)
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: planId }),
      })
      const data = await res.json() as { url: string | null; error?: string }
      if (!data.url) { setNotConfigured(true); setLoading(null); return }
      window.location.href = data.url
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">เลือกแผนที่เหมาะกับคุณ</h1>
        <p className="mt-1.5 text-[14px] text-[oklch(55%_0.020_254)]">ยกเลิกเมื่อไหรก็ได้ — ไม่มีสัญญาผูกมัด</p>
      </div>

      {notConfigured && (
        <div className="mb-6 rounded-lg border border-[oklch(88%_0.025_265)] bg-[oklch(97%_0.010_254)] px-5 py-4 text-center text-[13px] text-[oklch(46%_0.022_254)]">
          ระบบชำระเงินยังไม่พร้อม — ติดต่อ <a href="mailto:support@salesflow.app" className="font-600 text-[oklch(52%_0.245_265)] underline">support@salesflow.app</a>
        </div>
      )}

      {/* Plan cards */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {/* Free */}
        <div className="rounded-xl border border-[oklch(90%_0.014_254)] bg-white p-4 flex flex-col">
          <div className="mb-3">
            <p className="text-[11px] font-700 uppercase tracking-[0.6px] text-[oklch(65%_0.016_254)]">Free</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[28px] font-800 text-[oklch(18%_0.012_254)]">฿0</span>
              <span className="text-[12px] text-[oklch(65%_0.016_254)]">/เดือน</span>
            </div>
          </div>
          <div className="mt-auto w-full rounded-lg border border-[oklch(90%_0.014_254)] py-2 text-center text-[12px] font-600 text-[oklch(55%_0.020_254)]">
            แผนปัจจุบัน
          </div>
        </div>

        {/* Pro — highlighted */}
        <div className="relative rounded-xl border-2 border-[oklch(52%_0.245_265)] bg-[oklch(97%_0.015_265)] p-4 flex flex-col shadow-sm">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[oklch(52%_0.245_265)] px-3 py-0.5 text-[10px] font-700 uppercase tracking-wider text-white">
            ยอดนิยม
          </div>
          <div className="mb-3">
            <p className="text-[11px] font-700 uppercase tracking-[0.6px] text-[oklch(42%_0.20_265)]">Pro</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[28px] font-800 text-[oklch(18%_0.012_254)]">฿149</span>
              <span className="text-[12px] text-[oklch(65%_0.016_254)]">/เดือน</span>
            </div>
          </div>
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={loading !== null}
            className="mt-auto w-full rounded-lg bg-[oklch(52%_0.245_265)] py-2.5 text-[13px] font-700 text-white hover:bg-[oklch(46%_0.245_265)] transition-colors disabled:opacity-60"
          >
            {loading === 'pro' ? 'กำลังโหลด...' : 'อัปเกรด →'}
          </button>
        </div>

        {/* Pro Plus */}
        <div className="relative rounded-xl border border-[oklch(88%_0.025_265)] bg-white p-4 flex flex-col">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[oklch(68%_0.016_254)] px-3 py-0.5 text-[10px] font-700 uppercase tracking-wider text-white">
            ทีม/รายงาน
          </div>
          <div className="mb-3">
            <p className="text-[11px] font-700 uppercase tracking-[0.6px] text-[oklch(42%_0.022_254)]">Pro Plus</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[28px] font-800 text-[oklch(18%_0.012_254)]">฿299</span>
              <span className="text-[12px] text-[oklch(65%_0.016_254)]">/เดือน</span>
            </div>
          </div>
          <button
            onClick={() => handleUpgrade('pro_plus')}
            disabled={loading !== null}
            className="mt-auto w-full rounded-lg border border-[oklch(52%_0.245_265)] py-2.5 text-[13px] font-700 text-[oklch(52%_0.245_265)] hover:bg-[oklch(96%_0.015_265)] transition-colors disabled:opacity-60"
          >
            {loading === 'pro_plus' ? 'กำลังโหลด...' : 'เลือก Pro Plus →'}
          </button>
        </div>
      </div>

      {/* Hint display — above table */}
      <div className={`mb-3 rounded-lg border px-4 py-3 min-h-[52px] transition-all ${openHint ? 'border-[oklch(85%_0.06_265)] bg-[oklch(97%_0.015_265)]' : 'border-[oklch(90%_0.014_254)] bg-[oklch(98.5%_0.004_254)]'}`}>
        {openHint ? (
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[oklch(52%_0.245_265)] text-[9px] font-800 text-white">?</span>
            <div>
              <p className="text-[12px] font-700 text-[oklch(30%_0.015_254)] mb-0.5">{openHint}</p>
              <p className="text-[12px] text-[oklch(46%_0.018_254)] leading-relaxed">{FEATURES.find(f => f.label === openHint)?.hint}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-[12px] text-[oklch(72%_0.012_254)]">กด ? หน้า feature เพื่อดูคำอธิบาย</p>
        )}
      </div>

      {/* Feature comparison table */}
      <div className="overflow-hidden rounded-xl border border-[oklch(90%_0.014_254)] bg-white">
        {/* Header row */}
        <div className="grid grid-cols-4 border-b border-[oklch(90%_0.014_254)] bg-[oklch(98%_0.006_254)]">
          <div className="px-4 py-3 text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)]">Feature</div>
          <div className="px-4 py-3 text-center text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)]">Free</div>
          <div className="px-4 py-3 text-center text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(42%_0.20_265)]">Pro</div>
          <div className="px-4 py-3 text-center text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(65%_0.016_254)]">Pro Plus</div>
        </div>

        {FEATURES.map((f, i) => (
          <div
            key={f.label}
            className={`grid grid-cols-4 border-b border-[oklch(90%_0.014_254)] last:border-none ${i % 2 === 0 ? 'bg-white' : 'bg-[oklch(99%_0.004_254)]'}`}
          >
            <div className="px-4 py-3 flex items-center gap-1.5">
              <span className="text-[13px] text-[oklch(30%_0.015_254)]">{f.label}</span>
              <button
                type="button"
                onClick={() => setOpenHint(openHint === f.label ? null : f.label)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-800 transition-colors ${openHint === f.label ? 'bg-[oklch(52%_0.245_265)] text-white' : 'bg-[oklch(92%_0.010_254)] text-[oklch(58%_0.018_254)] hover:bg-[oklch(86%_0.014_254)]'}`}
              >
                ?
              </button>
            </div>
            <div className="flex items-center justify-center px-4 py-3"><Cell value={f.free} /></div>
            <div className="flex items-center justify-center px-4 py-3"><Cell value={f.pro} /></div>
            <div className="flex items-center justify-center px-4 py-3"><Cell value={f.proPlus} /></div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-[oklch(68%_0.016_254)]">
        มีคำถาม? ติดต่อ <a href="mailto:support@salesflow.app" className="text-[oklch(52%_0.245_265)] underline">support@salesflow.app</a>
      </p>
    </div>
  )
}
