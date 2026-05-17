'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallback() {
  return (
    <>
      <AuthenticateWithRedirectCallback />
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[oklch(98.2%_0.006_254)]">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-3 h-3 rounded-full bg-indigo-300 animate-bounce" />
        </div>
        <p className="text-sm text-slate-400">กำลังเข้าสู่ระบบ…</p>
      </div>
    </>
  )
}
