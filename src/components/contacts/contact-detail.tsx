'use client'

import { Contact, ContactStatusLog, Task, Event, CONTACT_STATUSES } from '@/db/schema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateContactStatus, logCall, deleteContact } from '@/app/(dashboard)/dashboard/contacts/actions'
import { createTask } from '@/app/(dashboard)/dashboard/tasks/actions'
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

const DOT_COLOR: Record<string, string> = {
  Lead: 'bg-[oklch(75%_0.015_254)]', Prospect: 'bg-[oklch(52%_0.245_265)]',
  Appointment: 'bg-[oklch(66%_0.175_68)]', Client: 'bg-[oklch(52%_0.175_160)]',
  Proposal: 'bg-[oklch(52%_0.20_300)]', Lost: 'bg-[oklch(54%_0.215_25)]',
}

const AVATAR_COLORS = [
  'bg-[oklch(52%_0.24_265)]','bg-[oklch(52%_0.22_220)]',
  'bg-[oklch(52%_0.17_160)]','bg-[oklch(60%_0.20_68)]','bg-[oklch(52%_0.22_340)]',
]

const MS_PER_DAY = 86400000

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function daysSince(date: string, today: string) {
  return Math.max(0, Math.floor((new Date(today).getTime() - new Date(date).getTime()) / MS_PER_DAY))
}

function FieldRow({ icon, label, value, red }: { icon: React.ReactNode; label: string; value?: string | null; red?: boolean }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[oklch(90%_0.014_254)] last:border-none">
      <div className="w-7 h-7 rounded-lg bg-[oklch(98.2%_0.006_254)] flex items-center justify-center flex-shrink-0 text-[oklch(60%_0.018_254)]">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-600 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)] mb-0.5">{label}</div>
        <div className={`text-[13px] font-500 ${red ? 'text-[oklch(54%_0.215_25)] font-600' : 'text-[oklch(18%_0.012_254)]'}`}>{value}</div>
      </div>
    </div>
  )
}

