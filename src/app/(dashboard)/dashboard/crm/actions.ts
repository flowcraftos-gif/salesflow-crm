'use server'

import { db } from '@/db'
import { contacts, contactStatusLog, events, users } from '@/db/schema'
import { getAuthUser, ensureUserExists } from '@/lib/auth'
import { eq, and, lte, sql, gte, lt, isNotNull, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ── Types ─────────────────────────────────────────────────

export type CrmGoals = {
  appointmentsPerMonth: number
  followUpsPerDay: number
  newClientsPerMonth: number
  newContactsPerMonth: number
  premiumGoalPerMonth: number
  conversionRateGoal: number
}

const DEFAULT_GOALS: CrmGoals = {
  appointmentsPerMonth: 20,
  followUpsPerDay: 5,
  newClientsPerMonth: 2,
  newContactsPerMonth: 10,
  premiumGoalPerMonth: 0,
  conversionRateGoal: 0,
}

export type PipelineRow = {
  stage: string
  count: number
  conversionPct: number | null
}

export type FollowUpContact = {
  id: string
  name: string
  phone: string
  status: string
  daysOverdue: number
}

export type SourceRow = { source: string; count: number }
export type ValueRow = { stage: string; value: number }
export type TrendRow = { month: string; count: number }

export type CrmStats = {
  appointmentsDone: number
  appointmentsGoal: number
  followUpToday: number
  newClientsThisMonth: number
  clientsGoal: number
  conversionRate: number
  pipeline: PipelineRow[]
  followUpList: FollowUpContact[]
  sourceBreakdown: SourceRow[]
  pipelineValue: ValueRow[]
  monthlyTrend: TrendRow[]
}

// ── Helpers ───────────────────────────────────────────────

function monthBounds(month: string): { start: Date; end: Date } {
  const [year, m] = month.split('-').map(Number)
  const start = new Date(year, m - 1, 1, 0, 0, 0, 0)
  const end = new Date(year, m, 1, 0, 0, 0, 0) // exclusive
  return { start, end }
}

// ── getCrmGoals ───────────────────────────────────────────

export async function getCrmGoals(): Promise<CrmGoals> {
  const userId = await getAuthUser()
  if (!userId) return DEFAULT_GOALS

  try {
    const [user] = await db.select({ crmGoals: users.crmGoals })
      .from(users)
      .where(eq(users.id, userId))

    if (!user) return DEFAULT_GOALS
    const g = user.crmGoals as Partial<CrmGoals>
    return {
      appointmentsPerMonth:  g?.appointmentsPerMonth  ?? DEFAULT_GOALS.appointmentsPerMonth,
      followUpsPerDay:       g?.followUpsPerDay       ?? DEFAULT_GOALS.followUpsPerDay,
      newClientsPerMonth:    g?.newClientsPerMonth    ?? DEFAULT_GOALS.newClientsPerMonth,
      newContactsPerMonth:   g?.newContactsPerMonth   ?? DEFAULT_GOALS.newContactsPerMonth,
      premiumGoalPerMonth:   g?.premiumGoalPerMonth   ?? DEFAULT_GOALS.premiumGoalPerMonth,
      conversionRateGoal:    g?.conversionRateGoal    ?? DEFAULT_GOALS.conversionRateGoal,
    }
  } catch {
    return DEFAULT_GOALS
  }
}

// ── setCrmGoals ───────────────────────────────────────────

export async function setCrmGoals(goals: CrmGoals): Promise<void> {
  const userId = await ensureUserExists()
  if (!userId) throw new Error('Unauthorized')

  await db.update(users)
    .set({ crmGoals: goals })
    .where(eq(users.id, userId))

  revalidatePath('/dashboard/crm')
}

// ── getCrmStats ───────────────────────────────────────────

export async function getCrmStats(month: string): Promise<CrmStats> {
  const userId = await getAuthUser()
  const goals = await getCrmGoals()

  if (!userId) {
    return {
      appointmentsDone: 0,
      appointmentsGoal: goals.appointmentsPerMonth,
      followUpToday: 0,
      newClientsThisMonth: 0,
      clientsGoal: goals.newClientsPerMonth,
      conversionRate: 0,
      pipeline: [],
      followUpList: [],
      sourceBreakdown: [],
      pipelineValue: [],
      monthlyTrend: [],
    }
  }

  const { start, end } = monthBounds(month)
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

  // Run all queries in parallel
  const [
    apptResult,
    followUpResult,
    newClientsResult,
    pipelineResult,
    followUpListResult,
    totalContactsResult,
    sourceResult,
    valueResult,
    trendResult,
  ] = await Promise.all([
    // 1. Appointments done: calendar events with contactId in month
    db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          isNotNull(events.contactId),
          gte(events.startAt, start),
          lt(events.startAt, end),
        )
      ),

    // 2. Follow-up today: contacts where nextFollowUpDate <= today, not Lost/Client
    db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          isNotNull(contacts.nextFollowUpDate),
          lte(contacts.nextFollowUpDate, today),
          ne(contacts.status, 'Lost'),
          ne(contacts.status, 'Client'),
        )
      ),

    // 3. New clients this month: contactStatusLog entries where status='Client' in month
    //    JOIN contacts to verify userId ownership
    db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(contactStatusLog)
      .innerJoin(contacts, eq(contactStatusLog.contactId, contacts.id))
      .where(
        and(
          eq(contacts.userId, userId),
          eq(contactStatusLog.status, 'Client'),
          gte(contactStatusLog.changedAt, start),
          lt(contactStatusLog.changedAt, end),
        )
      ),

    // 4. Pipeline: GROUP BY status
    db.select({
      status: contacts.status,
      count: sql<number>`cast(count(*) as integer)`,
    })
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .groupBy(contacts.status),

    // 5. Follow-up list: overdue contacts (nextFollowUpDate <= today)
    db.select({
      id: contacts.id,
      name: contacts.name,
      phone: contacts.phone,
      status: contacts.status,
      nextFollowUpDate: contacts.nextFollowUpDate,
    })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          isNotNull(contacts.nextFollowUpDate),
          lte(contacts.nextFollowUpDate, today),
          ne(contacts.status, 'Lost'),
          ne(contacts.status, 'Client'),
        )
      )
      .orderBy(contacts.nextFollowUpDate),

    // 6. Total contacts (for conversion rate)
    db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(contacts)
      .where(eq(contacts.userId, userId)),

    // 7. Source breakdown
    db.select({
      source: contacts.source,
      count: sql<number>`cast(count(*) as integer)`,
    })
      .from(contacts)
      .where(and(eq(contacts.userId, userId), isNotNull(contacts.source)))
      .groupBy(contacts.source),

    // 8. Pipeline value (sum estimatedValue per status)
    db.select({
      status: contacts.status,
      value: sql<number>`cast(coalesce(sum(cast(estimated_value as numeric)), 0) as float)`,
    })
      .from(contacts)
      .where(and(eq(contacts.userId, userId), isNotNull(contacts.estimatedValue)))
      .groupBy(contacts.status),

    // 9. Monthly trend: new contacts per month (6 months ending at selected month)
    db.select({
      month: sql<string>`to_char(date_trunc('month', created_at AT TIME ZONE 'Asia/Bangkok'), 'YYYY-MM')`,
      count: sql<number>`cast(count(*) as integer)`,
    })
      .from(contacts)
      .where(and(
        eq(contacts.userId, userId),
        gte(contacts.createdAt, (() => {
          const [y, m] = month.split('-').map(Number)
          return new Date(y, m - 7, 1) // start of 6 months before selected month
        })()),
        lt(contacts.createdAt, (() => {
          const [y, m] = month.split('-').map(Number)
          return new Date(y, m, 1) // start of month after selected month
        })()),
      ))
      .groupBy(sql`date_trunc('month', created_at AT TIME ZONE 'Asia/Bangkok')`)
      .orderBy(sql`date_trunc('month', created_at AT TIME ZONE 'Asia/Bangkok')`),
  ])

  const appointmentsDone = apptResult[0]?.count ?? 0
  const followUpToday    = followUpResult[0]?.count ?? 0
  const newClientsThisMonth = newClientsResult[0]?.count ?? 0
  const totalContacts    = totalContactsResult[0]?.count ?? 0

  // Total clients (status = Client) for conversion rate
  const clientRow = pipelineResult.find(r => r.status === 'Client')
  const totalClients = clientRow?.count ?? 0
  const conversionRate = totalContacts > 0
    ? Math.round((totalClients / totalContacts) * 1000) / 10
    : 0

  // Build ordered pipeline with conversion %
  const STAGE_ORDER = ['Lead', 'Prospect', 'Appointment', 'Proposal', 'Client', 'Lost'] as const
  const stageMap: Record<string, number> = {}
  for (const row of pipelineResult) {
    stageMap[row.status] = row.count
  }

  const pipeline: PipelineRow[] = []
  let prevCount: number | null = null
  for (const stage of STAGE_ORDER) {
    const count = stageMap[stage] ?? 0
    const conversionPct: number | null =
      stage === 'Lead' || prevCount === null || prevCount === 0
        ? null
        : Math.round((count / prevCount) * 100)
    pipeline.push({ stage, count, conversionPct })
    prevCount = count
  }

  // Build follow-up list with daysOverdue
  const todayDate = new Date(today)
  const followUpList: FollowUpContact[] = followUpListResult.map(c => {
    const followUpDate = new Date(c.nextFollowUpDate!)
    const diffMs = todayDate.getTime() - followUpDate.getTime()
    const daysOverdue = Math.floor(diffMs / 86400000)
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      status: c.status,
      daysOverdue,
    }
  })

  // Build 6-month array, fill missing months with 0
  const trendMap = Object.fromEntries(trendResult.map(r => [r.month, r.count]))
  const [selY, selM] = month.split('-').map(Number)
  const monthlyTrend: TrendRow[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(selY, selM - 6 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { month: key, count: trendMap[key] ?? 0 }
  })

  const sourceBreakdown: SourceRow[] = sourceResult
    .filter(r => r.source)
    .sort((a, b) => b.count - a.count)
    .map(r => ({ source: r.source!, count: r.count }))

  const pipelineValue: ValueRow[] = STAGE_ORDER
    .map(stage => ({
      stage,
      value: valueResult.find(r => r.status === stage)?.value ?? 0,
    }))
    .filter(r => r.value > 0)

  return {
    appointmentsDone,
    appointmentsGoal: goals.appointmentsPerMonth,
    followUpToday,
    newClientsThisMonth,
    clientsGoal: goals.newClientsPerMonth,
    conversionRate,
    pipeline,
    followUpList,
    sourceBreakdown,
    pipelineValue,
    monthlyTrend,
  }
}
