'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { BoardCard, Task, Event } from '@/db/schema'
import { createCard, moveCard, deleteCard, markTaskDone } from './actions'

type Column = 'todo' | 'doing' | 'done'
type ContactResult = { id: string; name: string; phone: string }
type ContactSelection = { id: string; name: string } | null

const COLUMNS: { key: Column; label: string; color: string; dot: string; countBg: string; dropBg: string }[] = [
  {
    key: 'todo',
    label: 'To Do',
    color: 'text-[oklch(46%_0.022_254)]',
    dot: 'bg-[oklch(75%_0.015_254)]',
    countBg: 'bg-[oklch(92%_0.010_254)] text-[oklch(50%_0.020_254)]',
    dropBg: 'bg-[oklch(95%_0.008_254)] border-[oklch(75%_0.015_254)]',
  },
  {
    key: 'doing',
    label: 'Doing',
    color: 'text-[oklch(42%_0.20_265)]',
    dot: 'bg-[oklch(52%_0.245_265)]',
    countBg: 'bg-[oklch(93%_0.04_265)] text-[oklch(42%_0.20_265)]',
    dropBg: 'bg-[oklch(95%_0.025_265)] border-[oklch(65%_0.18_265)]',
  },
  {
    key: 'done',
    label: 'Done',
    color: 'text-[oklch(42%_0.17_160)]',
    dot: 'bg-[oklch(52%_0.175_160)]',
    countBg: 'bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)]',
    dropBg: 'bg-[oklch(95%_0.025_160)] border-[oklch(65%_0.14_160)]',
  },
]

const COL_ORDER: Column[] = ['todo', 'doing', 'done']

interface Props {
  initialCards: BoardCard[]
  todayTasks: Task[]
  todayEvents: Event[]
}

