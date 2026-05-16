'use client'

import { Contact, CONTACT_STATUSES, FREE_CONTACT_LIMIT } from '@/db/schema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteContact, logCall } from '@/app/(dashboard)/dashboard/contacts/actions'

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

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name.slice(0, 2)
}

function isOverdue(date: string | null) {
  if (!date) return false
  // Compare YYYY-MM-DD strings directly to avoid UTC/timezone issues
  return date <= new Date().toLocaleDateString('en-CA')
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

  const atLimit = tier === 'free' && totalCount >= FREE_CONTACT_LIMIT

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

  return (
    <div className="p-5">
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
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex gap-px rounded-lg bg-[oklch(90%_0.014_254)] p-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => applyFilter(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeFilter === t.key
                  ? 'bg-white text-[oklch(18%_0.012_254)] shadow-sm font-semibold'
                  : 'text-[oklch(55%_0.020_254)] hover:text-[oklch(30%_0.015_254)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard/contacts/new')}
          disabled={atLimit}
          className="ml-auto flex items-center gap-1.5 rounded-md bg-[oklch(52%_0.245_265)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[oklch(46%_0.245_265)] disabled:opacity-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          เพิ่ม Contact
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[oklch(90%_0.014_254)] bg-white">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(93%_0.04_265)] text-[oklch(52%_0.245_265)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <p className="text-sm font-600 text-[oklch(30%_0.015_254)]">ยังไม่มี Contact</p>
            <p className="mt-1 text-xs text-[oklch(65%_0.016_254)]">เพิ่ม Contact แรกเพื่อเริ่มติดตาม</p>
          </div>
        ) : (
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
                const overdue = isOverdue(c.nextFollowUpDate)
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
                    {/* Name */}
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

                    {/* Phone */}
                    <td className="px-4 py-3">
                      <div className="font-500 text-[oklch(18%_0.012_254)]">{c.phone}</div>
                      {c.lineId && <div className="text-[11px] text-[oklch(68%_0.016_254)]">LINE: {c.lineId}</div>}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-600 ${STATUS_STYLES[c.status] ?? ''}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[c.status] ?? ''}`} />
                        {c.status}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3 text-[oklch(18%_0.012_254)]">
                      {c.interestedProduct ?? <span className="text-[oklch(68%_0.016_254)]">—</span>}
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3 font-600 text-[oklch(18%_0.012_254)]">
                      {c.estimatedValue
                        ? `฿${Number(c.estimatedValue).toLocaleString()}`
                        : <span className="text-[oklch(68%_0.016_254)]">—</span>}
                    </td>

                    {/* Follow-up */}
                    <td className="px-4 py-3">
                      {overdue ? (
                        <span className="text-[11px] font-600 text-[oklch(54%_0.215_25)]">
                          ค้างนาน {Math.floor((Date.now() - new Date(c.nextFollowUpDate!).getTime()) / 86400000)} วัน
                        </span>
                      ) : c.nextFollowUpDate ? (
                        <span className="text-xs text-[oklch(55%_0.020_254)]">
                          {new Date(c.nextFollowUpDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-[oklch(75%_0.012_254)]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1 rounded-md border border-[oklch(85%_0.06_160)] bg-[oklch(95%_0.038_160)] px-2 py-1 text-[11px] font-600 text-[oklch(42%_0.17_160)] hover:bg-[oklch(92%_0.055_160)] transition-colors"
                          onClick={() => logCall(c.id, 'reached')}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          โทร
                        </a>
                        <button className="rounded-md border border-[oklch(90%_0.014_254)] px-2 py-1 text-[11px] font-600 text-[oklch(55%_0.020_254)] hover:border-[oklch(52%_0.245_265)] hover:text-[oklch(52%_0.245_265)] transition-colors">
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
