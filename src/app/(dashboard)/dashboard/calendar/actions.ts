'use server'

import { db } from '@/db'
import { events } from '@/db/schema'
import { getAuthUser, ensureUserExists } from '@/lib/auth'
import { and, eq, gte, lt } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getEvents(month: string) {
  // month: "YYYY-MM"
  const userId = await getAuthUser()
  if (!userId) return []

  const [year, mon] = month.split('-').map(Number)
  const start = new Date(year, mon - 1, 1)
  const end = new Date(year, mon, 1)

  try {
    return db.select().from(events).where(
      and(
        eq(events.userId, userId),
        gte(events.startAt, start),
        lt(events.startAt, end),
      )
    )
  } catch {
    return []
  }
}

export async function createEvent(data: {
  title: string
  startAt: string
  endAt?: string
  contactId?: string
  contactName?: string
}) {
  const userId = await ensureUserExists()
  if (!userId) throw new Error('Unauthorized')

  if (!data.title.trim()) throw new Error('กรุณากรอกชื่อ event')

  const startAt = new Date(data.startAt)
  if (isNaN(startAt.getTime())) throw new Error('วันที่ไม่ถูกต้อง')

  const endAt = data.endAt ? new Date(data.endAt) : undefined
  if (endAt && isNaN(endAt.getTime())) throw new Error('วันสิ้นสุดไม่ถูกต้อง')

  const [event] = await db.insert(events).values({
    userId,
    title: data.title.trim(),
    startAt,
    endAt: endAt ?? null,
    contactId: data.contactId ?? null,
    contactName: data.contactName ?? null,
  }).returning()

  if (!event) throw new Error('Event creation failed')

  revalidatePath('/dashboard/calendar')
  return event
}

export async function deleteEvent(id: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  await db.delete(events).where(and(eq(events.id, id), eq(events.userId, userId)))
  revalidatePath('/dashboard/calendar')
}
