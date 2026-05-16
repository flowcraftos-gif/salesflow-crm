import { db } from '@/db'
import { users, contacts, FREE_CONTACT_LIMIT } from '@/db/schema'
import { eq, count } from 'drizzle-orm'

export async function getUserTier(userId: string) {
  const [user] = await db.select({ tier: users.tier }).from(users).where(eq(users.id, userId))
  return user?.tier ?? 'free'
}

export async function checkContactLimit(userId: string) {
  const tier = await getUserTier(userId)
  if (tier !== 'free') return { allowed: true, count: 0, limit: null }

  const [result] = await db.select({ count: count() }).from(contacts).where(eq(contacts.userId, userId))
  const total = Number(result?.count ?? 0)

  return {
    allowed: total < FREE_CONTACT_LIMIT,
    count: total,
    limit: FREE_CONTACT_LIMIT,
  }
}
