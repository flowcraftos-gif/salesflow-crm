'use client'

import { useState, useTransition, useRef } from 'react'
import { Task } from '@/db/schema'
import { toggleTask, deleteTask, createTask } from '@/app/(dashboard)/dashboard/tasks/actions'
import { ContactPicker } from '@/components/contacts/contact-picker'

type FilterKey = 'all' | 'today' | 'done'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'today', label: 'วันนี้' },
  { key: 'done', label: 'เสร็จแล้ว' },
]

function todayStr() {
  return new Date().toLocaleDateString('en-CA')
}

function isOverdue(dueDate: string | null, done: boolean) {
  if (!dueDate || done) return false
  return dueDate < todayStr()
}

function formatDate(dueDate: string) {
  // dueDate is YYYY-MM-DD
  const [y, m, d] = dueDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

function applyFilter(tasks: Task[], filter: FilterKey): Task[] {
  if (filter === 'today') {
    const today = todayStr()
    return tasks.filter(t => !t.done && t.dueDate === today)
  }
  if (filter === 'done') return tasks.filter(t => t.done)
  return tasks
}

interface TaskListProps {
  initialTasks: Task[]
}

export function TaskList({ initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [isPending, startTransition] = useTransition()

  // Quick-add form state
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string } | null>(null)
  const [adding, setAdding] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const visible = applyFilter(tasks, filter)

  function handleToggle(id: string) {
    startTransition(async () => {
      const updated = await toggleTask(id)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: updated.done } : t))
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    try {
      const task = await createTask({
        title: title.trim(),
        dueDate: dueDate || undefined,
        contactId: selectedContact?.id,
        contactName: selectedContact?.name,
      })
      setTasks(prev => [task, ...prev])
      setTitle('')
      setDueDate('')
      setSelectedContact(null)
      titleRef.current?.focus()
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="p-4 md:p-5">
      {/* Quick-add form */}
      <form
        onSubmit={handleAdd}
        className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-[oklch(90%_0.014_254)] bg-white px-4 py-3 shadow-sm"
      >
        <div className="relative w-full md:flex-1 md:min-w-48">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[oklch(68%_0.016_254)] pointer-events-none"
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="เพิ่ม task ใหม่..."
            className="h-9 w-full rounded-md border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] py-1.5 pl-8 pr-3 text-[13px] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-2 focus:ring-[oklch(93%_0.04_265)] placeholder:text-[oklch(68%_0.016_254)]"
          />
        </div>

        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="h-9 rounded-md border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-2.5 text-[13px] text-[oklch(18%_0.012_254)] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-2 focus:ring-[oklch(93%_0.04_265)]"
        />

        <ContactPicker
          onSelect={c => setSelectedContact(c)}
          selectedName={selectedContact?.name}
        />

        <button
          type="submit"
          disabled={adding || !title.trim()}
          className="flex h-9 items-center gap-1.5 rounded-md bg-[oklch(52%_0.245_265)] px-4 text-[13px] font-700 text-white transition hover:bg-[oklch(46%_0.245_265)] disabled:opacity-50"
        >
          {adding ? (
            <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          )}
          บันทึก
        </button>
      </form>

      {/* Filter tabs */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex gap-px rounded-lg bg-[oklch(90%_0.014_254)] p-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-white text-[oklch(18%_0.012_254)] shadow-sm font-semibold'
                  : 'text-[oklch(55%_0.020_254)] hover:text-[oklch(30%_0.015_254)]'
              }`}
            >
              {f.label}
              {f.key === 'all' && (
                <span className="ml-1.5 rounded-full bg-[oklch(93%_0.04_265)] px-1.5 py-0.5 text-[10px] font-700 text-[oklch(42%_0.20_265)]">
                  {tasks.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="overflow-hidden rounded-xl border border-[oklch(90%_0.014_254)] bg-white">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(93%_0.04_265)] text-[oklch(52%_0.245_265)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <p className="text-sm font-600 text-[oklch(30%_0.015_254)]">ยังไม่มี Task</p>
            <p className="mt-1 text-xs text-[oklch(65%_0.016_254)]">เพิ่มด้านบน</p>
          </div>
        ) : (
          <ul>
            {visible.map((task, idx) => {
              const overdue = isOverdue(task.dueDate, task.done)
              return (
                <li
                  key={task.id}
                  className={`group flex items-center gap-3 border-b border-[oklch(90%_0.014_254)] px-4 py-3 last:border-none transition-colors ${
                    task.done
                      ? 'bg-[oklch(98.5%_0.004_254)]'
                      : overdue
                        ? 'bg-[oklch(97.5%_0.020_25)]'
                        : idx % 2 === 0 ? 'bg-white' : 'bg-[oklch(99%_0.004_254)]'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggle(task.id)}
                    disabled={isPending}
                    aria-label={task.done ? 'Mark as undone' : 'Mark as done'}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      task.done
                        ? 'border-[oklch(52%_0.245_265)] bg-[oklch(52%_0.245_265)]'
                        : 'border-[oklch(78%_0.018_254)] bg-white hover:border-[oklch(52%_0.245_265)]'
                    }`}
                  >
                    {task.done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>

                  {/* Title */}
                  <span className={`flex-1 text-[13px] font-500 transition-colors ${
                    task.done
                      ? 'text-[oklch(68%_0.016_254)] line-through decoration-[oklch(75%_0.012_254)]'
                      : 'text-[oklch(18%_0.012_254)]'
                  }`}>
                    {task.title}
                  </span>

                  {/* Contact badge */}
                  {task.contactName && (
                    <span className="flex items-center gap-1 rounded-full bg-[oklch(93%_0.04_265)] px-2.5 py-1 text-[11px] font-600 text-[oklch(40%_0.20_265)]">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                      </svg>
                      {task.contactName}
                    </span>
                  )}

                  {/* Due date */}
                  {task.dueDate && (
                    <span className={`text-[11px] font-500 ${
                      overdue
                        ? 'text-[oklch(54%_0.215_25)]'
                        : task.done
                          ? 'text-[oklch(72%_0.014_254)]'
                          : 'text-[oklch(55%_0.020_254)]'
                    }`}>
                      {overdue && !task.done && (
                        <span className="mr-1">เกิน</span>
                      )}
                      {formatDate(task.dueDate)}
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    disabled={isPending}
                    aria-label="Delete task"
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[oklch(72%_0.014_254)] opacity-0 transition-all hover:bg-[oklch(95%_0.040_25)] hover:text-[oklch(54%_0.215_25)] group-hover:opacity-100"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
