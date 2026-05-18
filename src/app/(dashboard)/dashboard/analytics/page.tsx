import { getAnalyticsData } from './actions'
import { getUserTier } from '@/lib/tier'
import { ensureUserExists } from '@/lib/auth'
import Link from 'next/link'
import type { StageValueRow, RenewalForecastRow, SourceRoiRow, FunnelRow } from './actions'

// ── Helpers ───────────────────────────────────────────────

const MONTH_SHORT_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function formatBaht(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`
  return String(Math.round(v))
}

const STAGE_BAR_COLORS: Record<string, string> = {
  Lead: 'bg-[oklch(75%_0.015_254)]',
  Prospect: 'bg-[oklch(52%_0.245_265)]',
  Appointment: 'bg-[oklch(66%_0.175_68)]',
  Proposal: 'bg-[oklch(52%_0.20_300)]',
  Client: 'bg-[oklch(52%_0.175_160)]',
  Lost: 'bg-[oklch(54%_0.215_25)]',
}

// ── Charts ─────────────────────────────────────────────────

function PremiumPipelineChart({ data }: { data: StageValueRow[] }) {
  const rows = data.filter(r => r.value > 0)
  const maxVal = Math.max(1, ...rows.map(r => r.value))
  const totalPremium = rows.reduce((s, r) => s + r.value, 0)

  return (
    <div className="rounded-lg border border-[oklch(90%_0.014_254)] bg-white p-4">
      <div className="mb-1 text-[13px] font-700 text-[oklch(18%_0.012_254)]">เบี้ยรวม Pipeline (฿/ปี)</div>
      <div className="mb-3 text-[11px] text-[oklch(60%_0.016_254)]">รวม ฿{formatBaht(totalPremium)}</div>
      {rows.length === 0 ? (
        <div className="py-6 text-center text-[12px] text-[oklch(68%_0.016_254)]">ยังไม่มีข้อมูลเบี้ย</div>
      ) : (
        <div className="space-y-2.5">
          {rows.map(row => {
            const pct = Math.round((row.value / maxVal) * 100)
            return (
              <div key={row.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[oklch(46%_0.022_254)]">{row.stage} <span className="text-[oklch(68%_0.016_254)]">({row.count} คน)</span></span>
                  <span className="text-[12px] font-700 text-[oklch(18%_0.012_254)]">฿{formatBaht(row.value)}</span>
                </div>
                <div className="h-2 rounded-sm bg-[oklch(92%_0.010_254)] overflow-hidden">
                  <div
                    className={`h-full rounded-sm ${STAGE_BAR_COLORS[row.stage] ?? 'bg-[oklch(75%_0.015_254)]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RenewalForecastChart({ data }: { data: RenewalForecastRow[] }) {
  const maxVal = Math.max(1, ...data.map(r => r.value))
  const MAX_BAR_PX = 72
  const totalRenewals = data.reduce((s, r) => s + r.value, 0)

  return (
    <div className="rounded-lg border border-[oklch(90%_0.014_254)] bg-white p-4">
      <div className="mb-1 text-[13px] font-700 text-[oklch(18%_0.012_254)]">เบี้ยครบกำหนด 6 เดือน (฿)</div>
      <div className="mb-3 text-[11px] text-[oklch(60%_0.016_254)]">รวม ฿{formatBaht(totalRenewals)}</div>
      <div className="flex items-end gap-2" style={{ height: `${MAX_BAR_PX + 24}px` }}>
        {data.map((row, i) => {
          const barPx = row.value > 0 ? Math.max(Math.round((row.value / maxVal) * MAX_BAR_PX), 6) : 0
          const [, m] = row.month.split('-').map(Number)
          const isFirst = i === 0
          return (
            <div key={row.month} className="flex-1 flex flex-col items-center justify-end gap-1">
              <span className={`text-[9px] font-700 ${row.value > 0 ? 'text-[oklch(42%_0.175_160)]' : 'invisible'}`}>
                ฿{formatBaht(row.value)}
              </span>
              <div
                className={`w-full rounded-t-md ${isFirst ? 'bg-[oklch(52%_0.175_160)]' : 'bg-[oklch(72%_0.10_160)]'}`}
                style={{ height: `${barPx}px` }}
              />
              <span className="text-[9px] text-[oklch(60%_0.016_254)] whitespace-nowrap mt-1">
                {MONTH_SHORT_TH[m - 1]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SourceRoiTable({ data }: { data: SourceRoiRow[] }) {
  const maxPremium = Math.max(1, ...data.map(r => r.premium))

  return (
    <div className="rounded-lg border border-[oklch(90%_0.014_254)] bg-white p-4">
      <div className="mb-3 text-[13px] font-700 text-[oklch(18%_0.012_254)]">Source ROI</div>
      {data.length === 0 ? (
        <div className="py-6 text-center text-[12px] text-[oklch(68%_0.016_254)]">ยังไม่มีข้อมูล source</div>
      ) : (
        <div className="space-y-3">
          {data.map(row => {
            const convRate = row.total > 0 ? Math.round((row.clients / row.total) * 100) : 0
            const barPct = Math.round((row.premium / maxPremium) * 100)
            return (
              <div key={row.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-600 text-[oklch(30%_0.015_254)]">{row.source}</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-[oklch(52%_0.175_160)] font-600">{convRate}% conv</span>
                    <span className="text-[oklch(18%_0.012_254)] font-700">฿{formatBaht(row.premium)}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-sm bg-[oklch(92%_0.010_254)] overflow-hidden">
                  <div
                    className="h-full rounded-sm bg-[oklch(52%_0.175_160)]"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <div className="mt-0.5 text-[10px] text-[oklch(65%_0.016_254)]">
                  {row.total} contacts → {row.clients} clients
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ConversionFunnel({ data }: { data: FunnelRow[] }) {
  const totalContacts = data.reduce((s, r) => s + r.count, 0)
  const maxCount = Math.max(1, ...data.map(r => r.count))

  return (
    <div className="rounded-lg border border-[oklch(90%_0.014_254)] bg-white p-4">
      <div className="mb-3 text-[13px] font-700 text-[oklch(18%_0.012_254)]">Conversion Funnel</div>
      {totalContacts === 0 ? (
        <div className="py-6 text-center text-[12px] text-[oklch(68%_0.016_254)]">ยังไม่มีข้อมูล</div>
      ) : (
      <div className="space-y-1.5">
        {data.map((row, i) => {
          const widthPct = Math.max(10, Math.round((row.count / maxCount) * 100))
          const prev = i > 0 ? data[i - 1].count : null
          const convPct = prev !== null && prev > 0 ? Math.round((row.count / prev) * 100) : null
          return (
            <div key={row.stage} className="flex items-center gap-2">
              <div className="w-20 text-[10px] font-600 text-[oklch(46%_0.022_254)] shrink-0">{row.stage}</div>
              <div className="flex-1 h-6 bg-[oklch(96%_0.008_254)] rounded-sm overflow-hidden">
                <div
                  className={`h-full flex items-center px-2 rounded-sm ${STAGE_BAR_COLORS[row.stage] ?? 'bg-[oklch(75%_0.015_254)]'}`}
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="text-[10px] font-700 text-white">{row.count}</span>
                </div>
              </div>
              {convPct !== null && row.stage !== 'Lost' && (
                <span className="w-10 text-right text-[10px] text-[oklch(52%_0.175_160)] font-600 shrink-0">{convPct}%</span>
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}

// ── Upgrade Gate ──────────────────────────────────────────

function UpgradeGate() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[oklch(93%_0.04_265)] flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(42% 0.20 265)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
      </div>
      <h2 className="text-[18px] font-800 text-[oklch(18%_0.012_254)] mb-2">Advanced Analytics</h2>
      <p className="text-[13px] text-[oklch(55%_0.020_254)] mb-1 max-w-xs">กราฟเชิงลึก: เบี้ย Pipeline, Renewal Forecast, Source ROI, Conversion Funnel</p>
      <p className="text-[12px] text-[oklch(65%_0.016_254)] mb-6">ฟีเจอร์นี้สำหรับ Pro+ เท่านั้น</p>
      <Link
        href="/dashboard/upgrade"
        className="rounded-lg bg-[oklch(52%_0.245_265)] px-6 py-2.5 text-[13px] font-700 text-white hover:bg-[oklch(46%_0.245_265)] transition-colors"
      >
        อัปเกรด Pro+ →
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const userId = await ensureUserExists()
  if (!userId) return null

  const tier = await getUserTier(userId)

  if (tier !== 'pro_plus') {
    return <UpgradeGate />
  }

  const data = await getAnalyticsData()

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="mb-5">
        <h1 className="text-[20px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">Advanced Analytics</h1>
        <p className="text-[12px] text-[oklch(60%_0.016_254)] mt-0.5">ภาพรวมเชิงลึกสำหรับตัวแทนประกัน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PremiumPipelineChart data={data.stageValues} />
        <RenewalForecastChart data={data.renewalForecast} />
        <SourceRoiTable data={data.sourceRoi} />
        <ConversionFunnel data={data.funnel} />
      </div>
    </div>
  )
}
