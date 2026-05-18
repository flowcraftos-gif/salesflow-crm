import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { RevealObserver } from './reveal-observer'
import { HeroMock } from './hero-mock'

const title = 'Tamdee — CRM สำหรับตัวแทนประกันไทย | ลูกค้าไม่หลุด เบี้ยไม่ขาด'
const description = 'จัดการลูกค้าประกัน ติดตามเบี้ย ต่ออายุ และนัดคุย ง่ายกว่า Excel ฿149/เดือน รองรับทุกค่าย ทุกประเภทประกัน'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['CRM ตัวแทนประกัน', 'ระบบจัดการลูกค้าประกัน', 'CRM ประกัน', 'ตัวแทนประกันไทย', 'เบี้ยประกัน', 'ต่ออายุประกัน', 'นายหน้าประกัน'],
  openGraph: { title, description, url: 'https://tamdee.space', siteName: 'Tamdee', locale: 'th_TH', type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
  alternates: { canonical: 'https://tamdee.space' },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tamdee',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description,
  url: 'https://tamdee.space',
  offers: { '@type': 'Offer', price: '149', priceCurrency: 'THB' },
  inLanguage: 'th',
}

const CSS = `
  :root {
    --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-quart: cubic-bezier(0.25, 1, 0.5, 1);
    --blue: oklch(52% 0.245 265);
    --ink: oklch(13% 0.028 265);
    --ink-2: oklch(42% 0.022 265);
    --ink-3: oklch(62% 0.016 265);
    --surface: oklch(98.5% 0.007 265);
    --surface-2: oklch(94% 0.018 265);
    --border: oklch(89% 0.014 265);
  }

  /* Hero entrance */
  @keyframes fade-up {
    from { opacity: 0; translate: 0 16px; }
    to   { opacity: 1; translate: 0 0; }
  }
  .hi1 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
  .hi2 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
  .hi3 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
  .hi4 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.42s both; }
  .hi5 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.52s both; }
  .hi6 { animation: fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both; }

  /* Scroll reveal */
  [data-r] {
    opacity: 0; translate: 0 22px;
    transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), translate 0.65s cubic-bezier(0.16,1,0.3,1);
  }
  [data-r="2"] { transition-delay: 0.1s; }
  [data-r="3"] { transition-delay: 0.2s; }
  [data-rl] {
    opacity: 0; translate: -28px 0;
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), translate 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  [data-rr] {
    opacity: 0; translate: 28px 0;
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.08s, translate 0.7s cubic-bezier(0.16,1,0.3,1) 0.08s;
  }

  /* Pipeline bar */
  .bar-fill {
    width: 0;
    transition: width 1s cubic-bezier(0.25,1,0.5,1) 0.1s;
  }

  /* Hero mock entrance + float */
  @keyframes mock-in {
    from { opacity: 0; scale: 0.96; translate: 0 16px; }
    to   { opacity: 1; scale: 1;    translate: 0 0; }
  }
  @keyframes mock-float {
    0%, 100% { translate: 0 0px; }
    50%       { translate: 0 -7px; }
  }
  .hi6 {
    animation:
      mock-in 0.9s cubic-bezier(0.16,1,0.3,1) 0.22s both,
      mock-float 6s ease-in-out 1.2s infinite;
  }

  /* "วันนี้" row pulse */
  @keyframes today-pulse {
    0%, 100% { background: transparent; }
    50%       { background: oklch(95% 0.03 265); }
  }
  .today-row {
    animation: today-pulse 3s ease-in-out 1.8s infinite;
  }

  /* CTA hover */
  .cta-p {
    transition: box-shadow 0.25s var(--ease-quart), translate 0.18s var(--ease-quart), background 0.18s;
  }
  .cta-p:hover { translate: 0 -1px; box-shadow: 0 6px 22px oklch(52% 0.245 265 / 0.4); }
  .cta-p:active { translate: 0 0; }

  .cta-g { transition: background 0.18s, color 0.18s, border-color 0.18s; }
  .cta-g:hover { background: var(--surface-2); border-color: oklch(80% 0.020 265); }

  /* Pricing card lift */
  .pc { transition: box-shadow 0.25s var(--ease-quart), translate 0.2s var(--ease-quart); }
  .pc:hover { translate: 0 -3px; box-shadow: 0 14px 40px oklch(25% 0.06 265 / 0.13); }

  /* Problem rows */
  .prob-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    padding: 2rem 0;
    border-top: 1px solid var(--border);
    align-items: start;
  }

  /* Hero background */
  .hero-section {
    background: radial-gradient(ellipse 90% 70% at 55% -5%, oklch(92% 0.038 265 / 0.55) 0%, transparent 65%), var(--surface);
  }

  @media (max-width: 700px) {
    .prob-row { grid-template-columns: 1fr; gap: 0.875rem; }
    .hero-mock { display: none !important; }
    .feat-grid { grid-template-columns: 1fr !important; gap: 2rem !important; margin-bottom: 3rem !important; }
    .price-grid { grid-template-columns: 1fr !important; }
    .testi-grid { grid-template-columns: 1fr !important; }
    .hero-section section { grid-template-columns: 1fr !important; padding-top: 2.5rem !important; padding-bottom: 2rem !important; }
    section[style*="5.5rem 1.5rem"] { padding-top: 3.5rem !important; padding-bottom: 3.5rem !important; }
    section[style*="5rem 1.5rem"] { padding-top: 3rem !important; padding-bottom: 3rem !important; }
    section[style*="6rem 1.5rem"] { padding-top: 3.5rem !important; padding-bottom: 3.5rem !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    [data-r] { opacity: 1 !important; translate: 0 0 !important; }
  }
`

