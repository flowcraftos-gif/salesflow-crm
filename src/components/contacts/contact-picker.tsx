'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ContactResult {
  id: string
  name: string
  phone: string
  status: string
}

interface ContactPickerProps {
  onSelect: (contact: { id: string; name: string } | null) => void
  selectedName?: string
}

const STATUS_COLORS: Record<string, string> = {
  Lead:        'bg-[oklch(96%_0.008_254)] text-[oklch(58%_0.02_254)]',
  Prospect:    'bg-[oklch(93%_0.04_265)] text-[oklch(40%_0.20_265)]',
  Appointment: 'bg-[oklch(96%_0.042_80)] text-[oklch(50%_0.18_68)]',
  Client:      'bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)]',
  Proposal:    'bg-[oklch(95%_0.030_300)] text-[oklch(42%_0.20_300)]',
  Lost:        'bg-[oklch(95%_0.040_25)] text-[oklch(44%_0.21_25)]',
}

export function ContactPicker({ onSelect, selectedName }: ContactPickerProps) {
  const [query, setQuery] = useState(selectedName ?? '')
  const [results, setResults] = useState<ContactResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(q)}`)
        if (res.ok) {
          const data = (await res.json()) as ContactResult[]
          setResults(data)
          setOpen(true)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 220)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (!val) {
      onSelect(null)
      setResults([])
      setOpen(false)
    } else {
      search(val)
    }
  }

  function handleSelect(c: ContactResult) {
    setQuery(c.name)
    setOpen(false)
    setResults([])
    onSelect({ id: c.id, name: c.name })
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect(null)
  }

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[oklch(68%_0.016_254)] pointer-events-none"
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="ค้นหา contact..."
          className="h-9 w-44 rounded-md border border-[oklch(90%_0.014_254)] bg-white py-1.5 pl-7 pr-6 text-[13px] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-2 focus:ring-[oklch(93%_0.04_265)] placeholder:text-[oklch(68%_0.016_254)]"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[oklch(68%_0.016_254)] hover:text-[oklch(40%_0.015_254)]"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        {loading && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(52% 0.245 265)" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 overflow-hidden rounded-lg border border-[oklch(90%_0.014_254)] bg-white shadow-lg">
          {results.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[oklch(98.2%_0.006_254)]"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[oklch(52%_0.245_265)] text-[10px] font-800 text-white">
                {c.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-600 text-[oklch(18%_0.012_254)]">{c.name}</div>
                <div className="text-[11px] text-[oklch(65%_0.016_254)]">{c.phone}</div>
              </div>
              <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-600 ${STATUS_COLORS[c.status] ?? 'bg-[oklch(96%_0.008_254)] text-[oklch(58%_0.02_254)]'}`}>
                {c.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && !loading && query.trim() && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border border-[oklch(90%_0.014_254)] bg-white px-3 py-2.5 text-[12px] text-[oklch(65%_0.016_254)] shadow-lg">
          ไม่พบ contact ที่ตรงกัน
        </div>
      )}
    </div>
  )
}
