'use server'

import { db } from '@/db'
import { boardCards, tasks, events } from '@/db/schema'
import { getAuthUser, ensureUserExists } from '@/lib/auth'
import { and, eq, gte, lte, max } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type Column = 'todo' | 'doing' | 'done'

const VALID_COLUMNS: Column[] = ['todo', 'doing', 'done']

function assertColumn(col: string): asserts col is Column {
  if (!VALID_COLUMNS.includes(col as Column)) {
    throw new Error(`Invalid column: ${col}`)
  }
}

export async function getTodayItems() {
  const userId = await getAuthUser()
  if (!userId) return { tasks: [], events: [] }

  // Bangkok UTC+7
  const now = new Date()
  const localNow = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const todayStr = localNow.toISOString().split('T')[0]
  const todayStart = new Date(todayStr + 'T00:00:00+07:00')
  const todayEnd = new Date(todayStr + 'T23:59:59+07:00')

  const [todayTasks, todayEvents] = await Promise.all([
    db.select().from(tasks).where(and(
      eq(tasks.userId, userId),
      eq(tasks.dueDate, todayStr),
      eq(tasks.done, false),
    )),
    db.select().from(events).where(and(
      eq(events.userId, userId),
      gte(events.startAt, todayStart),
      lte(events.startAt, todayEnd),
    )),
  ])

  return { tasks: todayTasks, events: todayEvents }
}

export async function markTaskDone(id: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  await db.update(tasks)
    .set({ done: true })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))

  revalidatePath('/dashboard/board')
}

export async function getBoardCards() {
  const userId = await getAuthUser()
  if (!userId) return []

  try {
    return db.select().from(boardCards).where(eq(boardCards.userId, userId))
  } catch {
    return []
  }
}

export async function createCard(data: {
  title: string
  column?: string
  contactId?: string
  contactName?: string
}) {
  const userId = await ensureUserExists()
  if (!userId) throw new Error('Unauthorized')

  if (!data.title.trim()) throw new Error('กรุณากรอกชื่อ card')

  const col: Column = (data.column as Column) ?? 'todo'
  assertColumn(col)

  // get max position in that column
  const [posResult] = await db
    .select({ maxPos: max(boardCards.position) })
    .from(boardCards)
    .where(and(eq(boardCards.userId, userId), eq(boardCards.column, col)))

  const nextPos = (posResult?.maxPos ?? -1) + 1

  const [card] = await db.insert(boardCards).values({
    userId,
    title: data.title.trim(),
    column: col,
    position: nextPos,
    contactId: data.contactId ?? null,
    contactName: data.contactName ?? null,
  }).returning()

  revalidatePath('/dashboard/board')
  return card
}

export async function moveCard(id: string, column: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  assertColumn(column)

  // get max position in target column
  const [posResult] = await db
    .select({ maxPos: max(boardCards.position) })
    .from(boardCards)
    .where(and(eq(boardCards.userId, userId), eq(boardCards.column, column)))

  const nextPos = (posResult?.maxPos ?? -1) + 1

  const [card] = await db.update(boardCards)
    .set({ column, position: nextPos })
    .where(and(eq(boardCards.id, id), eq(boardCards.userId, userId)))
    .returning()

  if (!card) throw new Error('Card not found')

  revalidatePath('/dashboard/board')
  return card
}

export async function deleteCard(id: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  await db.delete(boardCards).where(and(eq(boardCards.id, id), eq(boardCards.userId, userId)))
  revalidatePath('/dashboard/board')
}
