'use server'

import { db } from '@/db'
import { contacts } from '@/db/schema'
import { eq, and, isNotNull, lte, gte, lt } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth'

export type RenewalContact = {
  id: string
  name: string
  phone: string | null
  insuranceCompany: string | null
  policyNumber: string | null
  annualPremium: string | null
  premiumDueDate: string
  status: string
}

export type RenewalsData = {
  overdue: RenewalContact[]
  urgent: RenewalContact[]   // 0-30 days
  upcoming: RenewalContact[] // 31-90 days
}

export async function getRenewalsData(): Promise<RenewalsData> {
  const userId = await getAuthUser()
  if (!userId) return { overdue: [], urgent: [], upcoming: [] }

  const today = new Date().toLocaleDateString('en-CA')
  const day30 = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-CA')
  const day90 = new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-CA')

  const [overdueRows, urgentRows, upcomingRows] = await Promise.all([
    db.select({
      id: contacts.id,
      name: contacts.name,
      phone: contacts.phone,
      insuranceCompany: contacts.insuranceCompany,
      policyNumber: contacts.policyNumber,
      annualPremium: contacts.annualPremium,
      premiumDueDate: contacts.premiumDueDate,
      status: contacts.status,
    })
      .from(contacts)
      .where(and(
        eq(contacts.userId, userId),
        isNotNull(contacts.premiumDueDate),
        lt(contacts.premiumDueDate, today),
      ))
      .orderBy(contacts.premiumDueDate),

    db.select({
      id: contacts.id,
      name: contacts.name,
      phone: contacts.phone,
      insuranceCompany: contacts.insuranceCompany,
      policyNumber: contacts.policyNumber,
      annualPremium: contacts.annualPremium,
      premiumDueDate: contacts.premiumDueDate,
      status: contacts.status,
    })
      .from(contacts)
      .where(and(
        eq(contacts.userId, userId),
        isNotNull(contacts.premiumDueDate),
        gte(contacts.premiumDueDate, today),
        lte(contacts.premiumDueDate, day30),
      ))
      .orderBy(contacts.premiumDueDate),

    db.select({
      id: contacts.id,
      name: contacts.name,
      phone: contacts.phone,
      insuranceCompany: contacts.insuranceCompany,
      policyNumber: contacts.policyNumber,
      annualPremium: contacts.annualPremium,
      premiumDueDate: contacts.premiumDueDate,
      status: contacts.status,
    })
      .from(contacts)
      .where(and(
        eq(contacts.userId, userId),
        isNotNull(contacts.premiumDueDate),
        gte(contacts.premiumDueDate, day30),
        lte(contacts.premiumDueDate, day90),
      ))
      .orderBy(contacts.premiumDueDate),
  ])

  function toRenewalContact(r: typeof overdueRows[0]): RenewalContact {
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      insuranceCompany: r.insuranceCompany,
      policyNumber: r.policyNumber,
      annualPremium: r.annualPremium,
      premiumDueDate: r.premiumDueDate!,
      status: r.status,
    }
  }

  return {
    overdue: overdueRows.map(toRenewalContact),
    urgent: urgentRows.map(toRenewalContact),
    upcoming: upcomingRows.map(toRenewalContact),
  }
}
