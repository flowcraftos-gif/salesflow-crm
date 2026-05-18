'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Template Data ────────────────────────────────────────

type Template = {
  id: string
  name: string
  text: string
}

type Category = {
  label: string
  icon: React.ReactNode
  templates: Template[]
}

const CATEGORIES: Category[] = [
  {
    label: 'ติดตามลูกค้า (Lead)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    templates: [
      {
        id: 'follow-1',
        name: 'ทักทายครั้งแรก',
        text: `สวัสดีครับคุณ[ชื่อ] ผม[ชื่อคุณ] นะครับ ได้รับเบอร์จาก[แหล่งที่มา]

อยากแนะนำตัวและสอบถามว่าตอนนี้มีแผนดูแลประกันชีวิต/สุขภาพอยู่ไหมครับ? ยินดีให้คำปรึกษาเบื้องต้นฟรี ไม่มีข้อผูกมัดเลยครับ

สะดวกคุยเมื่อไหรดีครับ?`,
      },
      {
        id: 'follow-2',
        name: 'Follow-up หลังโทรไม่รับ',
        text: `สวัสดีครับคุณ[ชื่อ] โทรไปเมื่อกี้ ไม่ได้รบกวนนะครับ 😊

ถ้าสะดวกคุยเรื่องแผนประกันที่เหมาะกับคุณ รบกวนติดต่อกลับได้เลยครับ หรือบอก LINE ไว้ให้ผมส่งข้อมูลเพิ่มเติมก็ได้

ขอบคุณครับ`,
      },
      {
        id: 'follow-3',
        name: 'ส่งข้อมูลหลังพูดคุย',
        text: `สวัสดีครับคุณ[ชื่อ] ขอบคุณที่ให้เวลาคุยวันนี้นะครับ 🙏

ตามที่คุยกันไว้ ผมขอสรุปแผนที่น่าสนใจให้ดูครับ:
▸ แผน: [ชื่อแผน]
▸ เบี้ย: ฿[เบี้ย]/ปี
▸ ความคุ้มครอง: [รายละเอียด]

ถ้ามีคำถามหรืออยากปรับแผนได้เลยครับ`,
      },
    ],
  },
  {
    label: 'แจ้งครบกำหนดเบี้ย',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    templates: [
      {
        id: 'renewal-1',
        name: 'แจ้งล่วงหน้า 30 วัน',
        text: `สวัสดีครับคุณ[ชื่อ] 🙏

แจ้งให้ทราบว่ากรมธรรม์เลขที่ [เลขกรมธรรม์] ของคุณจะครบกำหนดชำระเบี้ยในวันที่ [วันที่] ครับ

เบี้ยประกัน: ฿[เบี้ย]/ปี
บริษัท: [บริษัท]

ถ้าสะดวก แจ้งยืนยันการชำระด้วยนะครับ หรือถ้ามีคำถามอยากสอบถามได้เลยครับ`,
      },
      {
        id: 'renewal-2',
        name: 'แจ้งเตือน 7 วัน',
        text: `สวัสดีครับคุณ[ชื่อ] 🔔

เตือนความจำนะครับ กรมธรรม์ [เลขกรมธรรม์] จะครบกำหนดเบี้ยอีก 7 วัน (วันที่ [วันที่])

เพื่อไม่ให้ความคุ้มครองสะดุด รบกวนดำเนินการชำระภายในวันที่กำหนดด้วยนะครับ

ติดปัญหาอะไรผมพร้อมช่วยครับ 🙏`,
      },
      {
        id: 'renewal-3',
        name: 'ขอบคุณหลังต่ออายุ',
        text: `สวัสดีครับคุณ[ชื่อ] 😊

ขอบคุณที่ต่ออายุกรมธรรม์ครับ ความคุ้มครองของคุณยังคงต่อเนื่องนะครับ

ถ้ามีการเปลี่ยนแปลงในชีวิต เช่น แต่งงาน มีลูก หรืออยากเพิ่มความคุ้มครอง ผมยินดีให้คำแนะนำเสมอครับ 👍`,
      },
    ],
  },
  {
    label: 'ต้อนรับลูกค้าใหม่',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    templates: [
      {
        id: 'welcome-1',
        name: 'ยืนยันกรมธรรม์',
        text: `สวัสดีครับคุณ[ชื่อ] ยินดีต้อนรับสู่ครอบครัว[บริษัท]ครับ 🎉

กรมธรรม์ของคุณได้รับการอนุมัติแล้วนะครับ
▸ เลขกรมธรรม์: [เลขกรมธรรม์]
▸ เริ่มคุ้มครอง: [วันที่]
▸ ชำระเบี้ยทุกปีในวัน: [วันที่]

ผมจะดูแลคุณตลอดครับ มีคำถามหรือปัญหาอะไรติดต่อผมได้เลย 🙏`,
      },
      {
        id: 'welcome-2',
        name: 'ส่ง contact ตัวแทน',
        text: `สวัสดีครับคุณ[ชื่อ] 😊

ขอบคุณที่ไว้วางใจผมดูแลประกันให้นะครับ ฝากเก็บเบอร์ผมไว้ด้วยนะครับ

📞 [ชื่อตัวแทน] (ตัวแทนประกัน [บริษัท])
📱 [เบอร์โทร]

ถ้ามีอะไรหรืออยากเพิ่มความคุ้มครอง โทรหาผมได้เลยครับ ยินดีเสมอ 🙏`,
      },
    ],
  },
  {
    label: 'วันเกิด',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    templates: [
      {
        id: 'birthday-1',
        name: 'อวยพรวันเกิด',
        text: `สุขสันต์วันเกิดครับคุณ[ชื่อ] 🎂🎉

ขอให้มีสุขภาพแข็งแรง อายุยืนยาว และโชคดีตลอดปีนะครับ

ในฐานะตัวแทนประกันที่ดูแลคุณอยู่ อยากให้รู้ว่าผมพร้อมช่วยเสมอถ้ามีอะไรเปลี่ยนแปลงในชีวิต 🙏`,
      },
      {
        id: 'birthday-2',
        name: 'อวยพร + ตรวจแผน',
        text: `สุขสันต์วันเกิดครับคุณ[ชื่อ] 🎉

ขอให้ปีนี้เป็นปีที่ดีสำหรับคุณและครอบครัวนะครับ

ว่าง ๆ อยากนัดทบทวนแผนประกันที่มีอยู่ด้วยนะครับ เพื่อให้มั่นใจว่าความคุ้มครองยังเหมาะสมกับชีวิตปัจจุบัน สะดวกวันไหนบ้างครับ?`,
      },
    ],
  },
  {
    label: 'หลังโทรหา',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    templates: [
      {
        id: 'aftercall-1',
        name: 'สรุปหลังคุยโทรศัพท์',
        text: `สวัสดีครับคุณ[ชื่อ] ขอบคุณที่คุยด้วยนะครับ 😊

สรุปสิ่งที่คุยกันไว้:
▸ [ประเด็นที่ 1]
▸ [ประเด็นที่ 2]
▸ ขั้นตอนต่อไป: [ขั้นตอน]

ถ้ามีคำถามเพิ่มเติมติดต่อผมได้เลยครับ 🙏`,
      },
      {
        id: 'aftercall-2',
        name: 'นัดหมายครั้งต่อไป',
        text: `สวัสดีครับคุณ[ชื่อ] 🙏

ยืนยันนัดหมายครั้งต่อไปนะครับ:
📅 วันที่: [วันที่]
🕐 เวลา: [เวลา]
📍 สถานที่/ช่องทาง: [ที่/ออนไลน์]

ถ้ามีการเปลี่ยนแปลงรบกวนแจ้งผมล่วงหน้าด้วยนะครับ ขอบคุณครับ`,
      },
    ],
  },
]

