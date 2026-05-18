import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัว — Tamdee',
  robots: { index: false },
}

export default function PrivacyPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: 'oklch(18% 0.012 265)', background: 'oklch(98.5% 0.007 265)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <Link href="/" style={{ fontSize: '13px', color: 'oklch(52% 0.245 265)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '2rem' }}>
          ← กลับหน้าหลัก
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>นโยบายความเป็นส่วนตัว</h1>
        <p style={{ fontSize: '13px', color: 'oklch(58% 0.016 265)', marginBottom: '3rem' }}>อัปเดตล่าสุด: 19 พฤษภาคม 2568</p>

        {[
          {
            title: '1. ข้อมูลที่เก็บรวบรวม',
            body: 'Tamdee เก็บข้อมูลที่คุณกรอกเข้าระบบ ได้แก่ ชื่อ อีเมล หมายเลขโทรศัพท์ LINE ID และข้อมูลกรมธรรม์ประกันของลูกค้าที่คุณบันทึก รวมถึงข้อมูลการใช้งาน เช่น หน้าที่เข้าชมและเวลาที่ใช้งาน',
          },
          {
            title: '2. วัตถุประสงค์การใช้ข้อมูล',
            body: 'เราใช้ข้อมูลเพื่อให้บริการ CRM แก่คุณ ปรับปรุงระบบ ส่งการแจ้งเตือนที่เกี่ยวกับบัญชีของคุณ และป้องกันการใช้งานในทางที่ผิด เราไม่นำข้อมูลของคุณไปขายหรือแบ่งปันกับบุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาด',
          },
          {
            title: '3. การเก็บรักษาข้อมูล',
            body: 'ข้อมูลของคุณเก็บบน Neon Postgres (AWS ap-southeast-1) ที่มีการเข้ารหัสและรักษาความปลอดภัยตามมาตรฐานอุตสาหกรรม การเข้าถึงข้อมูลจำกัดเฉพาะบัญชีของคุณเท่านั้น',
          },
          {
            title: '4. สิทธิ์ของคุณ',
            body: 'คุณมีสิทธิ์ขอดู แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณได้ทุกเมื่อ โดยติดต่อเราที่ support@tamdee.space หรือลบบัญชีผ่านหน้า Settings',
          },
          {
            title: '5. คุกกี้',
            body: 'เราใช้คุกกี้สำหรับการยืนยันตัวตน (session) และวิเคราะห์การใช้งานเบื้องต้น คุณสามารถปิดคุกกี้ได้ในเบราว์เซอร์ แต่อาจส่งผลต่อการใช้งานระบบ',
          },
          {
            title: '6. PDPA',
            body: 'Tamdee ดำเนินการตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) หากมีคำถามหรือต้องการใช้สิทธิ์ตาม PDPA ติดต่อเราที่ support@tamdee.space',
          },
          {
            title: '7. การเปลี่ยนแปลงนโยบาย',
            body: 'เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว โดยจะแจ้งให้ทราบผ่านทางอีเมลหรือแจ้งเตือนในระบบ การใช้งานต่อเนื่องหลังจากการแจ้งถือว่ายอมรับนโยบายฉบับใหม่',
          },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h2>
            <p style={{ fontSize: '14px', lineHeight: 1.75, color: 'oklch(38% 0.016 265)' }}>{s.body}</p>
          </div>
        ))}

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid oklch(89% 0.014 265)', fontSize: '13px', color: 'oklch(58% 0.016 265)' }}>
          ติดต่อ: <a href="mailto:support@tamdee.space" style={{ color: 'oklch(52% 0.245 265)' }}>support@tamdee.space</a>
        </div>
      </div>
    </div>
  )
}
