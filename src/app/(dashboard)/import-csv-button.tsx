'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function ImportCsvButton() {
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
        if (!res.ok) {
          setMsg({ text: data.error ?? 'เกิดข้อผิดพลาด', ok: false })
        } else {
          setMsg({ text: `นำเข้า ${data.inserted} รายการ (ข้าม ${data.skipped} ซ้ำ)`, ok: true })
          router.refresh()
        }
      } catch {
        setMsg({ text: 'เกิดข้อผิดพลาด', ok: false })
      }
      setTimeout(() => setMsg(null), 4000)
    })
  }

  return (
    <div className="relative hidden md:flex items-center gap-2">
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-md border border-[oklch(90%_0.014_254)] px-3 py-1.5 text-[12px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)] transition-colors disabled:opacity-50"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        {isPending ? 'กำลังนำเข้า...' : 'Import CSV'}
      </button>
      {msg && (
        <span className={`absolute top-full mt-1.5 right-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-600 shadow-sm z-50 ${msg.ok ? 'bg-[oklch(95%_0.038_160)] text-[oklch(32%_0.14_160)]' : 'bg-[oklch(95%_0.04_25)] text-[oklch(40%_0.18_25)]'}`}>
          {msg.text}
        </span>
      )}
    </div>
  )
}
