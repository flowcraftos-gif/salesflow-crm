'use client'

import { SignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

function InAppBrowserBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const isInApp = /FBAN|FBAV|Instagram|Line\/|MicroMessenger/i.test(ua)
    if (isInApp) setShow(true)
  }, [])

  if (!show) return null

  return (
    <div style={{
      background: 'oklch(96% 0.042 80)', border: '1px solid oklch(88% 0.08 68)',
      borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
      maxWidth: '400px', fontSize: '13px', color: 'oklch(38% 0.14 55)', lineHeight: 1.6,
    }}>
      เบราว์เซอร์ในแอปอาจทำให้ล็อคอินไม่ผ่าน<br />
      <strong>กรุณาเปิดใน Safari หรือ Chrome แทน</strong>
      <div style={{ marginTop: '8px' }}>
        <button
          onClick={() => {
            const url = window.location.href
            window.location.href = url
          }}
          style={{
            background: 'oklch(52% 0.245 265)', color: 'white',
            border: 'none', borderRadius: '7px', padding: '6px 14px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          เปิดใน Browser →
        </button>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[oklch(98.2%_0.006_254)] px-4">
      <InAppBrowserBanner />
      <SignIn />
    </div>
  )
}
