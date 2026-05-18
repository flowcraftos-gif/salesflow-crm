'use client'

import { useState } from 'react'

const TABS = [
  { label: 'Contacts', url: 'contacts' },
  { label: 'ประกัน', url: 'contacts/1' },
  { label: 'Dashboard', url: 'crm' },
  { label: 'Tasks', url: 'tasks' },
]

const CONTACTS = [
  { name: 'สมชาย วงศ์ไทย', status: 'Prospect', follow: 'วันนี้', sc: 'oklch(93% 0.04 265)', tc: 'oklch(42% 0.20 265)' },
  { name: 'นารี รักดี', status: 'Appointment', follow: 'พรุ่งนี้', sc: 'oklch(93% 0.04 145)', tc: 'oklch(38% 0.15 145)' },
  { name: 'ประสิทธิ์ ใจดี', status: 'Client', follow: '—', sc: 'oklch(92% 0.04 85)', tc: 'oklch(38% 0.16 85)' },
  { name: 'วิภา สุขสม', status: 'Lead', follow: 'พฤ. นี้', sc: 'oklch(93% 0.03 30)', tc: 'oklch(42% 0.14 30)' },
  { name: 'มานะ ดีใจ', status: 'Proposal', follow: 'ศ. นี้', sc: 'oklch(93% 0.04 295)', tc: 'oklch(42% 0.18 295)' },
]