// ── Copy Button ───────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-700 transition-all shrink-0 ${
        copied
          ? 'bg-[oklch(95%_0.038_160)] text-[oklch(42%_0.17_160)] border border-[oklch(88%_0.06_160)]'
          : 'bg-[oklch(93%_0.04_265)] text-[oklch(42%_0.20_265)] border border-[oklch(85%_0.06_265)] hover:bg-[oklch(88%_0.06_265)]'
      }`}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          คัดลอกแล้ว
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

// ── Template Card ─────────────────────────────────────────

function TemplateCard({ template }: { template: Template }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-[oklch(90%_0.014_254)] rounded-lg bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          <svg
            width="12" height="12"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`shrink-0 transition-transform text-[oklch(68%_0.016_254)] ${expanded ? 'rotate-90' : ''}`}
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="text-[13px] font-600 text-[oklch(30%_0.015_254)]">{template.name}</span>
        </button>
        <CopyButton text={template.text} />
      </div>
      {expanded && (
        <div className="px-4 pb-3">
          <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-[oklch(46%_0.022_254)] bg-[oklch(98.2%_0.006_254)] rounded-md px-3 py-2.5 border border-[oklch(92%_0.010_254)] font-[system-ui,-apple-system,sans-serif]">
            {template.text}
          </pre>
        </div>
      )}
    </div>
  )
}

// ── Category Section ──────────────────────────────────────

function CategorySection({ category }: { category: Category }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-lg border border-[oklch(90%_0.014_254)] bg-[oklch(99%_0.004_254)] overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 border-b border-[oklch(90%_0.014_254)] hover:bg-[oklch(97%_0.010_254)] transition-colors"
      >
        <span className="text-[oklch(52%_0.245_265)]">{category.icon}</span>
        <span className="text-[13px] font-700 text-[oklch(18%_0.012_254)] flex-1 text-left">{category.label}</span>
        <span className="text-[11px] text-[oklch(65%_0.016_254)]">{category.templates.length} templates</span>
        <svg
          width="13" height="13"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          className={`text-[oklch(68%_0.016_254)] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="p-3 space-y-2">
          {category.templates.map(t => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────

export default function LineTemplatesPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="mb-5">
        <h1 className="text-[20px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">LINE Message Templates</h1>
        <p className="text-[12px] text-[oklch(60%_0.016_254)] mt-0.5">กด Copy แล้ววางใน LINE ได้เลย — แก้ [ข้อความในวงเล็บ] ตามกรณี</p>
      </div>

      <div className="mb-4 rounded-lg border border-[oklch(85%_0.06_265)] bg-[oklch(96%_0.020_265)] px-4 py-3 text-[12px] text-[oklch(42%_0.20_265)]">
        แทนที่ข้อความใน <span className="font-700">[วงเล็บ]</span> ด้วยข้อมูลจริงก่อนส่งทุกครั้ง
      </div>

      <div className="space-y-3">
        {CATEGORIES.map(cat => (
          <CategorySection key={cat.label} category={cat} />
        ))}
      </div>
    </div>
  )
}
