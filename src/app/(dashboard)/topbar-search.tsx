'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

export function TopbarSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [, startTransition] = useTransition()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    // Only search on contacts page
    if (!pathname.startsWith('/dashboard/contacts')) {
      startTransition(() => {
        router.push(`/dashboard/contacts?q=${encodeURIComponent(v)}`)
      })
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    if (v) {
      params.set('q', v)
      params.delete('filter')
    } else {
      params.delete('q')
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }, [pathname, router, searchParams])

  return (
    <div className="relative flex-1 md:max-w-xs">
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[oklch(68%_0.016_254)] pointer-events-none"
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        value={value}
        onChange={handleChange}
        className="w-full rounded-md border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)] py-1.5 pl-8 pr-3 text-[13px] outline-none focus:border-[oklch(52%_0.245_265)] focus:ring-2 focus:ring-[oklch(93%_0.04_265)] placeholder:text-[oklch(68%_0.016_254)]"
        placeholder="ค้นหาชื่อ, เบอร์, LINE ID..."
      />
    </div>
  )
}