function ContactsPanel() {
  return (
    <div style={{ display: 'flex', height: '320px' }}>
      {/* Sidebar */}
      <div style={{ width: '130px', background: 'oklch(97.5% 0.010 265)', borderRight: '1px solid oklch(89% 0.014 265)', padding: '10px 6px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 6px', marginBottom: '10px', borderBottom: '1px solid oklch(89% 0.014 265)', paddingBottom: '10px' }}>
          <img src="/tamdee-logo.png" width={18} height={18} style={{ borderRadius: '4px' }} alt="" />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-brand)', fontWeight: 800, color: 'oklch(13% 0.028 265)' }}>Tamdee</span>
        </div>
        {[{ l: 'Contacts', a: true }, { l: 'Tasks' }, { l: 'Calendar' }, { l: 'Board' }, { l: 'Dashboard' }].map(item => (
          <div key={item.l} style={{ padding: '5px 8px', borderRadius: '6px', marginBottom: '1px', background: item.a ? 'white' : 'transparent', boxShadow: item.a ? '0 1px 3px oklch(20% 0.04 265 / 0.08)' : 'none' }}>
            <span style={{ fontSize: '10px', fontWeight: item.a ? 700 : 500, color: item.a ? 'oklch(13% 0.028 265)' : 'oklch(62% 0.016 265)' }}>{item.l}</span>
          </div>
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '36px', borderBottom: '1px solid oklch(89% 0.014 265)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '6px', flexShrink: 0 }}>
          <div style={{ flex: 1, height: '20px', borderRadius: '4px', background: 'oklch(98.5% 0.007 265)', border: '1px solid oklch(89% 0.014 265)', display: 'flex', alignItems: 'center', paddingLeft: '7px' }}>
            <span style={{ fontSize: '9px', color: 'oklch(62% 0.016 265)' }}>ค้นหาชื่อหรือเบอร์...</span>
          </div>
          <div style={{ height: '20px', padding: '0 8px', borderRadius: '4px', background: 'oklch(52% 0.245 265)', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'white' }}>+ เพิ่ม</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {CONTACTS.map(r => (
            <div key={r.name} className={r.follow === 'วันนี้' ? 'today-row' : ''} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '6px', padding: '6px 12px', borderBottom: '1px solid oklch(97% 0.008 265)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: r.sc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: r.tc, flexShrink: 0 }}>{r.name[0]}</div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'oklch(13% 0.028 265)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
              </div>
              <span style={{ fontSize: '8px', fontWeight: 700, padding: '2px 5px', borderRadius: '999px', background: r.sc, color: r.tc, whiteSpace: 'nowrap' }}>{r.status}</span>
              <span style={{ fontSize: '9px', color: 'oklch(62% 0.016 265)' }}>AIA</span>
              <span style={{ fontSize: '9px', color: r.follow === 'วันนี้' ? 'oklch(52% 0.245 265)' : 'oklch(62% 0.016 265)', fontWeight: r.follow === 'วันนี้' ? 700 : 400, textAlign: 'right' }}>{r.follow}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InsurancePanel() {
  return (
    <div style={{ padding: '16px', height: '320px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
      {/* Contact header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid oklch(89% 0.014 265)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'oklch(93% 0.04 145)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: 'oklch(38% 0.15 145)', flexShrink: 0 }}>น</div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'oklch(13% 0.028 265)' }}>นารี รักดี</p>
          <p style={{ fontSize: '10px', color: 'oklch(62% 0.016 265)' }}>081-234-5678 · LINE: nari_rd</p>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: 'oklch(93% 0.04 145)', color: 'oklch(38% 0.15 145)' }}>Appointment</span>
      </div>
      {/* Insurance fields */}
      <div style={{ background: 'oklch(98.5% 0.007 265)', borderRadius: '10px', border: '1px solid oklch(89% 0.014 265)', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid oklch(89% 0.014 265)', background: 'oklch(96% 0.012 265)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'oklch(62% 0.016 265)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ข้อมูลประกัน</p>
        </div>
        {[['บริษัทประกัน', 'AIA Thailand'], ['ประเภท', 'สุขภาพ H&S Extra'], ['เลขกรมธรรม์', 'P-4521-08832'], ['เบี้ยต่อปี', '฿18,400'], ['วันครบเบี้ยถัดไป', '15 มิถุนายน 2568']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid oklch(94% 0.008 265)' }}>
            <span style={{ fontSize: '11px', color: 'oklch(62% 0.016 265)' }}>{l}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'oklch(13% 0.028 265)' }}>{v}</span>
          </div>
        ))}
      </div>
      {/* Alert */}
      <div style={{ padding: '10px 12px', background: 'oklch(96% 0.025 55)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '999px', background: 'oklch(68% 0.17 55)', flexShrink: 0 }} />
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'oklch(38% 0.14 55)' }}>ครบกำหนดใน 28 วัน — ควรติดต่อลูกค้า</p>
      </div>
    </div>
  )
}

const PIPELINE = [['Lead', 12, 100], ['Prospect', 8, 67], ['Appointment', 5, 42], ['Proposal', 3, 25], ['Client', 2, 17]] as const

function DashboardPanel() {
  return (
    <div style={{ padding: '16px', height: '320px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {[{ l: 'Contacts', v: '48' }, { l: 'ตามวันนี้', v: '5' }, { l: 'เบี้ยครบ', v: '3' }, { l: 'ปิดเดือนนี้', v: '2' }].map(kpi => (
          <div key={kpi.l} style={{ background: 'oklch(98.5% 0.007 265)', borderRadius: '8px', padding: '8px 10px', border: '1px solid oklch(89% 0.014 265)' }}>
            <p style={{ fontSize: '20px', fontWeight: 800, color: 'oklch(13% 0.028 265)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{kpi.v}</p>
            <p style={{ fontSize: '9px', color: 'oklch(62% 0.016 265)', marginTop: '2px' }}>{kpi.l}</p>
          </div>
        ))}
      </div>
      <div style={{ background: 'oklch(98.5% 0.007 265)', borderRadius: '10px', padding: '12px', border: '1px solid oklch(89% 0.014 265)', flex: 1 }}>
        <p style={{ fontSize: '9px', fontWeight: 700, color: 'oklch(62% 0.016 265)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pipeline</p>
        {PIPELINE.map(([label, count, pct]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '9px', color: 'oklch(62% 0.016 265)', width: '64px', flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: '5px', borderRadius: '999px', background: 'oklch(90% 0.012 265)' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'oklch(52% 0.245 265)', borderRadius: '999px', transition: 'width 0.8s cubic-bezier(0.25,1,0.5,1)' }} />
            </div>
            <span style={{ fontSize: '9px', color: 'oklch(62% 0.016 265)', width: '16px', textAlign: 'right' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TasksPanel() {
  return (
    <div style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid oklch(89% 0.014 265)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'oklch(62% 0.016 265)' }}>Tasks วันนี้</p>
        <span style={{ fontSize: '10px', background: 'oklch(52% 0.245 265)', color: 'white', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>5 รายการ</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {[
          { label: 'โทรตาม สมชาย วงศ์ไทย', time: '10:00', done: true },
          { label: 'ส่งใบเสนอราคา นารี รักดี', time: '13:00', done: false },
          { label: 'นัดพบ ประสิทธิ์ ใจดี', time: '15:30', done: false },
          { label: 'ติดตามเบี้ย วิภา สุขสม', time: '17:00', done: false },
          { label: 'Follow-up มานะ ดีใจ', time: '18:00', done: false },
        ].map(task => (
          <div key={task.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderBottom: '1px solid oklch(97% 0.008 265)' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${task.done ? 'oklch(52% 0.245 265)' : 'oklch(89% 0.014 265)'}`, background: task.done ? 'oklch(52% 0.245 265)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {task.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <span style={{ flex: 1, fontSize: '11px', fontWeight: 500, color: task.done ? 'oklch(62% 0.016 265)' : 'oklch(13% 0.028 265)', textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</span>
            <span style={{ fontSize: '10px', color: 'oklch(62% 0.016 265)' }}>{task.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PANELS = [ContactsPanel, InsurancePanel, DashboardPanel, TasksPanel]

const CSS = `
  @keyframes panel-in {
    from { opacity: 0; scale: 0.98; translate: 0 6px; }
    to   { opacity: 1; scale: 1;    translate: 0 0; }
  }
  .panel-active { animation: panel-in 0.28s cubic-bezier(0.16,1,0.3,1) both; }
`

export function HeroMock() {
  const [active, setActive] = useState(0)
  const Panel = PANELS[active]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="hero-mock hi6" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Stacked panels */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '-12px', right: '-10px', width: '100%', height: '100%', borderRadius: '14px', background: 'white', border: '1px solid oklch(89% 0.014 265)', opacity: 0.45 }} />
          <div style={{ position: 'absolute', bottom: '-6px', right: '-5px', width: '100%', height: '100%', borderRadius: '14px', background: 'white', border: '1px solid oklch(89% 0.014 265)', opacity: 0.72 }} />
          <div
            key={active}
            className="panel-active"
            style={{ position: 'relative', zIndex: 2, borderRadius: '14px', overflow: 'hidden', border: '1px solid oklch(89% 0.014 265)', background: 'white', boxShadow: '0 8px 32px oklch(20% 0.05 265 / 0.12), 0 2px 8px oklch(20% 0.05 265 / 0.06)' }}
          >
            <div style={{ height: '28px', background: 'oklch(96% 0.010 265)', borderBottom: '1px solid oklch(89% 0.014 265)', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 10px' }}>
              {['oklch(72% 0.15 25)', 'oklch(78% 0.16 85)', 'oklch(72% 0.17 145)'].map((c, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
              ))}
              <div style={{ flex: 1, margin: '0 6px', height: '15px', borderRadius: '3px', background: 'oklch(92% 0.008 265)', display: 'flex', alignItems: 'center', paddingLeft: '7px' }}>
                <span style={{ fontSize: '8px', color: 'oklch(62% 0.016 265)' }}>tamdee.space/dashboard/{TABS[active].url}</span>
              </div>
            </div>
            <Panel />
          </div>
        </div>

        {/* Dot indicators — hidden on mobile via parent .hero-mock */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', paddingBottom: '4px' }}>
          {TABS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: active === i ? '20px' : '7px',
                height: '7px',
                borderRadius: '999px',
                background: active === i ? 'oklch(52% 0.245 265)' : 'oklch(84% 0.018 265)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), background 0.2s',
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
