'use client'

import { useState, useTransition } from 'react'
import { Event } from '@/db/schema'
import { getEvents, createEvent, deleteEvent } from './actions'
import { useRouter } from 'next/navigation'

const DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

function parseMonth(month: string): { year: number; mon: number } {
  const [y, m] = month.split('-').map(Number)
  return { year: y, mon: m - 1 }
}

function buildGrid(year: number, mon: number): (number | null)[] {
  const firstDay = new Date(year, mon, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, mon + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function monthKey(year: number, mon: number) {
  return `${year}-${String(mon + 1).padStart(2, '0')}`
}

interface Props {
  month: string
  initialEvents: Event[]
}

export function CalendarView({ month, initialEvents }: Props) {
  const router = useRouter()
  const { year, mon } = parseMonth(month)
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', startTime: '09:00', endTime: '' })
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const grid = buildGrid(year, mon)

  function navigate(delta: number) {
    const d = new Date(year, mon + delta, 1)
    const key = monthKey(d.getFullYear(), d.getMonth())
    // fetch new month events then navigate
    startTransition(async () => {
      const next = await getEvents(key)
      setEvents(next)
      setSelectedDay(null)
      router.replace(`/dashboard/calendar?month=${key}`, { scroll: false })
    })
  }

  function dayEvents(day: number) {
    return events.filter(e => {
      const d = new Date(e.startAt)
      return d.getFullYear() === year && d.getMonth() === mon && d.getDate() === day
    })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDay || !form.title.trim()) return
    setError('')

    const startAt = new Date(year, mon, selectedDay, ...form.startTime.split(':').map(Number) as [number, number])
    const endAt = form.endTime
      ? new Date(year, mon, selectedDay, ...form.endTime.split(':').map(Number) as [number, number])
      : undefined

    startTransition(async () => {
      try {
        const created = await createEvent({
          title: form.title.trim(),
          startAt: startAt.toISOString(),
          endAt: endAt?.toISOString(),
        })
        setEvents(prev => [...prev, created])
        setForm({ title: '', startTime: '09:00', endTime: '' })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
      }
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEvent(id)
      setEvents(prev => prev.filter(ev => ev.id !== id))
    })
  }

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === mon
  const todayDate = today.getDate()

  return (
    <div className="w-full max-w-3xl px-4 py-4 md:px-5 md:py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">Calendar</h1>
          <p className="text-[13px] text-[oklch(55%_0.020_254)]">{MONTHS_TH[mon]} {year + 543}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            disabled={pending}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[oklch(90%_0.014_254)] text-[oklch(46%_0.022_254)] hover:border-[oklch(80%_0.020_254)] hover:bg-[oklch(97%_0.010_254)] transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={() => {
              const key = monthKey(today.getFullYear(), today.getMonth())
              startTransition(async () => {
                const next = await getEvents(key)
                setEvents(next)
                setSelectedDay(null)
                router.replace(`/dashboard/calendar?month=${key}`, { scroll: false })
              })
            }}
            disabled={pending}
            className="px-3 py-1.5 rounded-lg border border-[oklch(90%_0.014_254)] text-[12px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(80%_0.020_254)] hover:bg-[oklch(97%_0.010_254)] transition-colors disabled:opacity-50"
          >
            วันนี้
          </button>
          <button
            onClick={() => navigate(1)}
            disabled={pending}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[oklch(90%_0.014_254)] text-[oklch(46%_0.022_254)] hover:border-[oklch(80%_0.020_254)] hover:bg-[oklch(97%_0.010_254)] transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-[oklch(90%_0.014_254)] overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-[oklch(90%_0.014_254)]">
          {DOW.map(d => (
            <div key={d} className="py-2.5 text-center text-[11px] font-700 uppercase tracking-[0.6px] text-[oklch(65%_0.016_254)]">
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="grid grid-cols-7">
          {grid.map((day, idx) => {
            const isToday = isCurrentMonth && day === todayDate
            const isSelected = day === selectedDay
            const evs = day ? dayEvents(day) : []

            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                className={[
                  'min-h-[52px] md:min-h-[80px] p-1 md:p-1.5 border-b border-r border-[oklch(90%_0.014_254)]',
                  'last:border-r-0',
                  idx % 7 === 6 ? 'border-r-0' : '',
                  Math.floor(idx / 7) === Math.floor((grid.length - 1) / 7) ? 'border-b-0' : '',
                  day ? 'cursor-pointer hover:bg-[oklch(98%_0.008_265)]' : 'bg-[oklch(98.5%_0.004_254)]',
                  isSelected ? 'bg-[oklch(96%_0.020_265)]' : '',
                  'transition-colors',
                ].join(' ')}
              >
                {day && (
                  <>
                    <div className={[
                      'w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-600 mb-1',
                      isToday
                        ? 'bg-[oklch(52%_0.245_265)] text-white'
                        : 'text-[oklch(30%_0.015_254)]',
                    ].join(' ')}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {evs.slice(0, 3).map(ev => (
                        <div key={ev.id} className="flex items-center gap-1 rounded bg-[oklch(93%_0.04_265)] px-1 py-0.5">
                          <span className="truncate text-[10px] font-600 text-[oklch(38%_0.20_265)] leading-tight">{ev.title}</span>
                          {ev.contactName && (
                            <span className="shrink-0 rounded bg-[oklch(87%_0.06_265)] px-1 text-[9px] font-700 text-[oklch(42%_0.22_265)]">
                              {ev.contactName.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      ))}
                      {evs.length > 3 && (
                        <div className="text-[9px] font-600 text-[oklch(52%_0.245_265)] px-1">+{evs.length - 3} อื่นๆ</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick-add form + day events — inline below grid */}
      {selectedDay !== null && (
        <div className="mt-4 bg-white rounded-xl border border-[oklch(90%_0.014_254)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[oklch(90%_0.014_254)] flex items-center justify-between">
            <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">
              {selectedDay} {MONTHS_TH[mon]} {year + 543}
            </span>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-[oklch(65%_0.016_254)] hover:text-[oklch(40%_0.018_254)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Events on selected day */}
          {dayEvents(selectedDay).length > 0 && (
            <div className="px-5 py-3 border-b border-[oklch(90%_0.014_254)] space-y-2">
              {dayEvents(selectedDay).map(ev => (
                <div key={ev.id} className="flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(52%_0.245_265)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-500 text-[oklch(18%_0.012_254)]">{ev.title}</span>
                    {ev.contactName && (
                      <span className="ml-2 rounded bg-[oklch(93%_0.04_265)] px-1.5 py-0.5 text-[10px] font-600 text-[oklch(42%_0.20_265)]">
                        {ev.contactName}
                      </span>
                    )}
                    <div className="text-[11px] text-[oklch(65%_0.016_254)]">
                      {new Date(ev.startAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      {ev.endAt && ` – ${new Date(ev.endAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    disabled={pending}
                    className="opacity-0 group-hover:opacity-100 text-[oklch(60%_0.12_25)] hover:text-[oklch(44%_0.21_25)] transition-all disabled:opacity-50"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          <form onSubmit={handleCreate} className="px-5 py-4 space-y-3">
            <div>
              <label className="block text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(55%_0.020_254)] mb-1.5">ชื่อ Event</label>
              <input
                type="text"
                placeholder="เช่น นัดพบลูกค้า, ประชุมทีม..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-3 py-2 text-[13px] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-2 focus:ring-[oklch(93%_0.04_265)] placeholder:text-[oklch(68%_0.016_254)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(55%_0.020_254)] mb-1.5">เวลาเริ่ม</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="w-full rounded-lg border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-3 py-2 text-[13px] outline-none focus:border-[oklch(52%_0.245_265)]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(55%_0.020_254)] mb-1.5">เวลาสิ้นสุด (ไม่บังคับ)</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="w-full rounded-lg border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-3 py-2 text-[13px] outline-none focus:border-[oklch(52%_0.245_265)]"
                />
              </div>
            </div>
            {error && <p className="text-[12px] text-[oklch(44%_0.21_25)]">{error}</p>}
            <button
              type="submit"
              disabled={pending || !form.title.trim()}
              className="w-full py-2.5 rounded-lg bg-[oklch(52%_0.245_265)] text-white text-[13px] font-700 hover:bg-[oklch(46%_0.245_265)] transition-colors disabled:opacity-50"
            >
              {pending ? 'กำลังบันทึก...' : '+ เพิ่ม Event'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
