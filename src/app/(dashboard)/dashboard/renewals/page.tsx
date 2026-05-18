import { getRenewalsData } from './actions'
import { getUserTier } from '@/lib/tier'
import { ensureUserExists } from '@/lib/auth'
import Link from 'next/link'
import type { RenewalContact } from './actions'

function formatDateThai(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit',
  })
}

function daysFromToday(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

function formatPremium(val: string | null): string | null {
  if (!val) return null
  return `฿${Number(val).toLocaleString()}/ปี`
}

// ── Renewal Card ──────────────────────────────────────────

function RenewalCard({ contact, variant }: { contact: RenewalContact; variant: 'overdue' | 'urgent' | 'upcoming' }) {
  const days = daysFromToday(contact.premiumDueDate)
  const premium = formatPremium(contact.annualPremium)

  const badgeStyle = {
    overdue: 'bg-[oklch(95%_0.040_25)] text-[oklch(44%_0.21_25)] border border-[oklch(88%_0.06_25)]',
    urgent: 'bg-[oklch(96%_0.042_80)] text-[oklch(50%_0.18_68)] border border-[oklch(88%_0.08_68)]',
    upcoming: 'bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)] border border-[oklch(88%_0.06_160)]',
  }[variant]

  const dayLabel = variant === 'overdue'
    ? `เลยครบแล้ว ${Math.abs(days)} วัน`
    : days === 0
    ? 'ครบวันนี้'
    : `อีก ${days} วัน`

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[oklch(90%_0.014_254)] last:border-none hover:bg-[oklch(98.5%_0.004_254)] transition-colors">
      <div className="w-9 h-9 rounded-xl bg-[oklch(93%_0.04_265)] flex items-center justify-center text-[13px] font-800 text-[oklch(42%_0.20_265)] shrink-0">
        {contact.name.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-600 text-[oklch(18%_0.012_254)] truncate">{contact.name}</span>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-600 ${badgeStyle}`}>{dayLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[oklch(60%_0.016_254)]">
          {contact.insuranceCompany && <span>{contact.insuranceCompany}</span>}
          {premium && <><span>·</span><span className="font-600 text-[oklch(42%_0.17_160)]">{premium}</span></>}
          <span>·</span>
          <span>{formatDateThai(contact.premiumDueDate)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)] hover:bg-[oklch(90%_0.055_160)] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
        )}
        <Link
          href={`/dashboard/contacts/${contact.id}`}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[oklch(90%_0.014_254)] bg-white text-[oklch(55%_0.020_254)] hover:bg-[oklch(96%_0.010_265)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────

function Section({
  title,
  count,
  contacts,
  variant,
  accent,
}: {
  title: string
  count: number
  contacts: RenewalContact[]
  variant: 'overdue' | 'urgent' | 'upcoming'
  accent: string
}) {
  return (
    <div className="rounded-lg border border-[oklch(90%_0.014_254)] bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[oklch(90%_0.014_254)]">
        <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">{title}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-700 ${accent}`}>{count}</span>
      </div>
      {contacts.length === 0 ? (
        <div className="px-4 py-6 text-center text-[12px] text-[oklch(68%_0.016_254)]">ไม่มีในช่วงนี้</div>
      ) : (
        contacts.map(c => <RenewalCard key={c.id} contact={c} variant={variant} />)
      )}
    </div>
  )
}

// ── Upgrade Gate ──────────────────────────────────────────

function UpgradeGate() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[oklch(96%_0.042_80)] flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(50% 0.18 68)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <h2 className="text-[18px] font-800 text-[oklch(18%_0.012_254)] mb-2">วันนี้ต้องตามใคร</h2>
      <p className="text-[13px] text-[oklch(55%_0.020_254)] mb-1 max-w-xs">ดูลูกค้าที่ใกล้ครบกำหนดเบี้ยประกัน แบ่งเป็น: เลยกำหนด / ด่วน 30 วัน / ใกล้ถึง 90 วัน</p>
      <p className="text-[12px] text-[oklch(65%_0.016_254)] mb-6">ฟีเจอร์นี้สำหรับ Pro ขึ้นไป</p>
      <Link
        href="/dashboard/upgrade"
        className="rounded-lg bg-[oklch(52%_0.245_265)] px-6 py-2.5 text-[13px] font-700 text-white hover:bg-[oklch(46%_0.245_265)] transition-colors"
      >
        อัปเกรด Pro →
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────

export default async function RenewalsPage() {
  const userId = await ensureUserExists()
  if (!userId) return null

  const tier = await getUserTier(userId)

  if (tier === 'free') {
    return <UpgradeGate />
  }

  const data = await getRenewalsData()
  const total = data.overdue.length + data.urgent.length + data.upcoming.length

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="mb-5">
        <h1 className="text-[20px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">วันนี้ต้องตามใคร</h1>
        <p className="text-[12px] text-[oklch(60%_0.016_254)] mt-0.5">
          {total === 0 ? 'ไม่มีลูกค้าที่ต้องติดตามเบี้ย' : `${total} รายชื่อที่ต้องดูแล`}
        </p>
      </div>

      <div className="space-y-4">
        <Section
          title="เลยกำหนด"
          count={data.overdue.length}
          contacts={data.overdue}
          variant="overdue"
          accent="bg-[oklch(95%_0.040_25)] text-[oklch(44%_0.21_25)]"
        />
        <Section
          title="ด่วน — ภายใน 30 วัน"
          count={data.urgent.length}
          contacts={data.urgent}
          variant="urgent"
          accent="bg-[oklch(96%_0.042_80)] text-[oklch(50%_0.18_68)]"
        />
        <Section
          title="ใกล้ถึง — 31-90 วัน"
          count={data.upcoming.length}
          contacts={data.upcoming}
          variant="upcoming"
          accent="bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)]"
        />
      </div>
    </div>
  )
}
