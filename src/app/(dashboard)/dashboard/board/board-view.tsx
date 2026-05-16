'use client'

import { useState, useTransition } from 'react'
import { BoardCard } from '@/db/schema'
import { createCard, moveCard, deleteCard } from './actions'

type Column = 'todo' | 'doing' | 'done'

const COLUMNS: { key: Column; label: string; color: string; dot: string; countBg: string }[] = [
  {
    key: 'todo',
    label: 'To Do',
    color: 'text-[oklch(46%_0.022_254)]',
    dot: 'bg-[oklch(75%_0.015_254)]',
    countBg: 'bg-[oklch(92%_0.010_254)] text-[oklch(50%_0.020_254)]',
  },
  {
    key: 'doing',
    label: 'Doing',
    color: 'text-[oklch(42%_0.20_265)]',
    dot: 'bg-[oklch(52%_0.245_265)]',
    countBg: 'bg-[oklch(93%_0.04_265)] text-[oklch(42%_0.20_265)]',
  },
  {
    key: 'done',
    label: 'Done',
    color: 'text-[oklch(42%_0.17_160)]',
    dot: 'bg-[oklch(52%_0.175_160)]',
    countBg: 'bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)]',
  },
]

const COL_ORDER: Column[] = ['todo', 'doing', 'done']

function colIndex(col: Column) {
  return COL_ORDER.indexOf(col)
}

interface Props {
  initialCards: BoardCard[]
}

export function BoardView({ initialCards }: Props) {
  const [cards, setCards] = useState<BoardCard[]>(initialCards)
  const [inputs, setInputs] = useState<Record<Column, string>>({ todo: '', doing: '', done: '' })
  const [errors, setErrors] = useState<Record<Column, string>>({ todo: '', doing: '', done: '' })
  const [pending, startTransition] = useTransition()

  function getCards(col: Column) {
    return cards
      .filter(c => c.column === col)
      .sort((a, b) => a.position - b.position)
  }

  function handleAdd(col: Column, e: React.FormEvent) {
    e.preventDefault()
    const title = inputs[col].trim()
    if (!title) return
    setErrors(prev => ({ ...prev, [col]: '' }))

    startTransition(async () => {
      try {
        const created = await createCard({ title, column: col })
        setCards(prev => [...prev, created])
        setInputs(prev => ({ ...prev, [col]: '' }))
      } catch (err) {
        setErrors(prev => ({ ...prev, [col]: err instanceof Error ? err.message : 'เกิดข้อผิดพลาด' }))
      }
    })
  }

  function handleMove(id: string, currentCol: Column, direction: 'left' | 'right') {
    const idx = colIndex(currentCol)
    const newIdx = direction === 'left' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= COL_ORDER.length) return
    const newCol = COL_ORDER[newIdx]

    startTransition(async () => {
      const updated = await moveCard(id, newCol)
      setCards(prev => prev.map(c => c.id === id ? updated : c))
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
        <p className="text-[13px] text-[oklch(55%_0.020_254)]">จัดการงานแบบ Kanban</p>
      </div>

      {/* Board columns */}
      <div className="grid grid-cols-3 gap-4 items-start">
        {COLUMNS.map(col => {
          const colCards = getCards(col.key)
          return (
            <div
              key={col.key}
              className="bg-white rounded-xl border border-[oklch(90%_0.014_254)] overflow-hidden flex flex-col"
            >
              {/* Column header */}
              <div className="px-4 py-3.5 border-b border-[oklch(90%_0.014_254)] flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-[13px] font-700 ${col.color}`}>{col.label}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-700 ${col.countBg}`}>
                  {colCards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 flex-1">
                {colCards.length === 0 && (
                  <div className="py-6 text-center">
                    <p className="text-[12px] text-[oklch(75%_0.012_254)]">ยังไม่มี card</p>
                  </div>
                )}
                {colCards.map(card => (
                  <CardItem
                    key={card.id}
                    card={card}
                    colKey={col.key}
                    onMove={handleMove}
                    onDelete={handleDelete}
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
                  {errors[col.key] && (
                    <p className="text-[11px] text-[oklch(44%_0.21_25)]">{errors[col.key]}</p>
                  )}
                  {inputs[col.key].trim() && (
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
  card,
  colKey,
  onMove,
  onDelete,
  disabled,
}: {
  card: BoardCard
  colKey: Column
  onMove: (id: string, col: Column, dir: 'left' | 'right') => void
  onDelete: (id: string) => void
  disabled: boolean
}) {
  const idx = COL_ORDER.indexOf(colKey)
  const canLeft = idx > 0
  const canRight = idx < COL_ORDER.length - 1

  return (
    <div className="group rounded-lg border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] p-3 hover:border-[oklch(82%_0.018_254)] transition-colors">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-500 text-[oklch(18%_0.012_254)] leading-snug">{card.title}</p>
          {card.contactName && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(93%_0.04_265)] px-2 py-0.5 text-[10px] font-600 text-[oklch(42%_0.20_265)]">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {card.contactName}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(card.id)}
          disabled={disabled}
          className="opacity-0 group-hover:opacity-100 shrink-0 text-[oklch(72%_0.012_254)] hover:text-[oklch(44%_0.21_25)] transition-all disabled:opacity-50"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>

      {/* Move buttons */}
      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMove(card.id, colKey, 'left')}
          disabled={disabled || !canLeft}
          title="ย้ายซ้าย"
          className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-600 border border-[oklch(90%_0.014_254)] text-[oklch(55%_0.020_254)] hover:border-[oklch(80%_0.020_254)] hover:bg-[oklch(96%_0.010_254)] disabled:opacity-30 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          {COL_ORDER[COL_ORDER.indexOf(colKey) - 1] === 'todo' ? 'Todo' : 'Doing'}
        </button>
        <button
          onClick={() => onMove(card.id, colKey, 'right')}
          disabled={disabled || !canRight}
          title="ย้ายขวา"
          className={[
            'flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-600 border transition-colors disabled:opacity-30',
            colKey === 'doing'
              ? 'border-[oklch(85%_0.06_160)] text-[oklch(42%_0.17_160)] hover:bg-[oklch(95%_0.038_160)]'
              : 'border-[oklch(85%_0.06_265)] text-[oklch(42%_0.20_265)] hover:bg-[oklch(93%_0.04_265)]',
          ].join(' ')}
        >
          {COL_ORDER[COL_ORDER.indexOf(colKey) + 1] === 'done' ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Done
            </>
          ) : (
            <>
              Doing
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
