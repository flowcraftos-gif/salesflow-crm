'use server'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { ensureUserExists, getAuthUser } from '@/lib/auth'
import { eq, and, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function revalidateTasks() {
  revalidatePath('/dashboard/tasks')
}

export async function getTasks(filter?: 'all' | 'today' | 'done') {
  const userId = await getAuthUser()
  if (!userId) return []

  try {
    if (filter === 'today') {
      const todayFilter = sql<boolean>`${tasks.dueDate} = CURRENT_DATE`
      return db.select().from(tasks).where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.done, false),
          todayFilter
        )
      ).orderBy(tasks.createdAt)
    }
    if (filter === 'done') {
      return db.select().from(tasks).where(
        and(eq(tasks.userId, userId), eq(tasks.done, true))
      ).orderBy(tasks.createdAt)
    }
    // 'all' or undefined
    return db.select().from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(tasks.createdAt)
  } catch {
    return []
  }
}

export async function createTask(data: {
  title: string
  dueDate?: string
  contactId?: string
  contactName?: string
}) {
  const userId = await ensureUserExists()
  if (!userId) throw new Error('Unauthorized')

  if (!data.title.trim()) throw new Error('Title is required')

  const [task] = await db.insert(tasks).values({
    userId,
    title: data.title.trim(),
    dueDate: data.dueDate ?? null,
    contactId: data.contactId ?? null,
    contactName: data.contactName ?? null,
    done: false,
  }).returning()

  if (!task) throw new Error('Task creation failed')

  revalidateTasks()
  return task
}

export async function toggleTask(id: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  // First fetch current state (scoped to userId)
  const [existing] = await db.select({ done: tasks.done })
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))

  if (!existing) throw new Error('Task not found')

  const [updated] = await db.update(tasks)
    .set({ done: !existing.done })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning()

  if (!updated) throw new Error('Task update failed')

  revalidateTasks()
  return updated
}

export async function deleteTask(id: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  await db.delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))

  revalidateTasks()
}
