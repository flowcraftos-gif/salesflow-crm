'use client'

import { useState } from 'react'
import Link from 'next/link'

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="oklch(52% 0.245 265)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  const pro = annual ? { price: '฿1,490', sub: '/ปี · เทียบเท่า ฿124/เดือน', savings: 'ประหยัด ฿298' } : { price: '฿149', sub: '/เดือน · น้อยกว่าค่าคอมลูกค้า 1 คน', savings: null }
  const proPlus = annual ? { price: '฿2,990', sub: '/ปี · เทียบเท่า ฿249/เดือน', savings: 'ประหยัด ฿598' } : { price: '฿299', sub: '/เดือน · ลูกค้าไม่จำกัด ค่าคอมไม่จำกัด', savings: null }

  return (
    <section style={{ background: 'white', borderTop: '1px solid oklch(89% 0.014 265)', borderBottom: '1px solid oklch(89% 0.014 265)', padding: '5.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div data-r="1" style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(52% 0.245 265)', marginBottom: '0.75rem' }}>Pricing</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.02em', color: 'oklch(13% 0.028 265)' }}>ราคาที่ตัดสินใจได้เลย</h2>
          <p style={{ marginTop: '0.6rem', fontSize: '14px', color: 'oklch(42% 0.022 265)' }}>ไม่ต้องขอหัวหน้า ไม่ต้องคิด ROI ใหญ่</p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
              fontFamily: 'var(--font-heading)', cursor: 'pointer', border: 'none',
              background: !annual ? 'oklch(52% 0.245 265)' : 'transparent',
              color: !annual ? 'white' : 'oklch(55% 0.020 265)',
              transition: 'background 0.18s, color 0.18s',
            }}
          >
            รายเดือน
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
              fontFamily: 'var(--font-heading)', cursor: 'pointer', border: 'none',
              background: annual ? 'oklch(52% 0.245 265)' : 'transparent',
              color: annual ? 'white' : 'oklch(55% 0.020 265)',
              transition: 'background 0.18s, color 0.18s',
            }}
          >
            รายปี
          </button>
          {annual && (
            <span style={{ fontSize: '11px', fontWeight: 700, background: 'oklch(95% 0.038 160)', color: 'oklch(38% 0.17 160)', padding: '2px 8px', borderRadius: '999px' }}>
              ประหยัด 2 เดือน
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {/* Free */}
          <div data-r="1" style={{ border: '1px solid oklch(89% 0.014 265)', borderRadius: '18px', padding: '1.5rem', background: 'oklch(98.5% 0.007 265)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.25s, translate 0.2s' }} className="pc">
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'oklch(62% 0.016 265)', marginBottom: '0.5rem' }}>Free</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '36px', color: 'oklch(13% 0.028 265)', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: '0.25rem' }}>฿0</p>
            <p style={{ fontSize: '11px', color: 'oklch(62% 0.016 265)', marginBottom: '1.25rem' }}>ตลอดไป</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {['Contacts 20 คน', 'Pipeline + Tasks + Calendar + Board', 'Follow-up tracking', 'CRM Dashboard (เดือนปัจจุบัน)', 'Export CSV'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><CheckIcon /><span style={{ fontSize: '12px', color: 'oklch(42% 0.022 265)' }}>{f}</span></li>
              ))}
            </ul>
            <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', padding: '0.7rem', border: '1px solid oklch(89% 0.014 265)', borderRadius: '9px', fontSize: '13px', fontWeight: 700, color: 'oklch(42% 0.022 265)', textDecoration: 'none', background: 'white', fontFamily: 'var(--font-heading)' }}>
              เริ่มฟรี
            </Link>
          </div>

          {/* Pro */}
          <div data-r="2" style={{ border: '2px solid oklch(52% 0.245 265)', borderRadius: '18px', padding: '1.5rem', background: 'white', position: 'relative', boxShadow: '0 6px 24px oklch(52% 0.245 265 / 0.13)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.25s, translate 0.2s' }} className="pc">
            <span style={{ position: 'absolute', top: '-11px', left: '50%', translate: '-50% 0', background: 'oklch(52% 0.245 265)', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 11px', borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap' }}>ยอดนิยม</span>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'oklch(52% 0.245 265)', marginBottom: '0.5rem' }}>Pro</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '36px', color: 'oklch(13% 0.028 265)', letterSpacing: '-0.025em', lineHeight: 1 }}>{pro.price}</p>
              {pro.savings && <span style={{ fontSize: '11px', fontWeight: 700, background: 'oklch(95% 0.038 160)', color: 'oklch(38% 0.17 160)', padding: '2px 7px', borderRadius: '999px', marginBottom: '4px' }}>{pro.savings}</span>}
            </div>
            <p style={{ fontSize: '11px', color: 'oklch(62% 0.016 265)', marginBottom: '1.25rem' }}>{pro.sub}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {['Contacts 500 คน', 'ทุกอย่างใน Free', 'Import CSV', 'Policy reminder (วันครบเบี้ย)', 'ตั้งเป้าหมายรายเดือน', 'ย้อนดูย้อนหลัง 12 เดือน'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><CheckIcon /><span style={{ fontSize: '12px', color: 'oklch(42% 0.022 265)' }}>{f}</span></li>
              ))}
            </ul>
            <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', padding: '0.7rem', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: 'oklch(52% 0.245 265)', color: 'white', textDecoration: 'none', fontFamily: 'var(--font-heading)', boxShadow: '0 2px 8px oklch(52% 0.245 265 / 0.28)', transition: 'box-shadow 0.25s, translate 0.18s, background 0.18s' }} className="cta-p">
              เริ่มด้วย Pro →
            </Link>
          </div>

          {/* Pro+ */}
          <div data-r="3" style={{ border: '1px solid oklch(78% 0.028 265)', borderRadius: '18px', padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.25s, translate 0.2s' }} className="pc">
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'oklch(42% 0.022 265)', marginBottom: '0.5rem' }}>Pro+</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '36px', color: 'oklch(13% 0.028 265)', letterSpacing: '-0.025em', lineHeight: 1 }}>{proPlus.price}</p>
              {proPlus.savings && <span style={{ fontSize: '11px', fontWeight: 700, background: 'oklch(95% 0.038 160)', color: 'oklch(38% 0.17 160)', padding: '2px 7px', borderRadius: '999px', marginBottom: '4px' }}>{proPlus.savings}</span>}
            </div>
            <p style={{ fontSize: '11px', color: 'oklch(62% 0.016 265)', marginBottom: '1.25rem' }}>{proPlus.sub}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {['Contacts ไม่จำกัด', 'ทุกอย่างใน Pro', 'LINE message templates', 'Advanced analytics + charts', 'Priority Support (ตอบใน 4 ชม.)'].map(f => (
                <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><CheckIcon /><span style={{ fontSize: '12px', color: 'oklch(42% 0.022 265)' }}>{f}</span></li>
              ))}
            </ul>
            <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', padding: '0.7rem', borderRadius: '9px', fontSize: '13px', fontWeight: 700, border: '1px solid oklch(78% 0.028 265)', color: 'oklch(13% 0.028 265)', textDecoration: 'none', fontFamily: 'var(--font-heading)', transition: 'background 0.18s, border-color 0.18s' }} className="cta-g">
              เลือก Pro+ →
            </Link>
          </div>
        </div>

        <p data-r="1" style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '12px', color: 'oklch(62% 0.016 265)' }}>
          ยกเลิกได้ทุกเมื่อ ไม่มีสัญญาผูกมัด · มีคำถาม? <a href="mailto:support@tamdee.space" style={{ color: 'oklch(52% 0.245 265)', textDecoration: 'none' }}>support@tamdee.space</a>
        </p>
      </div>
    </section>
  )
}
