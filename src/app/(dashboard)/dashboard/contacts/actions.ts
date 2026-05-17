'use server'

import { db } from '@/db'
import { contacts, contactStatusLog, tasks, events, ContactInsert, CONTACT_STATUSES } from '@/db/schema'
import { ensureUserExists, getAuthUser } from '@/lib/auth'
import { checkContactLimit } from '@/lib/tier'
import { eq, and, desc, asc, lte, sql, or, ilike } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function revalidateContacts(id?: string) {
  revalidatePath('/dashboard/contacts')
  if (id) revalidatePath(`/dashboard/contacts/${id}`)
}

export async function getContacts(filter?: string, q?: string) {
  const userId = await getAuthUser()
  if (!userId) return []

  try {
    const searchFilter = q?.trim()
      ? or(
          ilike(contacts.name, `%${q.trim()}%`),
          ilike(contacts.phone, `%${q.trim()}%`),
          ilike(contacts.lineId, `%${q.trim()}%`),
        )
      : undefined

    const base = and(eq(contacts.userId, userId), searchFilter)

    if (filter === 'overdue') {
      return db.select().from(contacts).where(
        and(base, lte(contacts.nextFollowUpDate, sql`CURRENT_DATE`))
      ).orderBy(asc(contacts.nextFollowUpDate))
    }
    if (filter && filter !== 'all') {
      return db.select().from(contacts).where(
        and(base, eq(contacts.status, filter))
      ).orderBy(asc(contacts.nextFollowUpDate))
    }
    return db.select().from(contacts)
      .where(base)
      .orderBy(asc(contacts.nextFollowUpDate))
  } catch {
    return []
  }
}

export async function createContact(data: Omit<ContactInsert, 'userId' | 'id'>) {
  const userId = await ensureUserExists()
  if (!userId) throw new Error('Unauthorized')

  // Validate status
  if (!CONTACT_STATUSES.includes(data.status as typeof CONTACT_STATUSES[number])) {
    throw new Error('Invalid status')
  }

  // Validate estimatedValue
  if (data.estimatedValue && Number(data.estimatedValue) < 0) {
    throw new Error('มูลค่าต้องไม่ติดลบ')
  }

  const { allowed, count, limit } = await checkContactLimit(userId)
  if (!allowed) throw new Error(`CONTACT_LIMIT_REACHED:${count}:${limit}`)

  const [contact] = await db.insert(contacts).values({ ...data, userId }).returning()

  await db.insert(contactStatusLog).values({
    contactId: contact.id,
    status: contact.status,
    note: 'สร้าง contact ใหม่',
  })

  revalidateContacts()
  return contact
}

export async function updateContact(id: string, data: Partial<ContactInsert>) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  const [contact] = await db.update(contacts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
    .returning()

  if (!contact) throw new Error('Contact not found')
  revalidateContacts(id)
  return contact
}

export async function updateContactStatus(id: string, status: string, note?: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  // Validate status server-side
  if (!CONTACT_STATUSES.includes(status as typeof CONTACT_STATUSES[number])) {
    throw new Error('Invalid status')
  }

  const [contact] = await db.update(contacts)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
    .returning()

  // Only log if we actually owned this contact
  if (!contact) throw new Error('Contact not found')

  await db.insert(contactStatusLog).values({ contactId: contact.id, status, note })

  revalidateContacts(id)
  return contact
}

export async function deleteContact(id: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
  revalidateContacts()
}

export async function logCall(id: string, result: 'reached' | 'no_answer' | 'callback', nextFollowUpDate?: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  const now = new Date()
  let followUp = nextFollowUpDate

  if (result === 'no_answer' && !followUp) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    followUp = tomorrow.toISOString().split('T')[0]
  }

  const [updated] = await db.update(contacts)
    .set({
      lastContactedAt: now,
      ...(followUp ? { nextFollowUpDate: followUp } : {}),
      updatedAt: now,
    })
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
    .returning()

  if (!updated) throw new Error('Contact not found')
  revalidateContacts(id)
  return updated
}

export async function getContactWithHistory(id: string) {
  const userId = await getAuthUser()
  if (!userId) return null

  try {
    const [contact] = await db.select().from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))

    if (!contact) return null

    const history = await db.select().from(contactStatusLog)
      .where(eq(contactStatusLog.contactId, id))
      .orderBy(desc(contactStatusLog.changedAt))

    return { contact, history }
  } catch {
    return null
  }
}

export async function markFollowUpDone(contactId: string) {
  const userId = await getAuthUser()
  if (!userId) throw new Error('Unauthorized')

  const now = new Date()
  const [updated] = await db.update(contacts)
    .set({
      nextFollowUpDate: null,
      lastContactedAt: now,
      updatedAt: now,
    })
    .where(and(eq(contacts.id, contactId), eq(contacts.userId, userId)))
    .returning()

  if (!updated) throw new Error('Contact not found')
  revalidatePath('/dashboard/crm')
  revalidatePath('/dashboard/contacts')
  return updated
}

export async function getContactActivity(contactId: string) {
  const userId = await getAuthUser()
  if (!userId) return { tasks: [], events: [] }

  try {
    const [contactTasks, contactEvents] = await Promise.all([
      db.select().from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.contactId, contactId)))
        .orderBy(desc(tasks.createdAt)),
      db.select().from(events)
        .where(and(eq(events.userId, userId), eq(events.contactId, contactId)))
        .orderBy(desc(events.startAt)),
    ])
    return { tasks: contactTasks, events: contactEvents }
  } catch {
    return { tasks: [], events: [] }
  }
}
