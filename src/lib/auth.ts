import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'

export async function getAuthUser() {
  const { userId } = await auth()
  if (!userId) return null
  return userId
}

export async function ensureUserExists() {
  const user = await currentUser()
  if (!user) return null

  await db.insert(users).values({ id: user.id }).onConflictDoNothing()
  return user.id
}
