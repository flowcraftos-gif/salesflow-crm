'use server'

import { db } from '@/db'
import { contacts } from '@/db/schema'
import { eq, and, isNotNull, sql, gte, lt } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth'

export type StageValueRow = { stage: string; value: number; count: number }
export type RenewalForecastRow = { month: string; count: number; value: number }
export type SourceRoiRow = { source: string; total: number; clients: number; premium: number }
export type FunnelRow = { stage: string; count: number }

export type AnalyticsData = {
  stageValues: StageValueRow[]
  renewalForecast: RenewalForecastRow[]
  sourceRoi: SourceRoiRow[]
  funnel: FunnelRow[]
}

const STAGE_ORDER = ['Lead', 'Prospect', 'Appointment', 'Proposal', 'Client', 'Lost'] as const

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const userId = await getAuthUser()
  if (!userId) return { stageValues: [], renewalForecast: [], sourceRoi: [], funnel: [] }

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA')
  const sixMonthsLaterStr = new Date(now.getFullYear(), now.getMonth() + 6, 1).toLocaleDateString('en-CA')

  const [stageValueResult, renewalResult, sourceResult, funnelResult] = await Promise.all([
    db.select({
      status: contacts.status,
      value: sql<number>`cast(coalesce(sum(cast(annual_premium as numeric)), 0) as float)`,
      count: sql<number>`cast(count(*) as integer)`,
    })
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .groupBy(contacts.status),

    db.select({
      month: sql<string>`to_char(premium_due_date, 'YYYY-MM')`,
      count: sql<number>`cast(count(*) as integer)`,
      value: sql<number>`cast(coalesce(sum(cast(annual_premium as numeric)), 0) as float)`,
    })
      .from(contacts)
      .where(and(
        eq(contacts.userId, userId),
        isNotNull(contacts.premiumDueDate),
        gte(contacts.premiumDueDate, todayStr),
        lt(contacts.premiumDueDate, sixMonthsLaterStr),
      ))
      .groupBy(sql`to_char(premium_due_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(premium_due_date, 'YYYY-MM')`),

    db.select({
      source: contacts.source,
      total: sql<number>`cast(count(*) as integer)`,
      clients: sql<number>`cast(count(*) filter (where status = 'Client') as integer)`,
      premium: sql<number>`cast(coalesce(sum(cast(annual_premium as numeric)) filter (where status = 'Client'), 0) as float)`,
    })
      .from(contacts)
      .where(and(eq(contacts.userId, userId), isNotNull(contacts.source)))
      .groupBy(contacts.source)
      .orderBy(sql`cast(coalesce(sum(cast(annual_premium as numeric)) filter (where status = 'Client'), 0) as float) desc`),

    db.select({
      status: contacts.status,
      count: sql<number>`cast(count(*) as integer)`,
    })
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .groupBy(contacts.status),
  ])

  const stageMap = Object.fromEntries(stageValueResult.map(r => [r.status, { value: r.value, count: r.count }]))
  const stageValues: StageValueRow[] = STAGE_ORDER.map(s => ({
    stage: s,
    value: stageMap[s]?.value ?? 0,
    count: stageMap[s]?.count ?? 0,
  }))

  const forecastMap = Object.fromEntries(renewalResult.map(r => [r.month, { count: r.count, value: r.value }]))
  const renewalForecast: RenewalForecastRow[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { month: key, count: forecastMap[key]?.count ?? 0, value: forecastMap[key]?.value ?? 0 }
  })

  const sourceRoi: SourceRoiRow[] = sourceResult
    .filter(r => r.source)
    .map(r => ({ source: r.source!, total: r.total, clients: r.clients, premium: r.premium }))

  const funnelMap = Object.fromEntries(funnelResult.map(r => [r.status, r.count]))
  const funnel: FunnelRow[] = STAGE_ORDER.map(s => ({ stage: s, count: funnelMap[s] ?? 0 }))

  return { stageValues, renewalForecast, sourceRoi, funnel }
}