const CONTACTS = [
  { name: 'สมชาย วงศ์ไทย', status: 'Prospect', follow: 'วันนี้', sc: 'oklch(93% 0.04 265)', tc: 'oklch(42% 0.20 265)' },
  { name: 'นารี รักดี', status: 'Appointment', follow: 'พรุ่งนี้', sc: 'oklch(93% 0.04 145)', tc: 'oklch(38% 0.15 145)' },
  { name: 'ประสิทธิ์ ใจดี', status: 'Client', follow: '—', sc: 'oklch(92% 0.04 85)', tc: 'oklch(38% 0.16 85)' },
  { name: 'วิภา สุขสม', status: 'Lead', follow: 'พฤ. นี้', sc: 'oklch(93% 0.03 30)', tc: 'oklch(42% 0.14 30)' },
  { name: 'มานะ ดีใจ', status: 'Proposal', follow: 'ศ. นี้', sc: 'oklch(93% 0.04 295)', tc: 'oklch(42% 0.18 295)' },
]

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard/contacts')

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RevealObserver />

      <div style={{ fontFamily: 'var(--font-body, system-ui)', color: 'var(--ink)', background: 'var(--surface)', minHeight: '100vh' }}>

        {/* ── Navbar ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'oklch(99% 0.006 265 / 0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none' }}>
              <img src="/tamdee-logo.png" alt="Tamdee" width={28} height={28} style={{ borderRadius: '8px' }} />
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '16px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>Tamdee</span>
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Link href="/sign-in" className="cta-g" style={{ padding: '0.425rem 0.9rem', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', textDecoration: 'none' }}>
                เข้าสู่ระบบ
              </Link>
              <Link href="/sign-up" className="cta-p" style={{ padding: '0.425rem 1rem', borderRadius: '8px', fontSize: '13px', fontWeight: 700, background: 'var(--blue)', color: 'white', textDecoration: 'none', boxShadow: '0 2px 8px oklch(52% 0.245 265 / 0.26)' }}>
                ลองใช้ฟรี
              </Link>
            </nav>
          </div>
        </header>

        <main>
          {/* ── Hero ── */}
          <div className="hero-section">
          <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '4.5rem 1.5rem 3.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <p className="hi1" style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '1.1rem' }}>
                สำหรับตัวแทนและนายหน้าประกันไทย
              </p>
              <h1 className="hi2" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(38px, 5vw, 60px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: 'var(--ink)', marginBottom: '1.25rem' }}>
                ลูกค้าไม่หลุด<br />เบี้ยไม่ขาด<br />นัดไม่ลืม
              </h1>
              <p className="hi3" style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-2)', maxWidth: '400px', marginBottom: '2rem' }}>
                เพราะตัวแทนที่เก่งไม่แพ้เรื่องสินค้า แต่แพ้เรื่องการติดตาม
                Tamdee ช่วยจำแทนคุณ
              </p>
              <div className="hi4" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                <Link href="/sign-up" className="cta-p" style={{ padding: '0.8rem 1.6rem', borderRadius: '10px', fontSize: '14px', fontWeight: 700, background: 'var(--blue)', color: 'white', textDecoration: 'none', boxShadow: '0 3px 12px oklch(52% 0.245 265 / 0.3)', fontFamily: 'var(--font-heading)' }}>
                  ลองใช้ฟรี ไม่ต้องใช้บัตร
                </Link>
                <Link href="/sign-in" className="cta-g" style={{ padding: '0.8rem 1.4rem', borderRadius: '10px', fontSize: '14px', fontWeight: 600, border: '1px solid var(--border)', color: 'var(--ink-2)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
                  เข้าสู่ระบบ
                </Link>
              </div>
              <p className="hi5" style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                ฿149/เดือน · ยกเลิกได้ทุกเมื่อ · เริ่มต้น 20 contacts ฟรี
              </p>
            </div>

            {/* Interactive app mock */}
            <HeroMock />
          </section>
          </div>{/* end hero-section */}

          {/* ── Company strip ── */}
          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'white', padding: '0.875rem 0' }}>
            <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', flexShrink: 0 }}>ใช้ได้ทุกค่าย</span>
              {['AIA', 'FWD', 'Prudential', 'MTL', 'กรุงเทพประกันชีวิต', 'เมืองไทยประกันชีวิต', 'อาคเนย์', 'CIGNA', 'Chubb', 'SCB Life'].map(name => (
                <span key={name} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-3)', padding: '3px 9px', border: '1px solid var(--border)', borderRadius: '999px' }}>{name}</span>
              ))}
            </div>
          </div>

          {/* ── Problems ── */}
          <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '5.5rem 1.5rem' }}>
            <div data-r="1" style={{ marginBottom: '2.75rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>ปัญหาที่ตัวแทนเจอทุกวัน</p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--ink)' }}>
                ไม่ใช่เรื่องสินค้า<br />แต่เรื่องการติดตาม
              </h2>
            </div>
            {[
              { p: 'ลืมตามลูกค้าที่ยังไม่ตัดสินใจ', d: 'บางคนต้องการ 3-4 ครั้งก่อนซื้อ แต่ถ้าไม่มีระบบ วันเวลาผ่านไปโดยไม่รู้ตัว', f: 'ตั้ง follow-up ได้ต่อทุก contact บันทึกไว้ว่าคุยถึงไหนแล้ว' },
              { p: 'เบี้ยครบแล้วก็ไม่รู้', d: 'ถ้าไม่ต่อทัน ลูกค้าเสียสิทธิ์ ต้องตรวจสุขภาพใหม่ หรือเสียกรมธรรม์ที่สะสมมา', f: 'บันทึกวันครบเบี้ยไว้ใน contact ดูได้ทันทีว่าใครต้องต่อเดือนนี้' },
              { p: 'ข้อมูลลูกค้ากระจายอยู่หลายที่', d: 'บ้างอยู่ใน LINE บ้างอยู่กระดาษ บ้างอยู่ Excel อีกไฟล์ หาเบอร์เก่าแทบไม่เจอ', f: 'ชื่อ เบอร์ LINE ประกัน ประวัติการคุย รวมที่เดียว ค้นหาได้ทันที' },
            ].map((row, i) => (
              <div key={row.p} data-r={String(i + 1)} className="prob-row">
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'oklch(65% 0.018 265)', textDecoration: 'line-through', textDecorationColor: 'oklch(78% 0.012 265)', marginBottom: '0.5rem' }}>{row.p}</p>
                  <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--ink-3)' }}>{row.d}</p>
                </div>
                <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid var(--surface-2)' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.5rem' }}>Tamdee แก้ด้วย</p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, lineHeight: 1.55, color: 'var(--ink)' }}>{row.f}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)' }} />
          </section>

          {/* ── Testimonials ── */}
          <section style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '5.5rem 1.5rem' }}>
            <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
              <div data-r="1" style={{ marginBottom: '3rem' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>จากตัวแทนที่ใช้งานจริง</p>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
                  ตัวแทนที่ดีขึ้นเพราะไม่ลืมอีกแล้ว
                </h2>
              </div>
              <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {[
                  {
                    quote: 'ก่อนใช้ Tamdee จดโน้ต follow-up ใน iPhone แล้วลืมตามเป็นประจำครับ แค่ 2 สัปดาห์แรกปิดได้เพิ่ม 2 คนที่คิดว่าหลุดไปแล้ว',
                    handle: '@somchai_a**',
                    role: 'ตัวแทน AIA',
                    sc: 'oklch(93% 0.04 265)',
                    tc: 'oklch(42% 0.20 265)',
                  },
                  {
                    quote: 'ขาย 3 ค่ายพร้อมกันค่ะ Excel หลายไฟล์มาก ค้นหาไม่เจอเลย ตอนนี้ข้อมูลและวันครบเบี้ยของทุกคนอยู่ที่เดียวเลยค่ะ',
                    handle: '@napat_ins**',
                    role: 'นายหน้าประกัน FWD, AIA',
                    sc: 'oklch(93% 0.04 145)',
                    tc: 'oklch(38% 0.15 145)',
                  },
                  {
                    quote: 'เพิ่งเริ่มขายประกันค่ะ ฿149 ไม่แพงเลยถ้าเทียบกับค่าคอมจากลูกค้าแค่คนเดียว ใช้ง่ายกว่าที่คิดไว้มากเลยค่ะ',
                    handle: '@wanwisa_f**',
                    role: 'ตัวแทน FWD',
                    sc: 'oklch(93% 0.04 85)',
                    tc: 'oklch(38% 0.16 85)',
                  },
                ].map(t => (
                  <div data-r="1" key={t.handle} style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--blue)" opacity={0.2}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                    <p style={{ fontSize: '14px', lineHeight: 1.72, color: 'var(--ink-2)', flex: 1 }}>{t.quote}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '999px', background: t.sc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: t.tc, flexShrink: 0 }}>
                        {t.handle[1].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'monospace' }}>{t.handle}</p>
                        <p style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Positioning ── */}
          <section style={{ background: 'var(--ink)', padding: '5rem 1.5rem' }}>
            <div data-r="1" style={{ maxWidth: '740px', margin: '0 auto' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(52% 0.06 265)', marginBottom: '1.5rem' }}>Positioning</p>
              <blockquote style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(20px, 2.8vw, 30px)', lineHeight: 1.38, letterSpacing: '-0.015em', color: 'white' }}>
                "Tamdee ไม่ใช่ CRM ครบวงจร<br />
                <span style={{ color: 'oklch(72% 0.12 265)' }}>มันคือสมุดโน้ตอัจฉริยะของตัวแทนประกัน<br />ที่ช่วยให้ไม่พลาดทุกโอกาส"</span>
              </blockquote>
              <p style={{ marginTop: '1.5rem', fontSize: '13px', lineHeight: 1.7, color: 'oklch(58% 0.022 265)', fontFamily: 'var(--font-body)' }}>
                ใช้ได้กับทุกค่าย ทุกประเภทประกัน ไม่ว่าจะขายชีวิต สุขภาพ รถ หรือเป็นนายหน้าหลายค่าย
              </p>
            </div>
          </section>

          {/* ── Features ── */}
          <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '5.5rem 1.5rem' }}>
            <div data-r="1" style={{ marginBottom: '3.5rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>ฟีเจอร์</p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--ink)' }}>
                ทุกอย่างที่ตัวแทนต้องการ<br />ไม่มีสิ่งที่ไม่จำเป็น
              </h2>
            </div>

            {/* Row 1: Pipeline */}
            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
              <div data-rl="1">
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>01 — Pipeline</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(18px, 2.2vw, 24px)', letterSpacing: '-0.015em', color: 'var(--ink)', marginBottom: '0.875rem' }}>Pipeline ที่เข้าใจการขายประกัน</h3>
                <p style={{ fontSize: '13px', lineHeight: 1.72, color: 'var(--ink-2)', marginBottom: '1.25rem' }}>ติดตามลูกค้าตั้งแต่ Lead ไปถึง Client บันทึกชื่อ เบอร์ LINE อีเมล และข้อมูลประกันทั้งหมดในที่เดียว</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {['Lead → Prospect → Appointment → Proposal → Client', 'ค้นหาชื่อหรือเบอร์ได้ทันที', 'Export CSV ออกมาใช้งานภายนอกได้เสมอ'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}><CheckIcon /><span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{f}</span></div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px oklch(25% 0.06 265 / 0.07)' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', background: 'var(--surface)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)' }}>Contacts</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', background: 'var(--surface-2)', color: 'var(--blue)', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>48 คน</span>
                </div>
                {CONTACTS.map(r => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderBottom: '1px solid oklch(97% 0.008 265)' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: r.sc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: r.tc, flexShrink: 0 }}>{r.name[0]}</div>
                    <span style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{r.name}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: r.sc, color: r.tc }}>{r.status}</span>
                    <span style={{ fontSize: '10px', color: r.follow === 'วันนี้' ? 'var(--blue)' : 'var(--ink-3)', fontWeight: r.follow === 'วันนี้' ? 700 : 400, minWidth: '48px', textAlign: 'right' }}>{r.follow}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Insurance Data */}
            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
              <div data-rl="1" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px oklch(25% 0.06 265 / 0.07)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)' }}>ข้อมูลประกัน</p>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  {[['บริษัทประกัน', 'AIA Thailand'], ['ประเภท', 'สุขภาพ H&S Extra'], ['เลขกรมธรรม์', 'P-4521-08832'], ['เบี้ยต่อปี', '฿18,400'], ['วันครบเบี้ยถัดไป', '15 มิถุนายน 2568']].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--surface)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ margin: '0 16px 14px', padding: '9px 12px', background: 'oklch(96% 0.025 55)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '999px', background: 'oklch(68% 0.17 55)', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'oklch(38% 0.14 55)' }}>ครบกำหนดใน 28 วัน</p>
                </div>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>02 — Insurance Data</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(18px, 2.2vw, 24px)', letterSpacing: '-0.015em', color: 'var(--ink)', marginBottom: '0.875rem' }}>ข้อมูลประกันครบ ในที่เดียว</h3>
                <p style={{ fontSize: '13px', lineHeight: 1.72, color: 'var(--ink-2)', marginBottom: '1.25rem' }}>บันทึกบริษัท เลขกรมธรรม์ เบี้ยต่อปี และวันครบกำหนดไว้กับ contact นั้น ไม่ต้องเปิด Excel แยก</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {['ดูวันครบเบี้ยของทุกคนได้จากหน้าเดียว', 'รองรับหลายกรมธรรม์ต่อ 1 ลูกค้า', 'ค้นหาด้วยชื่อบริษัทหรือประเภทประกัน'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}><CheckIcon /><span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{f}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Dashboard */}
            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
              <div data-rl="1">
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>03 — Dashboard</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(18px, 2.2vw, 24px)', letterSpacing: '-0.015em', color: 'var(--ink)', marginBottom: '0.875rem' }}>เห็นภาพรวมธุรกิจทันที</h3>
                <p style={{ fontSize: '13px', lineHeight: 1.72, color: 'var(--ink-2)', marginBottom: '1.25rem' }}>ดูว่าเดือนนี้มีลูกค้าอยู่ในแต่ละ stage เท่าไร มูลค่า pipeline รวมเท่าไร และ trend การเติบโตย้อนหลัง 12 เดือน</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {['KPI: contacts, follow-up วันนี้, เบี้ยครบเดือนนี้', 'Pipeline value รวมต่อ stage', 'ย้อนดูสถิติย้อนหลัง 12 เดือน (Pro)'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}><CheckIcon /><span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{f}</span></div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 20px oklch(25% 0.06 265 / 0.07)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {[{ label: 'Contacts', value: '48' }, { label: 'ตามวันนี้', value: '5' }, { label: 'เบี้ยครบ', value: '3' }, { label: 'ปิดเดือนนี้', value: '2' }].map(kpi => (
                    <div key={kpi.label} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '8px', border: '1px solid var(--border)' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{kpi.value}</p>
                      <p style={{ fontSize: '9px', color: 'var(--ink-3)', marginTop: '2px' }}>{kpi.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pipeline</p>
                  {[['Lead', 12, 100], ['Prospect', 8, 67], ['Appointment', 5, 42], ['Proposal', 3, 25], ['Client', 2, 17]].map(([label, count, pct]) => (
                    <div key={String(label)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '9px', color: 'var(--ink-3)', width: '64px', flexShrink: 0 }}>{label}</span>
                      <div style={{ flex: 1, height: '4px', borderRadius: '999px', background: 'oklch(90% 0.012 265)' }}>
                        <div data-pct={String(pct)} className="bar-fill" style={{ height: '100%', background: 'var(--blue)', borderRadius: '999px' }} />
                      </div>
                      <span style={{ fontSize: '9px', color: 'var(--ink-3)', width: '16px', textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Tasks & Calendar */}
            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              <div data-rl="1" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px oklch(25% 0.06 265 / 0.07)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)' }}>Tasks วันนี้</p>
                  <span style={{ fontSize: '10px', background: 'var(--blue)', color: 'white', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>5 รายการ</span>
                </div>
                {[
                  { label: 'โทรตาม สมชาย วงศ์ไทย', time: '10:00', done: true },
                  { label: 'ส่งใบเสนอราคา นารี รักดี', time: '13:00', done: false },
                  { label: 'นัดพบ ประสิทธิ์ ใจดี', time: '15:30', done: false },
                  { label: 'ติดตามเบี้ย วิภา สุขสม', time: '17:00', done: false },
                ].map(task => (
                  <div key={task.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid oklch(97% 0.008 265)' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${task.done ? 'var(--blue)' : 'var(--border)'}`, background: task.done ? 'var(--blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {task.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ flex: 1, fontSize: '11px', fontWeight: 500, color: task.done ? 'var(--ink-3)' : 'var(--ink)', textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</span>
                    <span style={{ fontSize: '10px', color: 'var(--ink-3)' }}>{task.time}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>04 — Tasks & Calendar</p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(18px, 2.2vw, 24px)', letterSpacing: '-0.015em', color: 'var(--ink)', marginBottom: '0.875rem' }}>นัดไม่ลืม ตามไม่ขาด</h3>
                <p style={{ fontSize: '13px', lineHeight: 1.72, color: 'var(--ink-2)', marginBottom: '1.25rem' }}>สร้าง task ผูกกับ contact ใดก็ได้ นัดโทร นัดพบ นัดส่งเอกสาร ดูได้ทั้ง list view และ calendar</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {['Board view แบบ Kanban ลาก-วาง status ได้เลย', 'Calendar view รายวันและรายเดือน', 'Task ผูกกับ contact ติดตามได้ทุกขั้นตอน'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}><CheckIcon /><span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{f}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Pricing ── */}
          <section style={{ background: 'white', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5.5rem 1.5rem' }}>
            <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
              <div data-r="1" style={{ marginBottom: '3rem' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>Pricing</p>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>ราคาที่ตัดสินใจได้เลย</h2>
                <p style={{ marginTop: '0.6rem', fontSize: '14px', color: 'var(--ink-2)' }}>ไม่ต้องขอหัวหน้า ไม่ต้องคิด ROI ใหญ่</p>
              </div>
              <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {/* Free */}
                <div data-r="1" className="pc" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '0.5rem' }}>Free</p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '36px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: '0.25rem' }}>฿0</p>
                  <p style={{ fontSize: '11px', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>ตลอดไป</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {['Contacts 20 คน', 'Pipeline + Tasks + Calendar + Board', 'Follow-up tracking', 'CRM Dashboard (เดือนปัจจุบัน)', 'Export CSV'].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><CheckIcon /><span style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{f}</span></li>
                    ))}
                  </ul>
                  <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', padding: '0.7rem', border: '1px solid var(--border)', borderRadius: '9px', fontSize: '13px', fontWeight: 700, color: 'var(--ink-2)', textDecoration: 'none', background: 'white', fontFamily: 'var(--font-heading)' }}>
                    เริ่มฟรี
                  </Link>
                </div>
                {/* Pro */}
                <div data-r="2" className="pc" style={{ border: '2px solid var(--blue)', borderRadius: '18px', padding: '1.5rem', background: 'white', position: 'relative', boxShadow: '0 6px 24px oklch(52% 0.245 265 / 0.13)', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ position: 'absolute', top: '-11px', left: '50%', translate: '-50% 0', background: 'var(--blue)', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 11px', borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap' }}>ยอดนิยม</span>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--blue)', marginBottom: '0.5rem' }}>Pro</p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '36px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: '0.25rem' }}>฿149</p>
                  <p style={{ fontSize: '11px', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>/เดือน · หรือ ฿1,490/ปี</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {['Contacts 500 คน', 'ทุกอย่างใน Free', 'Import CSV', 'Policy reminder (วันครบเบี้ย)', 'ตั้งเป้าหมายรายเดือน', 'ย้อนดูย้อนหลัง 12 เดือน'].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><CheckIcon /><span style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{f}</span></li>
                    ))}
                  </ul>
                  <Link href="/sign-up" className="cta-p" style={{ display: 'block', textAlign: 'center', padding: '0.7rem', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: 'var(--blue)', color: 'white', textDecoration: 'none', fontFamily: 'var(--font-heading)', boxShadow: '0 2px 8px oklch(52% 0.245 265 / 0.28)' }}>
                    เริ่มด้วย Pro →
                  </Link>
                </div>
                {/* Pro+ */}
                <div data-r="3" className="pc" style={{ border: '1px solid oklch(78% 0.028 265)', borderRadius: '18px', padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.5rem' }}>Pro+</p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '36px', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: '0.25rem' }}>฿299</p>
                  <p style={{ fontSize: '11px', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>/เดือน · หรือ ฿2,990/ปี</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {['Contacts ไม่จำกัด', 'ทุกอย่างใน Pro', 'LINE message templates', 'Advanced analytics + charts', 'Priority Support (ตอบใน 4 ชม.)'].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><CheckIcon /><span style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{f}</span></li>
                    ))}
                  </ul>
                  <Link href="/sign-up" className="cta-g" style={{ display: 'block', textAlign: 'center', padding: '0.7rem', borderRadius: '9px', fontSize: '13px', fontWeight: 700, border: '1px solid oklch(78% 0.028 265)', color: 'var(--ink)', textDecoration: 'none', fontFamily: 'var(--font-heading)' }}>
                    เลือก Pro+ →
                  </Link>
                </div>
              </div>
              <p data-r="1" style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '12px', color: 'var(--ink-3)' }}>
                ยกเลิกได้ทุกเมื่อ ไม่มีสัญญาผูกมัด · มีคำถาม? <a href="mailto:support@tamdee.space" style={{ color: 'var(--blue)', textDecoration: 'none' }}>support@tamdee.space</a>
              </p>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section style={{ maxWidth: '760px', margin: '0 auto', padding: '5.5rem 1.5rem' }}>
            <div data-r="1" style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.75rem' }}>FAQ</p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>คำถามที่พบบ่อย</h2>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
              .faq-item { border-top: 1px solid oklch(89% 0.014 265); }
              .faq-item summary {
                display: flex; justify-content: space-between; align-items: center;
                padding: 1.1rem 0; cursor: pointer; list-style: none;
                font-size: 14px; font-weight: 600; color: oklch(13% 0.028 265);
                font-family: var(--font-heading);
              }
              .faq-item summary::-webkit-details-marker { display: none; }
              .faq-item summary::after {
                content: '+'; font-size: 18px; font-weight: 400;
                color: oklch(62% 0.016 265); flex-shrink: 0; margin-left: 1rem;
                transition: transform 0.2s;
              }
              .faq-item[open] summary::after { transform: rotate(45deg); }
              .faq-item p { padding: 0 0 1.1rem; font-size: 13px; line-height: 1.75; color: oklch(42% 0.022 265); }
            ` }} />
            {[
              { q: 'ต่างจาก Excel ยังไง?', a: 'Excel ต้องจัดการเองทุกอย่าง ไม่มีระบบบอกว่าต้องตามใครวันนี้ ไม่มีแจ้งเตือนวันครบเบี้ย Tamdee ทำสิ่งนี้ให้อัตโนมัติ และค้นหาชื่อหรือเบอร์เจอได้ทันที' },
              { q: 'ใช้ได้กับค่ายประกันไหนบ้าง?', a: 'ทุกค่าย ทุกประเภทประกัน ไม่ผูกกับบริษัทใด ไม่ว่าจะเป็น AIA, FWD, Prudential, MTL หรือนายหน้าหลายค่ายพร้อมกัน กรอกข้อมูลได้อิสระ' },
              { q: 'ข้อมูลลูกค้าปลอดภัยไหม?', a: 'ข้อมูลเก็บบน Neon Postgres (AWS ap-southeast-1) เข้าถึงได้เฉพาะบัญชีของคุณเท่านั้น ไม่แชร์กับบริษัทประกันหรือบุคคลอื่น' },
              { q: 'ยกเลิกได้ไหม?', a: 'ได้ทุกเมื่อ ไม่มีสัญญาผูกมัด ไม่มีค่าปรับ ยกเลิกแล้วข้อมูลยังดูได้จนหมดรอบบิล' },
              { q: 'มี mobile app ไหม?', a: 'ตอนนี้เป็น web app ที่ responsive เต็มรูปแบบ ใช้บน mobile ได้ปกติผ่าน browser ไม่ต้องโหลดอะไรเพิ่ม' },
              { q: 'Free tier มีข้อจำกัดอะไรบ้าง?', a: 'เก็บ contacts ได้ 20 คน ฟีเจอร์หลักครบทุกอย่าง (Tasks, Calendar, Board, Dashboard) ไม่มีโฆษณา ไม่หมดอายุ ต้องการมากกว่านั้นค่อยอัปเกรด Pro' },
            ].map(item => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
            <div style={{ borderTop: '1px solid oklch(89% 0.014 265)' }} />
          </section>

          {/* ── Final CTA ── */}
          <section style={{ background: 'var(--ink)', padding: '5.5rem 1.5rem', textAlign: 'center' }}>
            <div data-r="1" style={{ maxWidth: '560px', margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 40px)', letterSpacing: '-0.02em', lineHeight: 1.2, color: 'white', marginBottom: '1.1rem' }}>เริ่มจัดการลูกค้าดีขึ้นวันนี้</h2>
              <p style={{ fontSize: '14px', color: 'oklch(60% 0.022 265)', marginBottom: '2rem', lineHeight: 1.65 }}>สมัครฟรี ไม่ต้องใช้บัตรเครดิต ใช้งานได้เลย</p>
              <Link href="/sign-up" className="cta-p" style={{ display: 'inline-block', padding: '0.9rem 2rem', borderRadius: '11px', fontSize: '14px', fontWeight: 700, background: 'var(--blue)', color: 'white', textDecoration: 'none', boxShadow: '0 4px 18px oklch(52% 0.245 265 / 0.42)', fontFamily: 'var(--font-heading)' }}>
                ลองใช้ฟรี ไม่ต้องใช้บัตร
              </Link>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '1.75rem 1.5rem' }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/tamdee-logo.png" alt="Tamdee" width={20} height={20} style={{ borderRadius: '6px' }} />
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '13px', color: 'var(--ink-2)' }}>Tamdee</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ink-3)' }}>© 2025 Tamdee · CRM สำหรับตัวแทนประกันไทย</p>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              {[{ label: 'เข้าสู่ระบบ', href: '/sign-in' }, { label: 'สมัครใช้งาน', href: '/sign-up' }].map(l => (
                <Link key={l.href} href={l.href} style={{ fontSize: '12px', color: 'var(--ink-3)', textDecoration: 'none' }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
