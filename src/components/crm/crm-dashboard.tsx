'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { setCrmGoals } from '@/app/(dashboard)/dashboard/crm/actions'
import { logCall, markFollowUpDone } from '@/app/(dashboard)/dashboard/contacts/actions'
import type { CrmGoals, CrmStats, FollowUpContact, PipelineRow } from '@/app/(dashboard)/dashboard/crm/actions'

// ── Color system (consistent with contacts-table) ─────────

const AVATAR_COLORS = [
  'bg-[oklch(52%_0.24_265)]',
  'bg-[oklch(52%_0.22_220)]',
  'bg-[oklch(52%_0.17_160)]',
  'bg-[oklch(60%_0.20_68)]',
  'bg-[oklch(52%_0.22_340)]',
]

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(name: string): string {
  return name.slice(0, 2)
}

const STAGE_DOT_COLORS: Record<string, string> = {
  Lead:        'bg-[oklch(75%_0.015_254)]',
  Prospect:    'bg-[oklch(52%_0.245_265)]',
  Appointment: 'bg-[oklch(66%_0.175_68)]',
  Proposal:    'bg-[oklch(52%_0.20_300)]',
  Client:      'bg-[oklch(52%_0.175_160)]',
  Lost:        'bg-[oklch(54%_0.215_25)]',
}

const STAGE_BAR_COLORS: Record<string, string> = {
  Lead:        'bg-[oklch(75%_0.015_254)]',
  Prospect:    'bg-[oklch(52%_0.245_265)]',
  Appointment: 'bg-[oklch(66%_0.175_68)]',
  Proposal:    'bg-[oklch(52%_0.20_300)]',
  Client:      'bg-[oklch(52%_0.175_160)]',
  Lost:        'bg-[oklch(54%_0.215_25)]',
}

// ── Month helpers ──────────────────────────────────────────

function prevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthThai(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const MONTHS_TH = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ]
  // Convert to Buddhist Era (add 543)
  return `${MONTHS_TH[m - 1]} ${y + 543}`
}

// ── Pipeline bar max ───────────────────────────────────────

function maxPipelineCount(pipeline: PipelineRow[]): number {
  return Math.max(1, ...pipeline.map(p => p.count))
}

// ── SVG Icons ─────────────────────────────────────────────

function PhoneIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

function ChevLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function ChevRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

// ── Goal Panel ────────────────────────────────────────────