export function BoardView({ initialCards, todayTasks, todayEvents }: Props) {
  const [cards, setCards] = useState<BoardCard[]>(initialCards)
  const [inputs, setInputs] = useState<Record<Column, string>>({ todo: '', doing: '', done: '' })
  const [errors, setErrors] = useState<Record<Column, string>>({ todo: '', doing: '', done: '' })
  const [pending, startTransition] = useTransition()
  const [taskList, setTaskList] = useState<Task[]>(todayTasks)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<Column | null>(null)

  // Contact search per column
  const [contactSearch, setContactSearch] = useState<Record<Column, string>>({ todo: '', doing: '', done: '' })
  const [contactResults, setContactResults] = useState<Record<Column, ContactResult[]>>({ todo: [], doing: [], done: [] })
  const [contactSelected, setContactSelected] = useState<Record<Column, ContactSelection>>({ todo: null, doing: null, done: null })
  const [contactOpen, setContactOpen] = useState<Record<Column, boolean>>({ todo: false, doing: false, done: false })
  const searchTimers = useRef<Record<Column, ReturnType<typeof setTimeout>>>({} as Record<Column, ReturnType<typeof setTimeout>>)

  function handleMarkDone(id: string) {
    setTaskList(prev => prev.filter(t => t.id !== id))
    startTransition(async () => { await markTaskDone(id) })
  }

  function getCards(col: Column) {
    return cards.filter(c => c.column === col).sort((a, b) => a.position - b.position)
  }

  function searchContacts(col: Column, q: string) {
    setContactSearch(prev => ({ ...prev, [col]: q }))
    clearTimeout(searchTimers.current[col])
    if (!q.trim()) { setContactResults(prev => ({ ...prev, [col]: [] })); return }
    searchTimers.current[col] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setContactResults(prev => ({ ...prev, [col]: data }))
      } catch { /* ignore */ }
    }, 250)
  }

  function selectContact(col: Column, contact: ContactResult) {
    setContactSelected(prev => ({ ...prev, [col]: { id: contact.id, name: contact.name } }))
    setContactSearch(prev => ({ ...prev, [col]: '' }))
    setContactResults(prev => ({ ...prev, [col]: [] }))
    setContactOpen(prev => ({ ...prev, [col]: false }))
  }

  function clearContact(col: Column) {
    setContactSelected(prev => ({ ...prev, [col]: null }))
    setContactSearch(prev => ({ ...prev, [col]: '' }))
    setContactResults(prev => ({ ...prev, [col]: [] }))
    setContactOpen(prev => ({ ...prev, [col]: false }))
  }

  function handleAdd(col: Column, e: React.FormEvent) {
    e.preventDefault()
    const title = inputs[col].trim()
    if (!title) return
    setErrors(prev => ({ ...prev, [col]: '' }))
    const contact = contactSelected[col]

    startTransition(async () => {
      try {
        const created = await createCard({
          title,
          column: col,
          contactId: contact?.id,
          contactName: contact?.name,
        })
        setCards(prev => [...prev, created])
        setInputs(prev => ({ ...prev, [col]: '' }))
        clearContact(col)
      } catch (err) {
        setErrors(prev => ({ ...prev, [col]: err instanceof Error ? err.message : 'เกิดข้อผิดพลาด' }))
      }
    })
  }

  function handleDrop(targetCol: Column) {
    if (!dragId) return
    const card = cards.find(c => c.id === dragId)
    if (!card || card.column === targetCol) { setDragId(null); setDragOver(null); return }
    setCards(prev => prev.map(c => c.id === dragId ? { ...c, column: targetCol } : c))
    setDragId(null)
    setDragOver(null)
    startTransition(async () => {
      const updated = await moveCard(dragId, targetCol)
      setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteCard(id)
      setCards(prev => prev.filter(c => c.id !== id))
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">Board</h1>
        <p className="text-[13px] text-[oklch(55%_0.020_254)]">Task และนัดหมายวันนี้ดึงขึ้นอัตโนมัติ — เพิ่มการ์ดเองและลากข้าม column เพื่อติดตามงาน</p>
        <p className="mt-1 text-[11px] text-[oklch(70%_0.012_254)] md:hidden">← เลื่อนซ้าย/ขวาเพื่อดูทุก column</p>
      </div>

      {/* Today section */}
      {(taskList.length > 0 || todayEvents.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-700 text-[oklch(30%_0.012_254)]">วันนี้</span>
            <span className="rounded-full bg-[oklch(92%_0.04_50)] px-2 py-0.5 text-[11px] font-700 text-[oklch(45%_0.15_50)]">
              {taskList.length + todayEvents.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {taskList.map(task => (
              <div key={task.id} className="flex items-center gap-2 rounded-xl border border-[oklch(88%_0.06_80)] bg-[oklch(98%_0.015_80)] px-3 py-2.5 min-w-[180px] max-w-[260px]">
                <button onClick={() => handleMarkDone(task.id)} className="shrink-0 w-4 h-4 rounded-full border-2 border-[oklch(72%_0.10_80)] hover:border-[oklch(52%_0.175_160)] hover:bg-[oklch(95%_0.038_160)] transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-500 text-[oklch(20%_0.012_254)] leading-snug truncate">{task.title}</p>
                  {task.contactName && <span className="mt-0.5 inline-block text-[10px] text-[oklch(55%_0.020_254)] truncate">{task.contactName}</span>}
                </div>
              </div>
            ))}
            {todayEvents.map(ev => {
              const time = new Date(ev.startAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })
              return (
                <div key={ev.id} className="flex items-center gap-2 rounded-xl border border-[oklch(88%_0.06_265)] bg-[oklch(97%_0.015_265)] px-3 py-2.5 min-w-[180px] max-w-[260px]">
                  <span className="shrink-0 text-[11px] font-700 text-[oklch(42%_0.20_265)] tabular-nums">{time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-500 text-[oklch(20%_0.012_254)] leading-snug truncate">{ev.title}</p>
                    {ev.contactName && <span className="mt-0.5 inline-block text-[10px] text-[oklch(55%_0.020_254)] truncate">{ev.contactName}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Board columns */}
      <div className="grid grid-cols-3 gap-3 items-start min-w-[640px]">
        {COLUMNS.map(col => {
          const colCards = getCards(col.key)
          const isOver = dragOver === col.key
          const showInput = inputs[col.key].trim().length > 0
          const selected = contactSelected[col.key]
          const results = contactResults[col.key]
          const isContactOpen = contactOpen[col.key]

          return (
            <div
              key={col.key}
              onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.key)}
              className={[
                'rounded-xl border overflow-hidden flex flex-col transition-colors',
                isOver ? `${col.dropBg} border-dashed` : 'bg-white border-[oklch(90%_0.014_254)]',
              ].join(' ')}
            >
              {/* Column header */}
              <div className="px-4 py-3.5 border-b border-[oklch(90%_0.014_254)] flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-[13px] font-700 ${col.color}`}>{col.label}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-700 ${col.countBg}`}>{colCards.length}</span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 flex-1 min-h-[80px]">
                {colCards.length === 0 && !isOver && (
                  <div className="py-5 text-center">
                    <p className="text-[11px] text-[oklch(72%_0.012_254)]">
                      {col.key === 'todo' && 'งานที่รอทำ'}
                      {col.key === 'doing' && 'งานที่กำลังทำอยู่'}
                      {col.key === 'done' && 'งานที่เสร็จแล้ววันนี้'}
                    </p>
                  </div>
                )}
                {isOver && colCards.length === 0 && (
                  <div className="py-6 text-center">
                    <p className="text-[12px] text-[oklch(60%_0.08_265)]">วางที่นี่</p>
                  </div>
                )}
                {colCards.map(card => (
                  <CardItem
                    key={card.id}
                    card={card}
                    onDragStart={() => setDragId(card.id)}
                    onDragEnd={() => { setDragId(null); setDragOver(null) }}
                    onDelete={handleDelete}
                    isDragging={dragId === card.id}
                    disabled={pending}
                  />
                ))}
              </div>

              {/* Quick add */}
              <div className="px-3 pb-3">
                <form onSubmit={e => handleAdd(col.key, e)} className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="+ เพิ่ม card..."
                    value={inputs[col.key]}
                    onChange={e => setInputs(prev => ({ ...prev, [col.key]: e.target.value }))}
                    disabled={pending}
                    className="w-full rounded-lg border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] px-3 py-2 text-[12px] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-2 focus:ring-[oklch(93%_0.04_265)] placeholder:text-[oklch(72%_0.012_254)] disabled:opacity-50"
                  />

                  {/* Contact selector — shows once user starts typing */}
                  {showInput && (
                    <div className="relative">
                      {selected ? (
                        <div className="flex items-center gap-1.5 rounded-lg border border-[oklch(88%_0.06_265)] bg-[oklch(95%_0.025_265)] px-2.5 py-1.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="oklch(42% 0.20 265)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          <span className="flex-1 text-[11px] font-600 text-[oklch(42%_0.20_265)] truncate">{selected.name}</span>
                          <button type="button" onClick={() => clearContact(col.key)} className="text-[oklch(65%_0.020_254)] hover:text-[oklch(30%_0.012_254)]">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          {!isContactOpen ? (
                            <button
                              type="button"
                              onClick={() => setContactOpen(prev => ({ ...prev, [col.key]: true }))}
                              className="flex items-center gap-1 text-[11px] text-[oklch(60%_0.016_254)] hover:text-[oklch(42%_0.20_265)] transition-colors"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                              ผูก Contact (ไม่บังคับ)
                            </button>
                          ) : (
                            <input
                              autoFocus
                              type="text"
                              placeholder="ค้นหาชื่อหรือเบอร์..."
                              value={contactSearch[col.key]}
                              onChange={e => searchContacts(col.key, e.target.value)}
                              onBlur={() => setTimeout(() => { setContactOpen(prev => ({ ...prev, [col.key]: false })); setContactResults(prev => ({ ...prev, [col.key]: [] })) }, 200)}
                              className="w-full rounded-lg border border-[oklch(88%_0.06_265)] bg-white px-2.5 py-1.5 text-[11px] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-1 focus:ring-[oklch(93%_0.04_265)]"
                            />
                          )}
                          {results.length > 0 && (
                            <div className="absolute z-10 left-0 right-0 mt-0.5 rounded-lg border border-[oklch(90%_0.014_254)] bg-white shadow-md overflow-hidden">
                              {results.map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onMouseDown={() => selectContact(col.key, c)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[oklch(96%_0.020_265)] transition-colors"
                                >
                                  <span className="text-[12px] font-600 text-[oklch(18%_0.012_254)]">{c.name}</span>
                                  <span className="text-[10px] text-[oklch(65%_0.016_254)]">{c.phone}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {errors[col.key] && <p className="text-[11px] text-[oklch(44%_0.21_25)]">{errors[col.key]}</p>}
                  {showInput && (
                    <button
                      type="submit"
                      disabled={pending}
                      className="w-full py-1.5 rounded-lg bg-[oklch(52%_0.245_265)] text-white text-[12px] font-600 hover:bg-[oklch(46%_0.245_265)] transition-colors disabled:opacity-50"
                    >
                      เพิ่ม
                    </button>
                  )}
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CardItem({
  card, onDragStart, onDragEnd, onDelete, isDragging, disabled,
}: {
  card: BoardCard
  onDragStart: () => void
  onDragEnd: () => void
  onDelete: (id: string) => void
  isDragging: boolean
  disabled: boolean
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={[
        'group rounded-lg border bg-[oklch(98.2%_0.006_254)] p-3 cursor-grab active:cursor-grabbing transition-all',
        isDragging ? 'opacity-40 border-[oklch(75%_0.015_265)] scale-[0.97]' : 'border-[oklch(90%_0.014_254)] hover:border-[oklch(82%_0.018_254)]',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-500 text-[oklch(18%_0.012_254)] leading-snug">{card.title}</p>
          {card.contactName && (
            <div className="mt-1.5">
              {card.contactId ? (
                <Link href={`/dashboard/contacts/${card.contactId}`} onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-full bg-[oklch(93%_0.04_265)] px-2 py-0.5 text-[10px] font-600 text-[oklch(42%_0.20_265)] hover:bg-[oklch(88%_0.06_265)] transition-colors">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {card.contactName}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(93%_0.04_265)] px-2 py-0.5 text-[10px] font-600 text-[oklch(42%_0.20_265)]">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {card.contactName}
                </span>
              )}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(card.id)} disabled={disabled} className="opacity-0 group-hover:opacity-100 shrink-0 text-[oklch(72%_0.012_254)] hover:text-[oklch(44%_0.21_25)] transition-all disabled:opacity-50">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>
  )
}
