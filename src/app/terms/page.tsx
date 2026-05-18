import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ข้อกำหนดการใช้งาน — Tamdee',
  robots: { index: false },
}

export default function TermsPage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: 'oklch(18% 0.012 265)', background: 'oklch(98.5% 0.007 265)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <Link href="/" style={{ fontSize: '13px', color: 'oklch(52% 0.245 265)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '2rem' }}>
          ← กลับหน้าหลัก
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>ข้อกำหนดการใช้งาน</h1>
        <p style={{ fontSize: '13px', color: 'oklch(58% 0.016 265)', marginBottom: '3rem' }}>อัปเดตล่าสุด: 19 พฤษภาคม 2568</p>

        {[
          {
            title: '1. การยอมรับข้อกำหนด',
            body: 'การสมัครหรือใช้งาน Tamdee ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขฉบับนี้ทุกข้อ หากไม่ยอมรับ กรุณาหยุดใช้งาน',
          },
          {
            title: '2. บริการ',
            body: 'Tamdee คือ CRM สำหรับตัวแทนและนายหน้าประกันไทย ให้บริการผ่านเว็บแอปพลิเคชันที่ tamdee.space เราขอสงวนสิทธิ์ปรับปรุงหรือยกเลิกฟีเจอร์ใดก็ได้โดยไม่จำเป็นต้องแจ้งล่วงหน้า',
          },
          {
            title: '3. บัญชีผู้ใช้',
            body: 'คุณรับผิดชอบต่อความปลอดภัยของบัญชีและรหัสผ่าน รวมถึงกิจกรรมทุกอย่างที่เกิดขึ้นภายใต้บัญชีของคุณ กรุณาแจ้งทันทีหากพบการใช้งานที่ไม่ได้รับอนุญาต',
          },
          {
            title: '4. การชำระเงินและการยกเลิก',
            body: 'แพ็กเกจ Pro และ Pro+ เรียกเก็บเงินรายเดือน คุณสามารถยกเลิกได้ทุกเมื่อโดยไม่มีค่าปรับ ระบบจะไม่คืนเงินสำหรับรอบบิลที่ผ่านมาแล้ว บัญชีจะยังคงใช้งานได้จนสิ้นสุดรอบที่ชำระ',
          },
          {
            title: '5. การใช้งานที่ไม่อนุญาต',
            body: 'ห้ามใช้ Tamdee เพื่อวัตถุประสงค์ที่ผิดกฎหมาย สแปม หรือรบกวนระบบ ห้ามทำ reverse engineering ระบบ หรือพยายามเข้าถึงข้อมูลของผู้ใช้รายอื่น',
          },
          {
            title: '6. ข้อมูลของคุณ',
            body: 'ข้อมูลที่คุณกรอกในระบบยังคงเป็นของคุณ เราไม่อ้างสิทธิ์ความเป็นเจ้าของ คุณสามารถ export ข้อมูลได้ตลอดเวลาผ่านฟีเจอร์ Export CSV',
          },
          {
            title: '7. การจำกัดความรับผิด',
            body: 'Tamdee ให้บริการ "ตามสภาพ" (as-is) เราไม่รับผิดชอบต่อความเสียหายทางธุรกิจ การสูญเสียข้อมูล หรือผลลัพธ์ทางการขายใดๆ ที่เกิดจากการใช้หรือไม่สามารถใช้บริการได้',
          },
          {
            title: '8. กฎหมายที่ใช้บังคับ',
            body: 'ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทใดๆ ให้อยู่ในอำนาจศาลไทย',
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
