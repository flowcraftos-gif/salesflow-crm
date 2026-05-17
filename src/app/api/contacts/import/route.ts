import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { contacts, CONTACT_STATUSES, CONTACT_SOURCES } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { checkContactLimit } from '@/lib/tier'

const VALID_STATUSES = new Set(CONTACT_STATUSES)
const VALID_SOURCES = new Set(CONTACT_SOURCES)

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') inQuotes = false
      else cur += ch
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { fields.push(cur); cur = '' }
      else cur += ch
    }
  }
  fields.push(cur)
  return fields
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file' }, { status: 400 })

  const text = await file.text()
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (lines.length < 2) return Response.json({ error: 'ไฟล์ว่างหรือไม่มีข้อมูล' }, { status: 400 })

  // Parse header row — normalize to lowercase, trim BOM
  const rawHeader = lines[0].replace(/^﻿/, '')
  const headers = parseCsvLine(rawHeader).map(h => h.trim().toLowerCase())

  const idx = (name: string) => headers.indexOf(name)
  const iName = idx('name')
  const iPhone = idx('phone')
  if (iName === -1 || iPhone === -1) {
    return Response.json({ error: 'ไม่พบคอลัมน์ name และ phone' }, { status: 400 })
  }

  const iLineId = idx('lineid')
  const iEmail = idx('email')
  const iStatus = idx('status')
  const iSource = idx('source')
  const iProduct = idx('interestedproduct')
  const iValue = idx('estimatedvalue')
  const iFollowUp = idx('nextfollowupdate')
  const iNotes = idx('notes')
  const iTags = idx('tags')

  const rows = lines.slice(1)
  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const fields = parseCsvLine(rows[i])
    const get = (col: number) => col === -1 ? '' : (fields[col] ?? '').trim()

    const name = get(iName)
    const phone = get(iPhone)
    if (!name || !phone) { skipped++; continue }

    // Check duplicate phone for this user
    const existing = await db.select({ id: contacts.id })
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.phone, phone)))
      .limit(1)
    if (existing.length > 0) { skipped++; continue }

    // Check tier limit
    const { allowed } = await checkContactLimit(userId)
    if (!allowed) {
      errors.push(`หยุดที่แถว ${i + 2}: ถึงขีดจำกัด contact ของ plan`)
      break
    }

    const statusRaw = get(iStatus)
    const status = VALID_STATUSES.has(statusRaw as typeof CONTACT_STATUSES[number])
      ? statusRaw
      : 'Lead'

    const sourceRaw = get(iSource)
    const source = VALID_SOURCES.has(sourceRaw as typeof CONTACT_SOURCES[number])
      ? sourceRaw
      : null

    const estimatedValue = get(iValue)
      ? String(parseFloat(get(iValue)) || '')
      : null

    const tagsRaw = get(iTags)
    const tags = tagsRaw ? tagsRaw.split(';').map(t => t.trim()).filter(Boolean) : []

    const nextFollowUpDate = get(iFollowUp) || null

    await db.insert(contacts).values({
      userId,
      name,
      phone,
      lineId: get(iLineId) || null,
      email: get(iEmail) || null,
      status,
      source,
      interestedProduct: get(iProduct) || null,
      estimatedValue,
      nextFollowUpDate,
      notes: get(iNotes) || null,
      tags,
    })
    inserted++
  }

  return Response.json({ inserted, skipped, errors })
}
