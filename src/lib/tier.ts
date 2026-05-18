import { db } from '@/db'
import { users, contacts } from '@/db/schema'
import { eq, count } from 'drizzle-orm'

export const CONTACT_LIMITS: Record<string, number | null> = {
  free: 20,
  pro: 200,
  pro_plus: null,
}

export async function getUserTier(userId: string) {
  const [user] = await db.select({ tier: users.tier }).from(users).where(eq(users.id, userId))
  return user?.tier ?? 'free'
}

export async function checkContactLimit(userId: string) {
  const tier = await getUserTier(userId)
  const limit = CONTACT_LIMITS[tier] ?? 20

  if (limit === null) return { allowed: true, count: 0, limit: null, tier }

  const [result] = await db.select({ count: count() }).from(contacts).where(eq(contacts.userId, userId))
  const total = Number(result?.count ?? 0)

  return { allowed: total < limit, count: total, limit, tier }
}

export function canImportCsv(tier: string) {
  return tier !== 'free'
}