function GoalPanel({
  goals,
  onClose,
}: {
  goals: CrmGoals
  onClose: () => void
}) {
  const [values, setValues] = useState<CrmGoals>({ ...goals })
  const [pending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await setCrmGoals(values)
      onClose()
    })
  }

  function field(
    label: string,
    key: keyof CrmGoals,
    unit: string,
  ) {
    return (
      <div className="flex items-center justify-between gap-4">
        <label className="text-[13px] text-[oklch(46%_0.022_254)]">
          {label}
          <span className="ml-1 text-[11px] text-[oklch(68%_0.016_254)]">({unit})</span>
        </label>
        <input
          type="number"
          min={0}
          max={999}
          value={values[key]}
          onChange={e => setValues(prev => ({ ...prev, [key]: Math.max(0, Number(e.target.value)) }))}
          className="w-20 rounded-md border border-[oklch(90%_0.014_254)] bg-white px-2.5 py-1.5 text-right text-sm font-600 text-[oklch(18%_0.012_254)] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-2 focus:ring-[oklch(92%_0.040_265)]"
        />
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg border border-[oklch(90%_0.014_254)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">ตั้งเป้าหมาย</span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-[oklch(68%_0.016_254)] hover:bg-[oklch(93%_0.008_254)] hover:text-[oklch(18%_0.012_254)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="space-y-3">
        {field('นัดหมาย/เดือน', 'appointmentsPerMonth', 'ครั้ง')}
        {field('Client ใหม่/เดือน', 'newClientsPerMonth', 'คน')}
        {field('Follow-up/วัน', 'followUpsPerDay', 'คน')}
        {field('Contact ใหม่/เดือน', 'newContactsPerMonth', 'คน')}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-[oklch(52%_0.245_265)] px-4 py-1.5 text-[13px] font-700 text-white transition hover:bg-[oklch(46%_0.245_265)] disabled:opacity-60"
        >
          {pending ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button
          onClick={onClose}
          className="rounded-md border border-[oklch(90%_0.014_254)] px-3 py-1.5 text-[13px] font-600 text-[oklch(46%_0.022_254)] transition hover:border-[oklch(84%_0.018_254)] hover:text-[oklch(18%_0.012_254)]"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  )
}

// ── Follow-up Row ─────────────────────────────────────────

function FollowUpRow({ contact }: { contact: FollowUpContact }) {
  const [pending, startTransition] = useTransition()
  const isOverdue = contact.daysOverdue > 0

  function handlePlusOneDay() {
    startTransition(async () => {
      try {
        await logCall(contact.id, 'no_answer')
      } catch (err) {
        console.error('handlePlusOneDay failed:', err)
      }
    })
  }

  function handleDone() {
    startTransition(async () => {
      try {
        await markFollowUpDone(contact.id)
      } catch (err) {
        console.error('handleDone failed:', err)
      }
    })
  }

  return (
    <div className={`flex items-center gap-3 border-b border-[oklch(90%_0.014_254)] px-4 py-3 last:border-none transition-colors ${
      isOverdue
        ? 'bg-[oklch(98.5%_0.018_25)] hover:bg-[oklch(97%_0.025_25)]'
        : 'hover:bg-[oklch(98.2%_0.006_254)]'
    } ${pending ? 'opacity-50' : ''}`}>
      {/* Avatar */}
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-800 text-white ${avatarColor(contact.name)}`}>
        {initials(contact.name)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-600 text-[oklch(18%_0.012_254)]">{contact.name}</div>
        {isOverdue ? (
          <div className="text-[11px] font-600 text-[oklch(54%_0.215_25)]">
            ค้าง {contact.daysOverdue} วัน · {contact.status}
          </div>
        ) : (
          <div className="text-[11px] text-[oklch(68%_0.016_254)]">
            วันนี้ · {contact.status}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <a
          href={`tel:${contact.phone}`}
          onClick={() => logCall(contact.id, 'reached')}
          className="flex items-center gap-1 rounded-md border border-[oklch(85%_0.06_160)] px-2 py-1 text-[11px] font-600 text-[oklch(42%_0.17_160)] transition-colors hover:bg-[oklch(95%_0.038_160)] hover:border-[oklch(52%_0.175_160)]"
        >
          <PhoneIcon />
          โทร
        </a>
        <button
          onClick={handlePlusOneDay}
          disabled={pending}
          className="rounded-md border border-[oklch(90%_0.014_254)] px-2 py-1 text-[11px] font-600 text-[oklch(55%_0.020_254)] transition-colors hover:border-[oklch(84%_0.018_254)] hover:text-[oklch(18%_0.012_254)] disabled:opacity-50"
        >
          +1 วัน
        </button>
        <button
          onClick={handleDone}
          disabled={pending}
          className="rounded-md border border-[oklch(92%_0.040_265)] px-2 py-1 text-[11px] font-600 text-[oklch(52%_0.245_265)] transition-colors hover:bg-[oklch(96%_0.020_265)] hover:border-[oklch(52%_0.245_265)] disabled:opacity-50"
        >
          Done
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────

export function CrmDashboard({
  stats,
  goals,
  month,
  tier = 'free',
}: {
  stats: CrmStats
  goals: CrmGoals
  month: string
  tier?: string
}) {
  const router = useRouter()
  const isPro = tier !== 'free'
  const [showGoalPanel, setShowGoalPanel] = useState(false)

  const apptPct = stats.appointmentsGoal > 0
    ? Math.min(100, Math.round((stats.appointmentsDone / stats.appointmentsGoal) * 100))
    : 0
  const clientsMet = stats.newClientsThisMonth >= stats.clientsGoal

  const maxCount = maxPipelineCount(stats.pipeline)
  const FOLLOW_UP_VISIBLE = 4
  const visibleFollowUps = stats.followUpList.slice(0, FOLLOW_UP_VISIBLE)
  const hiddenCount = stats.followUpList.length - FOLLOW_UP_VISIBLE

  const pipelineTotal = stats.pipeline.reduce((s, r) => s + r.count, 0)

  return (
    <div className="p-4 md:p-5 max-w-[1100px]">

      {/* Free tier upgrade banner */}
      {!isPro && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-[oklch(85%_0.06_265)] bg-[oklch(96%_0.020_265)] px-4 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(42% 0.20 265)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <p className="flex-1 text-[12px] text-[oklch(42%_0.20_265)]">
            ดู Dashboard ได้เดือนปัจจุบันเท่านั้น — <span className="font-700">อัปเกรด Pro</span> เพื่อย้อนดู 12 เดือน + ตั้งเป้าหมาย
          </p>
          <Link href="/dashboard/contacts" className="shrink-0 rounded-md bg-[oklch(52%_0.245_265)] px-3 py-1 text-[11px] font-700 text-white hover:bg-[oklch(46%_0.245_265)] transition-colors">
            อัปเกรด ฿199 →
          </Link>
        </div>
      )}

      {/* Month navigation bar */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex-1">
          <span className="text-[16px] font-700 tracking-tight text-[oklch(18%_0.012_254)]">
            {formatMonthThai(month)}
          </span>
          <span className="ml-2 text-[12px] text-[oklch(68%_0.016_254)]">
            เป้า: นัด {goals.appointmentsPerMonth} · Client {goals.newClientsPerMonth} คน
          </span>
        </div>

        <button
          onClick={() => isPro && router.push(`/dashboard/crm?month=${prevMonth(month)}`)}
          disabled={!isPro}
          title={!isPro ? 'Pro feature' : undefined}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${isPro ? 'border-[oklch(90%_0.014_254)] bg-white text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)]' : 'border-[oklch(90%_0.014_254)] bg-[oklch(97%_0.006_254)] text-[oklch(75%_0.010_254)] cursor-not-allowed'}`}
        >
          <ChevLeft />
        </button>
        <button
          onClick={() => isPro && router.push(`/dashboard/crm?month=${nextMonth(month)}`)}
          disabled={!isPro}
          title={!isPro ? 'Pro feature' : undefined}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${isPro ? 'border-[oklch(90%_0.014_254)] bg-white text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)]' : 'border-[oklch(90%_0.014_254)] bg-[oklch(97%_0.006_254)] text-[oklch(75%_0.010_254)] cursor-not-allowed'}`}
        >
          <ChevRight />
        </button>
        <button
          onClick={() => isPro ? setShowGoalPanel(v => !v) : undefined}
          disabled={!isPro}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-600 transition-colors ${isPro ? 'border-[oklch(90%_0.014_254)] bg-white text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)]' : 'border-[oklch(90%_0.014_254)] bg-[oklch(97%_0.006_254)] text-[oklch(72%_0.010_254)] cursor-not-allowed'}`}
        >
          {!isPro && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          )}
          ตั้งเป้า
          {!isPro && <span className="text-[10px] font-700 text-[oklch(52%_0.245_265)]">Pro</span>}
        </button>
      </div>

      {/* Inline goal panel */}
      {showGoalPanel && (
        <GoalPanel goals={goals} onClose={() => setShowGoalPanel(false)} />
      )}

      {/* Summary strip — 2 cols on mobile, 4 on desktop */}
      <div className="mb-5 grid grid-cols-2 md:grid-cols-4 overflow-hidden rounded-lg border border-[oklch(90%_0.014_254)] bg-white">

        {/* Cell 1: นัดเดือนนี้ */}
        <div className="relative border-r border-b md:border-b-0 border-[oklch(90%_0.014_254)] px-4 md:px-5 py-3.5 md:py-4">
          <div className="mb-2 text-[11px] font-600 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)]">
            นัดเดือนนี้
          </div>
          <div className="text-[22px] font-800 leading-none tracking-tight text-[oklch(18%_0.012_254)]">
            {stats.appointmentsDone}
            <span className="ml-1 text-[14px] font-500 text-[oklch(68%_0.016_254)]">
              / {stats.appointmentsGoal}
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-[oklch(68%_0.016_254)]">
            {stats.appointmentsGoal > stats.appointmentsDone
              ? `ขาดอีก ${stats.appointmentsGoal - stats.appointmentsDone} นัด`
              : 'ครบเป้าแล้ว'}
          </div>
          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[oklch(90%_0.014_254)]">
            <div
              className="h-full bg-[oklch(52%_0.245_265)] transition-all"
              style={{ width: `${apptPct}%` }}
            />
          </div>
        </div>

        {/* Cell 2: Follow-up วันนี้ */}
        <div className="border-b md:border-b-0 md:border-r border-[oklch(90%_0.014_254)] px-4 md:px-5 py-3.5 md:py-4">
          <div className="mb-2 text-[11px] font-600 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)]">
            Follow-up วันนี้
          </div>
          <div className={`text-[22px] font-800 leading-none tracking-tight ${
            stats.followUpToday > 0
              ? 'text-[oklch(54%_0.215_25)]'
              : 'text-[oklch(18%_0.012_254)]'
          }`}>
            {stats.followUpToday}
          </div>
          <div className="mt-1.5 text-[11px] text-[oklch(68%_0.016_254)]">
            {stats.followUpToday > 0 ? 'รอการติดตาม' : 'เรียบร้อยแล้ว'}
          </div>
        </div>

        {/* Cell 3: Client ใหม่ */}
        <div className="border-r border-[oklch(90%_0.014_254)] px-4 md:px-5 py-3.5 md:py-4">
          <div className="mb-2 text-[11px] font-600 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)]">
            Client ใหม่
          </div>
          <div className={`text-[22px] font-800 leading-none tracking-tight ${
            clientsMet
              ? 'text-[oklch(52%_0.175_160)]'
              : 'text-[oklch(18%_0.012_254)]'
          }`}>
            {stats.newClientsThisMonth}
            <span className="ml-1 text-[14px] font-500 text-[oklch(68%_0.016_254)]">
              / {stats.clientsGoal}
            </span>
            {clientsMet && (
              <span className="ml-1.5 text-[14px] text-[oklch(52%_0.175_160)]">✓</span>
            )}
          </div>
          <div className="mt-1.5 text-[11px] text-[oklch(68%_0.016_254)]">
            {clientsMet ? 'ครบเป้าแล้ว' : `ขาดอีก ${stats.clientsGoal - stats.newClientsThisMonth} คน`}
          </div>
        </div>

        {/* Cell 4: Conversion */}
        <div className="px-4 md:px-5 py-3.5 md:py-4">
          <div className="mb-2 text-[11px] font-600 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)]">
            Conversion
          </div>
          <div className="text-[22px] font-800 leading-none tracking-tight text-[oklch(18%_0.012_254)]">
            {stats.conversionRate.toFixed(1)}
            <span className="ml-0.5 text-[14px] font-500 text-[oklch(68%_0.016_254)]">%</span>
          </div>
          <div className="mt-1.5 text-[11px] text-[oklch(68%_0.016_254)]">Lead ถึง Client</div>
        </div>
      </div>

      {/* Follow-up + Pipeline grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-4">

        {/* Follow-up panel */}
        <div className="overflow-hidden rounded-lg border border-[oklch(90%_0.014_254)] bg-white">
          <div className="flex items-baseline justify-between border-b border-[oklch(90%_0.014_254)] px-4 py-3.5">
            <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">
              Follow-up วันนี้
            </span>
            <span className="text-[11px] text-[oklch(68%_0.016_254)]">
              {stats.followUpToday} คน
            </span>
          </div>

          {stats.followUpList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-2 text-[13px] font-600 text-[oklch(52%_0.175_160)]">เรียบร้อย</div>
              <div className="text-[11px] text-[oklch(68%_0.016_254)]">ไม่มี follow-up ค้างวันนี้</div>
            </div>
          ) : (
            <>
              {visibleFollowUps.map(contact => (
                <FollowUpRow key={contact.id} contact={contact} />
              ))}
              {hiddenCount > 0 && (
                <Link
                  href="/dashboard/contacts?filter=overdue"
                  className="block px-4 py-2.5 text-[12px] font-600 text-[oklch(52%_0.245_265)] hover:bg-[oklch(96%_0.020_265)]"
                >
                  ดูทั้งหมด {stats.followUpList.length} คน →
                </Link>
              )}
            </>
          )}
        </div>

        {/* Pipeline panel */}
        <div className="overflow-hidden rounded-lg border border-[oklch(90%_0.014_254)] bg-white">
          <div className="flex items-baseline justify-between border-b border-[oklch(90%_0.014_254)] px-4 py-3.5">
            <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">
              Pipeline {formatMonthThai(month).split(' ').slice(0, 1).join('')}{' '}
              {month.split('-')[0]}
            </span>
            <span className="text-[11px] text-[oklch(68%_0.016_254)]">
              {pipelineTotal} contacts ทั้งหมด
            </span>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[oklch(98.2%_0.006_254)]">
                {(['Stage', 'จำนวน', 'Conversion', 'สัดส่วน'] as const).map(h => (
                  <th
                    key={h}
                    className="border-b border-[oklch(90%_0.014_254)] px-4 py-2.5 text-left text-[10px] font-700 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.pipeline.map(row => {
                const barPct = maxCount > 0 ? Math.round((row.count / maxCount) * 100) : 0
                return (
                  <tr key={row.stage} className="border-b border-[oklch(90%_0.014_254)] last:border-none">
                    {/* Stage */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-600 text-[oklch(18%_0.012_254)]">
                        <span className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${STAGE_DOT_COLORS[row.stage] ?? 'bg-[oklch(75%_0.015_254)]'}`} />
                        <span className="text-[13px]">{row.stage}</span>
                      </span>
                    </td>

                    {/* Count */}
                    <td className="px-4 py-3">
                      <span className={`text-[18px] font-800 ${
                        row.stage === 'Client'
                          ? 'text-[oklch(52%_0.175_160)]'
                          : 'text-[oklch(18%_0.012_254)]'
                      }`}>
                        {row.count}
                      </span>
                    </td>

                    {/* Conversion */}
                    <td className="px-4 py-3">
                      {row.conversionPct !== null ? (
                        <span className="text-[12px] font-600 text-[oklch(52%_0.175_160)]">
                          {row.conversionPct}%
                        </span>
                      ) : (
                        <span className="text-[12px] text-[oklch(68%_0.016_254)]">—</span>
                      )}
                    </td>

                    {/* Bar */}
                    <td className="w-40 px-4 py-3">
                      <div className="h-[4px] overflow-hidden rounded-sm bg-[oklch(90%_0.014_254)]">
                        <div
                          className={`h-full rounded-sm ${STAGE_BAR_COLORS[row.stage] ?? 'bg-[oklch(75%_0.015_254)]'} transition-all`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}

              {stats.pipeline.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[12px] text-[oklch(68%_0.016_254)]">
                    ยังไม่มีข้อมูล Pipeline
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
