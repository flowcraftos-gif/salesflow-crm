'use client'

import { Contact, FREE_CONTACT_LIMIT } from '@/db/schema'
import { useRouter } from 'next/navigation'
import { useState, useRef, useTransition } from 'react'
import { logCall } from '@/app/(dashboard)/dashboard/contacts/actions'
import { createEvent } from '@/app/(dashboard)/dashboard/calendar/actions'
import { AppointModal } from './appoint-modal'

const STATUS_STYLES: Record<string, string> = {
  Lead:        'bg-[oklch(96%_0.008_254)] text-[oklch(58%_0.02_254)]',
  Prospect:    'bg-[oklch(93%_0.04_265)] text-[oklch(40%_0.20_265)]',
  Appointment: 'bg-[oklch(96%_0.042_80)] text-[oklch(50%_0.18_68)]',
  Client:      'bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)]',
  Proposal:    'bg-[oklch(95%_0.030_300)] text-[oklch(42%_0.20_300)]',
  Lost:        'bg-[oklch(95%_0.040_25)] text-[oklch(44%_0.21_25)]',
}

const DOT_STYLES: Record<string, string> = {
  Lead: 'bg-[oklch(75%_0.015_254)]', Prospect: 'bg-[oklch(52%_0.245_265)]',
  Appointment: 'bg-[oklch(66%_0.175_68)]', Client: 'bg-[oklch(52%_0.175_160)]',
  Proposal: 'bg-[oklch(52%_0.20_300)]', Lost: 'bg-[oklch(54%_0.215_25)]',
}

const AVATAR_COLORS = [
  'bg-[oklch(52%_0.24_265)]', 'bg-[oklch(52%_0.22_220)]',
  'bg-[oklch(52%_0.17_160)]', 'bg-[oklch(60%_0.20_68)]',
  'bg-[oklch(52%_0.22_340)]',
]

const MS_PER_DAY = 86400000

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name.slice(0, 2)
}

function isOverdue(date: string | null, today: string) {
  if (!date) return false
  // Compare YYYY-MM-DD strings directly to avoid UTC/timezone issues
  return date <= today
}

function daysSince(date: string, today: string) {
  return Math.max(0, Math.floor((new Date(today).getTime() - new Date(date).getTime()) / MS_PER_DAY))
}

