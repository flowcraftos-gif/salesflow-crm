'use client'

import { useState } from 'react'

const DATE_PRESETS = [
  { label: 'พรุ่งนี้', days: 1 },
  { label: '+2 วัน', days: 2 },
  { label: '+3 วัน', days: 3 },
  { label: '+7 วัน', days: 7 },
]

const TIME_PRESETS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '18:00']

function addDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA') // YYYY-MM-DD
}

export function AppointModal({
  name,
  onClose,
  onSubmit,
  pending,
}: {
  name: string
  onClose: () => void
  onSubmit: (data: { title: string; date: string; time: string }) => Promise<void>
  pending: boolean
}) {
  const [title, setTitle] = useState(`นัดพบ ${name}`)
  const [date, setDate] = useState(addDays(1))
  const [time, setTime] = useState('09:00')

  const dateLabel = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })
    : '...'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return
    await onSubmit({ title, date, time })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-700 text-[oklch(18%_0.012_254)]">นัดกับ {name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[oklch(65%_0.016_254)] hover:bg-[oklch(94%_0.010_254)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ชื่อนัด"
            className="w-full rounded-lg border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-3 py-2 text-[13px] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-2 focus:ring-[oklch(93%_0.04_265)]"
          />

          {/* Date presets */}
          <div>
            <p className="mb-2 text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(55%_0.020_254)]">วันที่</p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {DATE_PRESETS.map(({ label, days }) => {
                const v = addDays(days)
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDate(v)}
                    className={`rounded-lg border py-2 text-[12px] font-600 transition-all ${
                      date === v
                        ? 'border-transparent bg-[oklch(52%_0.245_265)] text-white'
                        : 'border-[oklch(90%_0.014_254)] text-[oklch(46%_0.022_254)] hover:border-[oklch(80%_0.020_254)]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-lg border border-[oklch(90%_0.014_254)] px-3 py-2 text-[12px] outline-none focus:border-[oklch(52%_0.245_265)]"
            />
          </div>

          {/* Time chips */}
          <div>
            <p className="mb-2 text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(55%_0.020_254)]">เวลา</p>
            <div className="grid grid-cols-4 gap-2">
              {TIME_PRESETS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`rounded-lg border py-2 text-[12px] font-600 transition-all ${
                    time === t
                      ? 'border-transparent bg-[oklch(52%_0.245_265)] text-white'
                      : 'border-[oklch(90%_0.014_254)] text-[oklch(46%_0.022_254)] hover:border-[oklch(80%_0.020_254)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1">
          <button
            type="submit"
            disabled={pending || !date}
            className="w-full rounded-xl bg-[oklch(52%_0.245_265)] py-3 text-[13px] font-700 text-white transition-colors hover:bg-[oklch(46%_0.245_265)] disabled:opacity-50"
          >
            {pending ? 'กำลังบันทึก...' : `บันทึก — ${dateLabel} ${time}`}
          </button>
          </div>
        </form>
      </div>
    </div>
  )
}
