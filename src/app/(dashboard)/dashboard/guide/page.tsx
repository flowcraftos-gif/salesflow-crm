import Link from 'next/link'

const FEATURES = [
  {
    href: '/dashboard/contacts',
    icon: 'users',
    title: 'Contacts',
    what: 'เก็บข้อมูลลูกค้าและ lead ทุกคน',
    how: [
      'เพิ่ม contact พร้อมเบอร์, LINE, status, แหล่งที่มา, มูลค่าประมาณ',
      'ตั้งวันนัด follow-up — ระบบจะเตือนใน Dashboard เมื่อถึงวัน',
      'บันทึกหมายเหตุ, แท็กประเภทประกัน, track status Lead → Client',
      'Export/Import CSV เพื่อย้ายข้อมูลจากระบบเดิม',
    ],
  },
  {
    href: '/dashboard/tasks',
    icon: 'check',
    title: 'Tasks',
    what: 'จัดการงานที่ต้องทำ แยกตาม contact',
    how: [
      'สร้าง task พร้อมวันครบกำหนด และผูกกับ contact ที่เกี่ยวข้อง',
      'Task ที่ครบกำหนดวันนี้จะขึ้นใน Board → section "วันนี้" อัตโนมัติ',
      'ติ๊กเสร็จได้โดยตรงจาก Board หรือในหน้า Tasks',
    ],
  },
  {
    href: '/dashboard/calendar',
    icon: 'cal',
    title: 'Calendar',
    what: 'บันทึกนัดหมายกับลูกค้า',
    how: [
      'สร้างนัดพร้อมผูก contact, วันเวลา, หัวข้อ',
      'นัดวันนี้ขึ้น Board → section "วันนี้" อัตโนมัติ',
      'ดูภาพรวมนัดทั้งเดือนในมุมมอง calendar',
      'นับเป็น "นัดหมาย" ใน CRM Dashboard เพื่อเทียบเป้า',
    ],
  },
  {
    href: '/dashboard/board',
    icon: 'board',
    title: 'Board',
    what: 'หน้าจอเดียวสำหรับงานประจำวัน',
    how: [
      'Task และนัดวันนี้ดึงขึ้นมาเองในส่วน "วันนี้" — ไม่ต้องเปิดหลายหน้า',
      'สร้างการ์ดเพิ่มเองได้ และผูกกับ contact ที่เกี่ยวข้อง',
      'กดค้างแล้วลากการ์ดไป To Do → Doing → Done',
      'เหมาะสำหรับเปิดตอนเช้าเพื่อ plan วันทำงาน',
    ],
  },
  {
    href: '/dashboard/crm',
    icon: 'chart',
    title: 'Dashboard CRM',
    what: 'วิเคราะห์ performance การขาย',
    how: [
      'เห็น KPI รายเดือน: นัด, follow-up, client ใหม่, conversion rate',
      'รายชื่อ follow-up ที่ค้างวันนี้ + ปุ่มโทรและ log สายได้เลย',
      'Pipeline ทุก stage, แหล่งที่มา lead, มูลค่าใน pipeline',
      'กราฟ trend contact ใหม่ 6 เดือน เพื่อดู growth',
      'ตั้งเป้าหมายรายเดือน (Pro)',
    ],
  },
]

const ICON_PATHS: Record<string, React.ReactNode> = {
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  check: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  cal:   <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  board: <><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="10" rx="1"/><rect x="14" y="17" width="7" height="4" rx="1"/></>,
  chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></>,
}

export default function GuidePage() {
  return (
    <div className="p-4 md:p-5 max-w-[700px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">วิธีใช้งาน</h1>
        <p className="text-[13px] text-[oklch(55%_0.020_254)]">ภาพรวมแต่ละฟีเจอร์และวิธีใช้ให้ได้ประโยชน์สูงสุด</p>
      </div>

      {/* Quick start */}
      <div className="mb-6 rounded-xl border border-[oklch(85%_0.06_265)] bg-[oklch(97%_0.020_265)] px-5 py-4">
        <p className="text-[13px] font-700 text-[oklch(28%_0.012_254)] mb-2">เริ่มต้นใน 3 ขั้นตอน</p>
        <ol className="space-y-1.5 text-[12px] text-[oklch(42%_0.022_254)]">
          <li><span className="font-700 text-[oklch(42%_0.20_265)]">1.</span> เพิ่ม Contact แรก — ชื่อ, เบอร์, แหล่งที่มา, ตั้งวัน follow-up</li>
          <li><span className="font-700 text-[oklch(42%_0.20_265)]">2.</span> สร้างนัดหมายหรือ Task ผูกกับ contact นั้น</li>
          <li><span className="font-700 text-[oklch(42%_0.20_265)]">3.</span> เปิด Board ทุกเช้า — งานและนัดวันนี้จะขึ้นอัตโนมัติ</li>
        </ol>
      </div>

      {/* Feature cards */}
      <div className="space-y-3">
        {FEATURES.map(f => (
          <div key={f.href} className="overflow-hidden rounded-xl border border-[oklch(90%_0.014_254)] bg-white">
            <div className="flex items-center gap-3 border-b border-[oklch(90%_0.014_254)] px-5 py-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[oklch(52%_0.245_265)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  {ICON_PATHS[f.icon]}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-700 text-[oklch(18%_0.012_254)]">{f.title}</p>
                <p className="text-[11px] text-[oklch(55%_0.020_254)]">{f.what}</p>
              </div>
              <Link
                href={f.href}
                className="shrink-0 rounded-md border border-[oklch(90%_0.014_254)] px-3 py-1 text-[11px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)] transition-colors"
              >
                เปิด →
              </Link>
            </div>
            <ul className="px-5 py-3 space-y-1.5">
              {f.how.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-[oklch(46%_0.022_254)]">
                  <span className="mt-[3px] shrink-0 w-1 h-1 rounded-full bg-[oklch(65%_0.016_254)]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