export function ContactsTable({
  contacts, filter, tier, totalCount,
}: {
  contacts: Contact[]
  filter: string
  tier: string
  totalCount: number
}) {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState(filter)
  const [appointContact, setAppointContact] = useState<Contact | null>(null)
  const [appointPending, setAppointPending] = useState(false)

  const atLimit = tier === 'free' && totalCount >= FREE_CONTACT_LIMIT
  const today = new Date().toLocaleDateString('en-CA')

  async function handleAppoint(data: { title: string; date: string; time: string }) {
    if (!appointContact) return
    setAppointPending(true)
    try {
      const [h, m] = data.time.split(':').map(Number)
      const [y, mo, d] = data.date.split('-').map(Number)
      const startAt = new Date(y, mo - 1, d, h, m)
      if (isNaN(startAt.getTime())) return
      await createEvent({
        title: data.title.trim() || `นัดพบ ${appointContact.name}`,
        startAt: startAt.toISOString(),
        contactId: appointContact.id,
        contactName: appointContact.name,
      })
      setAppointContact(null)
    } finally {
      setAppointPending(false)
    }
  }

  function applyFilter(f: string) {
    setActiveFilter(f)
    router.push(`/dashboard/contacts?filter=${f}`)
  }

  const tabs = [
    { key: 'all', label: `ทั้งหมด (${totalCount})` },
    { key: 'overdue', label: 'Follow-up วันนี้' },
    { key: 'Prospect', label: 'Prospect' },
    { key: 'Appointment', label: 'Appointment' },
    { key: 'Client', label: 'Client' },
  ]

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(93%_0.04_265)] text-[oklch(52%_0.245_265)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <p className="text-sm font-700 text-[oklch(18%_0.012_254)]">ยังไม่มี Contact</p>
      <p className="mt-1.5 max-w-[240px] text-xs text-[oklch(60%_0.016_254)] leading-relaxed">
        เริ่มเพิ่ม Prospect คนแรกได้เลย — ติดตามทุกขั้นตอนจนปิดการขาย
      </p>
      <button
        onClick={() => router.push('/dashboard/contacts/new')}
        className="mt-5 flex items-center gap-1.5 rounded-md bg-[oklch(52%_0.245_265)] px-4 py-2.5 text-xs font-700 text-white transition-colors hover:bg-[oklch(46%_0.245_265)]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        เพิ่ม Contact แรก
      </button>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[oklch(65%_0.016_254)]">
        <span>หรือ</span>
        <a
          href="/api/contacts/import"
          className="font-600 text-[oklch(52%_0.245_265)] underline underline-offset-2 hover:text-[oklch(40%_0.245_265)] transition-colors"
        >
          Import จาก CSV
        </a>
        <span>ถ้ามีข้อมูลอยู่แล้ว</span>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-5">
      {atLimit && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-[oklch(85%_0.06_265)] bg-[oklch(95%_0.03_265)] px-4 py-3 text-sm">
          <span className="font-semibold text-[oklch(42%_0.20_265)]">
            ถึงขีดจำกัด Free tier แล้ว ({FREE_CONTACT_LIMIT} contacts)
          </span>
          <button className="ml-auto rounded-md bg-[oklch(52%_0.245_265)] px-3 py-1.5 text-xs font-bold text-white">
            อัปเกรด Pro →
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <div className="flex gap-px rounded-lg bg-[oklch(90%_0.014_254)] p-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => applyFilter(t.key)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                activeFilter === t.key
                  ? 'bg-white text-[oklch(18%_0.012_254)] shadow-sm font-semibold'
                  : 'text-[oklch(55%_0.020_254)] hover:text-[oklch(30%_0.015_254)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CsvButtons />
          <button
            onClick={() => router.push('/dashboard/contacts/new')}
            disabled={atLimit}
            className="flex items-center gap-1.5 rounded-md bg-[oklch(52%_0.245_265)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[oklch(46%_0.245_265)] disabled:opacity-50"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="hidden sm:inline">เพิ่ม Contact</span>
            <span className="sm:hidden">เพิ่ม</span>
          </button>
        </div>
      </div>

      {/* Mobile card list (< md) */}
      <div className="md:hidden overflow-hidden rounded-lg border border-[oklch(90%_0.014_254)] bg-white">
        {contacts.length === 0 ? emptyState : contacts.map((c) => {
          const overdue = isOverdue(c.nextFollowUpDate, today)
          const overdueDays = c.nextFollowUpDate ? daysSince(c.nextFollowUpDate, today) : 0
          return (
            <div
              key={c.id}
              onClick={() => router.push(`/dashboard/contacts/${c.id}`)}
              className={`flex items-center gap-3 border-b border-[oklch(90%_0.014_254)] px-4 py-3.5 last:border-none active:bg-[oklch(97%_0.010_254)] ${
                overdue ? 'bg-[oklch(97.5%_0.020_25)]' : ''
              }`}
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[13px] font-800 text-white ${avatarColor(c.name)}`}>
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-600 text-[13px] text-[oklch(18%_0.012_254)] truncate">{c.name}</span>
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-600 ${STATUS_STYLES[c.status] ?? ''}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[c.status] ?? ''}`} />
                    {c.status}
                  </span>
                </div>
                <div className="text-[12px] text-[oklch(55%_0.020_254)]">{c.phone}</div>
                {overdue ? (
                  <div className="text-[11px] font-600 text-[oklch(54%_0.215_25)]">
                    ค้าง {overdueDays} วัน
                  </div>
                ) : c.nextFollowUpDate ? (
                  <div className="text-[11px] text-[oklch(68%_0.016_254)]">
                    Follow-up: {new Date(c.nextFollowUpDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <a
                  href={`tel:${c.phone}`}
                  onClick={async (e) => { e.stopPropagation(); await logCall(c.id, 'reached').catch(() => {}) }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[oklch(85%_0.06_160)] bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)] active:bg-[oklch(92%_0.055_160)]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </a>
                <button
                  onClick={e => { e.stopPropagation(); setAppointContact(c) }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[oklch(85%_0.06_265)] bg-[oklch(96%_0.020_265)] text-[oklch(42%_0.20_265)] active:bg-[oklch(93%_0.04_265)]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* นัดหมาย modal */}
      {appointContact && (
        <AppointModal
          name={appointContact.name}
          onClose={() => setAppointContact(null)}
          onSubmit={handleAppoint}
          pending={appointPending}
        />
      )}

      {/* Desktop table (md+) */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-[oklch(90%_0.014_254)] bg-white">
        {contacts.length === 0 ? emptyState : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[oklch(98.2%_0.006_254)]">
              <tr>
                {['ชื่อ', 'เบอร์โทร', 'Status', 'สินค้าที่สนใจ', 'มูลค่า/ปี', 'Follow-up', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-700 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)] border-b border-[oklch(90%_0.014_254)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const overdue = isOverdue(c.nextFollowUpDate, today)
                const overdueDays = c.nextFollowUpDate ? daysSince(c.nextFollowUpDate, today) : 0
                return (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/dashboard/contacts/${c.id}`)}
                    className={`group cursor-pointer border-b border-[oklch(90%_0.014_254)] last:border-none transition-colors ${
                      overdue
                        ? 'bg-[oklch(97.5%_0.020_25)] hover:bg-[oklch(96%_0.028_25)]'
                        : 'hover:bg-[oklch(98.2%_0.006_254)]'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-800 text-white ${avatarColor(c.name)}`}>
                          {initials(c.name)}
                        </div>
                        <div>
                          <div className="font-600 text-[oklch(18%_0.012_254)]">{c.name}</div>
                          <div className="text-[11px] text-[oklch(68%_0.016_254)]">{c.source ?? '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-500 text-[oklch(18%_0.012_254)]">{c.phone}</div>
                      {c.lineId && <div className="text-[11px] text-[oklch(68%_0.016_254)]">LINE: {c.lineId}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-600 ${STATUS_STYLES[c.status] ?? ''}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[c.status] ?? ''}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[oklch(18%_0.012_254)]">
                      {c.interestedProduct ?? <span className="text-[oklch(68%_0.016_254)]">—</span>}
                    </td>
                    <td className="px-4 py-3 font-600 text-[oklch(18%_0.012_254)]">
                      {c.estimatedValue
                        ? `฿${Number(c.estimatedValue).toLocaleString()}`
                        : <span className="text-[oklch(68%_0.016_254)]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {overdue ? (
                        <span className="text-[11px] font-600 text-[oklch(54%_0.215_25)]">
                          ค้างนาน {overdueDays} วัน
                        </span>
                      ) : c.nextFollowUpDate ? (
                        <span className="text-xs text-[oklch(55%_0.020_254)]">
                          {new Date(c.nextFollowUpDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-[oklch(75%_0.012_254)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1 rounded-md border border-[oklch(85%_0.06_160)] bg-[oklch(95%_0.038_160)] px-2 py-1 text-[11px] font-600 text-[oklch(42%_0.17_160)] hover:bg-[oklch(92%_0.055_160)] transition-colors"
                          onClick={async (e) => { e.stopPropagation(); window.location.href = `tel:${c.phone}`; await logCall(c.id, 'reached').catch(() => {}) }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          โทร
                        </a>
                        <button
                          onClick={e => { e.stopPropagation(); setAppointContact(c) }}
                          className="rounded-md border border-[oklch(85%_0.06_265)] bg-[oklch(96%_0.020_265)] px-2 py-1 text-[11px] font-600 text-[oklch(42%_0.20_265)] hover:bg-[oklch(93%_0.04_265)] transition-colors">
                          นัด
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function CsvButtons() {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const form = new FormData()
    form.append('file', file)
    startTransition(async () => {
      try {
        const res = await fetch('/api/contacts/import', { method: 'POST', body: form })
        const data = await res.json()
        if (!res.ok) setMsg({ text: data.error ?? 'เกิดข้อผิดพลาด', ok: false })
        else { setMsg({ text: `นำเข้า ${data.inserted} รายการ (ข้าม ${data.skipped} ซ้ำ)`, ok: true }); router.refresh() }
      } catch { setMsg({ text: 'เกิดข้อผิดพลาด', ok: false }) }
      setTimeout(() => setMsg(null), 4000)
    })
  }

  return (
    <div className="relative hidden md:flex items-center gap-1.5">
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-md border border-[oklch(90%_0.014_254)] px-3 py-1.5 text-[12px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)] transition-colors disabled:opacity-50"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        {isPending ? 'กำลังนำเข้า...' : 'Import'}
      </button>
      <a
        href="/api/contacts/export"
        className="flex items-center gap-1.5 rounded-md border border-[oklch(90%_0.014_254)] px-3 py-1.5 text-[12px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)] transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </a>
      {msg && (
        <span className={`absolute top-full mt-1.5 right-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-600 shadow-sm z-50 ${msg.ok ? 'bg-[oklch(95%_0.038_160)] text-[oklch(32%_0.14_160)]' : 'bg-[oklch(95%_0.04_25)] text-[oklch(40%_0.18_25)]'}`}>
          {msg.text}
        </span>
      )}
    </div>
  )
}
