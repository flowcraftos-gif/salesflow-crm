import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Tamdee — CRM สำหรับตัวแทนประกันไทย'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontRes = await fetch(
    'https://fonts.gstatic.com/s/sarabun/v13/Gg8lN46dMHklGMX8_U2tUw.woff'
  )
  const fontData = await fontRes.arrayBuffer()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(145deg, #000b1f 0%, #000321 60%, #001240 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '72px 96px',
          fontFamily: 'Sarabun',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '52px' }}>
          <div
            style={{
              width: '56px', height: '56px',
              background: '#0038FF',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', fontWeight: 800, color: 'white',
            }}
          >
            T
          </div>
          <span style={{ fontSize: '30px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Tamdee
          </span>
          <span
            style={{
              fontSize: '13px', fontWeight: 700,
              background: 'rgba(0,56,255,0.3)',
              color: '#6699ff',
              padding: '4px 12px',
              borderRadius: '999px',
              marginLeft: '4px',
            }}
          >
            CRM ประกันไทย
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '80px', fontWeight: 800,
            color: 'white',
            lineHeight: 1.08,
            letterSpacing: '-1px',
            marginBottom: '32px',
          }}
        >
          ลูกค้าไม่หลุด
          <br />
          เบี้ยไม่ขาด นัดไม่ลืม
        </div>

        {/* Subtext */}
        <div style={{ fontSize: '26px', color: 'rgba(255,255,255,0.5)', fontWeight: 400, marginBottom: '52px' }}>
          ระบบจัดการลูกค้าประกันที่ทำมาสำหรับตัวแทนไทยโดยเฉพาะ
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['ฟรีเริ่มต้น', 'Pro ฿149/เดือน', 'ทุกค่าย ทุกประเภท'].map(tag => (
            <div
              key={tag}
              style={{
                fontSize: '18px', fontWeight: 600,
                color: 'rgba(255,255,255,0.45)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '999px', background: '#0038FF' }} />
              {tag}
            </div>
          ))}
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px', right: '72px',
            fontSize: '18px', color: 'rgba(255,255,255,0.2)', fontWeight: 400,
          }}
        >
          tamdee.space
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Sarabun', data: fontData, weight: 800 }],
    }
  )
}
