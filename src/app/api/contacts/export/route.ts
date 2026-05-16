import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { contacts } from '@/db/schema'
import { eq } from 'drizzle-orm'

function escapeCsv(v: string | null | undefined): string {
  const s = String(v ?? '')
  // Escape inner double-quotes per RFC 4180
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const rows = await db.select().from(contacts).where(eq(contacts.userId, userId))

  const headers = ['name', 'phone', 'lineId', 'email', 'status', 'source', 'interestedProduct', 'estimatedValue', 'nextFollowUpDate', 'notes', 'tags']

  const csv = [
    headers.join(','),
    ...rows.map(r => [
      r.name, r.phone, r.lineId, r.email,
      r.status, r.source, r.interestedProduct,
      r.estimatedValue, r.nextFollowUpDate,
      r.notes,
      (r.tags ?? []).join(';'),
    ].map(escapeCsv).join(',')),
  ].join('\r\n')

  const bom = '﻿' // UTF-8 BOM สำหรับ Excel
  return new Response(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