export function ContactDetail({
  contact,
  history,
  linkedTasks = [],
  linkedEvents = [],
}: {
  contact: Contact
  history: ContactStatusLog[]
  linkedTasks?: Task[]
  linkedEvents?: Event[]
}) {
  const router = useRouter()
  const [status, setStatus] = useState(contact.status)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [callResult, setCallResult] = useState<'reached' | 'no_answer' | 'callback' | null>(null)
  const [nextDate, setNextDate] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Inline tasks
  const [tasks, setTasks] = useState<Task[]>(linkedTasks)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  // Inline events / นัด modal
  const [evts, setEvts] = useState<Event[]>(linkedEvents)
  const [showAppoint, setShowAppoint] = useState(false)
  const [appointPending, setAppointPending] = useState(false)

  const today = new Date().toLocaleDateString('en-CA')
  const overdueDays = contact.nextFollowUpDate ? daysSince(contact.nextFollowUpDate, today) : 0
  const isOverdue = contact.nextFollowUpDate
    ? contact.nextFollowUpDate <= today
    : false

  async function handleStatusChange(s: string) {
    setStatus(s)
    setShowStatusMenu(false)
    await updateContactStatus(contact.id, s)
  }

  async function handleCall() {
    if (!callResult) return
    // Open dialer then log
    window.location.href = `tel:${contact.phone}`
    await logCall(contact.id, callResult, nextDate || undefined)
    setShowCallModal(false)
    setCallResult(null)
    setNextDate('')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('ลบ contact นี้ไหม?')) return
    setDeleting(true)
    await deleteContact(contact.id)
    router.push('/dashboard/contacts')
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    setAddingTask(true)
    try {
      const task = await createTask({
        title: taskTitle.trim(),
        dueDate: taskDate || undefined,
        contactId: contact.id,
        contactName: contact.name,
      })
      setTasks(prev => [...prev, task])
      setTaskTitle('')
      setTaskDate('')
    } finally {
      setAddingTask(false)
    }
  }

  async function handleAddAppoint(data: { title: string; date: string; time: string }) {
    setAppointPending(true)
    try {
      const [h, m] = data.time.split(':').map(Number)
      const [y, mo, d] = data.date.split('-').map(Number)
      const startAt = new Date(y, mo - 1, d, h, m).toISOString()
      const ev = await createEvent({
        title: data.title.trim() || `นัดพบ ${contact.name}`,
        startAt,
        contactId: contact.id,
        contactName: contact.name,
      })
      setEvts(prev => [...prev, ev])
      setShowAppoint(false)
    } finally {
      setAppointPending(false)
    }
  }

  const tl = [
    ...history.map(h => ({
      date: new Date(h.changedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
      text: `เปลี่ยน Status → ${h.status}`,
      note: h.note,
      color: DOT_COLOR[h.status] ?? 'bg-[oklch(75%_0.012_254)]',
    }))
  ]

  return (
    <div className="p-4 md:p-5 max-w-4xl">
      {/* Back */}
      <button onClick={() => router.push('/dashboard/contacts')} className="flex items-center gap-1.5 text-[13px] font-600 text-[oklch(52%_0.245_265)] mb-5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        กลับ Contacts
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 items-start">

        {/* Left panel */}
        <div className="min-w-0">
          {/* Hero */}
          <div className="bg-white rounded-lg border border-[oklch(90%_0.014_254)] overflow-hidden">
            <div className="p-5 border-b border-[oklch(90%_0.014_254)] bg-[oklch(97%_0.010_265)]">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[17px] font-800 text-white mb-3 ${avatarColor(contact.name)}`}>
                {contact.name.slice(0, 2)}
              </div>
              <div className="text-[20px] font-800 tracking-tight text-[oklch(18%_0.012_254)] mb-2">{contact.name}</div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-600 ${STATUS_STYLES[status] ?? ''}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[status] ?? ''}`} />
                  {status}
                </span>
                <div className="relative">
                  <button onClick={() => setShowStatusMenu(v => !v)} className="text-[11px] font-600 text-[oklch(52%_0.245_265)] border border-[oklch(70%_0.10_265)] bg-[oklch(96%_0.020_265)] px-2 py-1 rounded-md">เปลี่ยน</button>
                  {showStatusMenu && (
                    <div className="absolute left-0 top-8 z-10 bg-white border border-[oklch(90%_0.014_254)] rounded-lg shadow-lg overflow-hidden min-w-[140px]">
                      {CONTACT_STATUSES.map(s => (
                        <button key={s} onClick={() => handleStatusChange(s)} className="w-full text-left px-3 py-2 text-[12px] font-500 hover:bg-[oklch(97%_0.010_265)] transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overdue alert */}
            {isOverdue && (
              <div className="mx-4 mt-3 flex items-center gap-2 rounded-md bg-[oklch(95%_0.040_25)] border border-[oklch(88%_0.06_25)] px-3 py-2 text-[12px] font-600 text-[oklch(44%_0.21_25)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                เลย Follow-up {overdueDays} วัน
              </div>
            )}

            {/* Action buttons — 2x2 grid */}
            <div className="grid grid-cols-2 gap-2 p-4 border-b border-[oklch(90%_0.014_254)]">
              <button onClick={() => setShowCallModal(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-[oklch(85%_0.06_160)] bg-[oklch(95%_0.038_160)] text-[12px] font-700 text-[oklch(42%_0.17_160)] hover:bg-[oklch(92%_0.055_160)] transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                โทร
              </button>
              <button onClick={() => setShowAppoint(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-[oklch(85%_0.06_265)] bg-[oklch(96%_0.020_265)] text-[12px] font-700 text-[oklch(42%_0.20_265)] hover:bg-[oklch(93%_0.04_265)] transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                นัดหมาย
              </button>
              <button onClick={() => router.push(`/dashboard/contacts/${contact.id}/edit`)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[oklch(90%_0.014_254)] bg-white text-[12px] font-600 text-[oklch(46%_0.022_254)] hover:bg-[oklch(97%_0.010_254)] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                แก้ไข
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[oklch(90%_0.014_254)] bg-white text-[12px] font-600 text-[oklch(60%_0.12_25)] hover:bg-[oklch(98%_0.010_25)] transition-colors disabled:opacity-50">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                ลบ
              </button>
            </div>

            {/* Info */}
            <FieldRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} label="เบอร์โทร" value={contact.phone} />
            <FieldRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>} label="LINE ID" value={contact.lineId} />
            <FieldRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} label="อีเมล" value={contact.email} />
            <FieldRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} label="สินค้าที่สนใจ" value={contact.interestedProduct} />
            <FieldRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="มูลค่าประมาณการ" value={contact.estimatedValue ? `฿${Number(contact.estimatedValue).toLocaleString()} / ปี` : null} />
            <FieldRow icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} label="Follow-up ถัดไป" value={contact.nextFollowUpDate ? new Date(contact.nextFollowUpDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : null} red={isOverdue} />
            {contact.notes && (
              <div className="px-4 py-3">
                <div className="text-[10px] font-600 uppercase tracking-[0.5px] text-[oklch(68%_0.016_254)] mb-1">หมายเหตุ</div>
                <p className="text-[13px] text-[oklch(30%_0.015_254)] leading-relaxed">{contact.notes}</p>
              </div>
            )}
          </div>

          {/* Status history */}
          {history.length > 0 && (
            <div className="bg-white rounded-lg border border-[oklch(90%_0.014_254)] overflow-hidden mt-3">
              <div className="px-4 py-3 border-b border-[oklch(90%_0.014_254)]">
                <span className="text-[11px] font-700 uppercase tracking-[0.6px] text-[oklch(55%_0.020_254)]">ประวัติ Status</span>
              </div>
              {history.map((h, i) => (
                <div key={h.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[oklch(90%_0.014_254)] last:border-none">
                  <div className={`text-[9px] font-800 px-2 py-1 rounded bg-[oklch(97%_0.010_254)] text-[oklch(55%_0.020_254)]`}>
                    {h.status.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-500 text-[oklch(18%_0.012_254)]">{h.status}</div>
                    <div className="text-[11px] text-[oklch(68%_0.016_254)]">
                      {new Date(h.changedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                  </div>
                  {i === 0 && <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-600 ${STATUS_STYLES[h.status]}`}>ปัจจุบัน</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Activity timeline + Tasks + Events */}
        <div className="space-y-3">
          {/* Status timeline */}
          <div className="bg-white rounded-lg border border-[oklch(90%_0.014_254)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[oklch(90%_0.014_254)]">
              <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">กิจกรรม</span>
            </div>
            {tl.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-[oklch(80%_0.012_254)] text-[32px] mb-2">○</div>
                <p className="text-[13px] text-[oklch(65%_0.016_254)]">ยังไม่มีกิจกรรม</p>
              </div>
            ) : (
              <div>
                {tl.map((item, i) => (
                  <div key={i} className="flex gap-3 px-5 py-3.5 border-b border-[oklch(90%_0.014_254)] last:border-none">
                    <div className="flex flex-col items-center w-4 flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${item.color}`} />
                      {i < tl.length - 1 && <div className="w-px flex-1 bg-[oklch(90%_0.014_254)] mt-1" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="text-[13px] font-500 text-[oklch(18%_0.012_254)]">{item.text}</div>
                      {item.note && <div className="text-[11px] text-[oklch(55%_0.020_254)] mt-0.5">{item.note}</div>}
                      <div className="text-[11px] text-[oklch(68%_0.016_254)] mt-1">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Tasks */}
          <div className="bg-white rounded-lg border border-[oklch(90%_0.014_254)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[oklch(90%_0.014_254)] flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[oklch(52%_0.245_265)]"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">Tasks</span>
              <span className="ml-auto rounded-full bg-[oklch(93%_0.04_265)] px-2 py-0.5 text-[11px] font-700 text-[oklch(42%_0.20_265)]">{tasks.length}</span>
            </div>
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-[oklch(90%_0.014_254)] last:border-none">
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${task.done ? 'bg-[oklch(52%_0.175_160)] border-[oklch(52%_0.175_160)]' : 'border-[oklch(78%_0.015_254)]'}`}>
                  {task.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-500 ${task.done ? 'line-through text-[oklch(68%_0.016_254)]' : 'text-[oklch(18%_0.012_254)]'}`}>{task.title}</p>
                  {task.dueDate && <p className="text-[11px] text-[oklch(65%_0.016_254)]">ครบกำหนด {new Date(task.dueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</p>}
                </div>
                {!task.done && task.dueDate && task.dueDate <= new Date().toLocaleDateString('en-CA') && (
                  <span className="shrink-0 rounded bg-[oklch(95%_0.040_25)] px-1.5 py-0.5 text-[10px] font-600 text-[oklch(44%_0.21_25)]">เลยกำหนด</span>
                )}
              </div>
            ))}
            {/* Quick add task */}
            <form onSubmit={handleAddTask} className="flex items-center gap-2 px-4 py-2.5 border-t border-[oklch(90%_0.014_254)] bg-[oklch(98.5%_0.004_254)]">
              <input
                type="text"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="+ เพิ่ม task..."
                className="flex-1 rounded-md border border-[oklch(90%_0.014_254)] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[oklch(52%_0.245_265)] placeholder:text-[oklch(72%_0.012_254)]"
              />
              <input
                type="date"
                value={taskDate}
                onChange={e => setTaskDate(e.target.value)}
                className="rounded-md border border-[oklch(90%_0.014_254)] bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[oklch(52%_0.245_265)]"
              />
              <button type="submit" disabled={addingTask || !taskTitle.trim()}
                className="rounded-md bg-[oklch(52%_0.245_265)] px-3 py-1.5 text-[12px] font-700 text-white disabled:opacity-40 hover:bg-[oklch(46%_0.245_265)] transition-colors">
                เพิ่ม
              </button>
            </form>
          </div>

          {/* Linked Events */}
          <div className="bg-white rounded-lg border border-[oklch(90%_0.014_254)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[oklch(90%_0.014_254)] flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[oklch(52%_0.245_265)]"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)]">นัดหมาย</span>
              <span className="ml-auto rounded-full bg-[oklch(93%_0.04_265)] px-2 py-0.5 text-[11px] font-700 text-[oklch(42%_0.20_265)]">{evts.length}</span>
            </div>
            {evts.map(ev => {
              const start = new Date(ev.startAt)
              const isPast = start < new Date()
              return (
                <div key={ev.id} className="flex items-start gap-3 px-5 py-2.5 border-b border-[oklch(90%_0.014_254)] last:border-none">
                  <div className={`mt-0.5 shrink-0 rounded px-1.5 py-1 text-[10px] font-700 leading-none text-center min-w-[36px] ${isPast ? 'bg-[oklch(95%_0.010_254)] text-[oklch(60%_0.016_254)]' : 'bg-[oklch(93%_0.04_265)] text-[oklch(42%_0.20_265)]'}`}>
                    <div>{start.getDate()}</div>
                    <div>{start.toLocaleDateString('th-TH', { month: 'short' })}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-500 ${isPast ? 'text-[oklch(55%_0.020_254)]' : 'text-[oklch(18%_0.012_254)]'}`}>{ev.title}</p>
                    <p className="text-[11px] text-[oklch(65%_0.016_254)]">
                      {start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!isPast && <span className="shrink-0 rounded-full bg-[oklch(95%_0.038_160)] px-2 py-0.5 text-[10px] font-600 text-[oklch(42%_0.17_160)]">กำลังจะมาถึง</span>}
                </div>
              )
            })}
            {evts.length === 0 && (
              <div className="px-5 py-4 text-center text-[12px] text-[oklch(68%_0.016_254)]">ยังไม่มีนัดหมาย</div>
            )}
            <div className="px-4 py-2.5 border-t border-[oklch(90%_0.014_254)] bg-[oklch(98.5%_0.004_254)]">
              <button
                onClick={() => setShowAppoint(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[oklch(85%_0.06_265)] bg-[oklch(96%_0.020_265)] py-2 text-[12px] font-700 text-[oklch(42%_0.20_265)] hover:bg-[oklch(93%_0.04_265)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                นัดหมายใหม่
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* นัดหมาย modal */}
      {showAppoint && (
        <AppointModal
          name={contact.name}
          onClose={() => setShowAppoint(false)}
          onSubmit={handleAddAppoint}
          pending={appointPending}
        />
      )}

      {/* Call result modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowCallModal(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-700 text-[oklch(18%_0.012_254)] mb-4">บันทึกผลการโทร</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['reached', 'no_answer', 'callback'] as const).map(r => (
                <button key={r} onClick={() => setCallResult(r)}
                  className={`py-3 rounded-lg border text-[12px] font-600 transition-all ${callResult === r ? 'border-[oklch(52%_0.245_265)] bg-[oklch(93%_0.04_265)] text-[oklch(42%_0.20_265)]' : 'border-[oklch(90%_0.014_254)] text-[oklch(46%_0.022_254)] hover:border-[oklch(80%_0.020_254)]'}`}>
                  {r === 'reached' ? 'ติดต่อได้' : r === 'no_answer' ? 'ไม่รับสาย' : 'โทรกลับ'}
                </button>
              ))}
            </div>
            {callResult && (
              <div className="mb-4">
                <label className="block text-[11px] font-700 uppercase tracking-[0.5px] text-[oklch(55%_0.020_254)] mb-1.5">Follow-up ครั้งถัดไป</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[3, 7, 30].map(days => {
                    const d = new Date(); d.setDate(d.getDate() + days)
                    const val = d.toISOString().split('T')[0]
                    return (
                      <button key={days} onClick={() => setNextDate(val)}
                        className={`py-2 rounded-md border text-[11px] font-600 transition-all ${nextDate === val ? 'border-[oklch(52%_0.245_265)] bg-[oklch(93%_0.04_265)] text-[oklch(42%_0.20_265)]' : 'border-[oklch(90%_0.014_254)] text-[oklch(46%_0.022_254)]'}`}>
                        +{days}วัน
                      </button>
                    )
                  })}
                  <button onClick={() => setNextDate('')} className="py-2 rounded-md border border-[oklch(90%_0.014_254)] text-[11px] font-600 text-[oklch(46%_0.022_254)]">กำหนดเอง</button>
                </div>
                <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)}
                  className="w-full rounded-md border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-3 py-2 text-[13px] outline-none focus:border-[oklch(52%_0.245_265)]" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowCallModal(false)} className="flex-1 py-2.5 rounded-lg border border-[oklch(90%_0.014_254)] text-[13px] font-600 text-[oklch(46%_0.022_254)]">ยกเลิก</button>
              <button onClick={handleCall} disabled={!callResult}
                className="flex-1 py-2.5 rounded-lg bg-[oklch(52%_0.245_265)] text-white text-[13px] font-700 disabled:opacity-50 hover:bg-[oklch(46%_0.245_265)] transition-colors">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
