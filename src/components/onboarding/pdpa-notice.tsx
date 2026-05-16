'use client'

import { useEffect, useState } from 'react'

const PDPA_KEY = 'sf_pdpa_accepted'

export function PdpaNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(PDPA_KEY) === 'true'
    setVisible(!accepted)
  }, [])

  if (!visible) return null

  function accept() {
    localStorage.setItem(PDPA_KEY, 'true')
    setVisible(false)
  }

  return (
    <div className="flex items-center gap-3 border-b border-[oklch(88%_0.035_265)] bg-[oklch(96.5%_0.018_265)] px-5 py-2">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0 text-[oklch(52%_0.245_265)]"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p className="flex-1 text-[11px] text-[oklch(42%_0.022_254)]">
        ข้อมูล Prospect ที่บันทึกในระบบนี้อยู่ภายใต้ความรับผิดชอบของคุณตาม{' '}
        <span className="font-600">พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>{' '}
        — โปรดเก็บรักษาข้อมูลด้วยความระมัดระวัง
      </p>
      <button
        onClick={accept}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-600 text-[oklch(42%_0.022_254)] transition-colors hover:bg-[oklch(90%_0.025_265)]"
      >
        รับทราบ
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}
