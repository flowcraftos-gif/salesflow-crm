import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { contacts } from '@/db/schema'
import { getAuthUser } from '@/lib/auth'
import { and, eq, ilike, or } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const userId = await getAuthUser()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = req.nextUrl.searchParams.get('q') ?? ''

  if (!q.trim()) {
    return NextResponse.json([])
  }

  try {
    const results = await db
      .select({
        id: contacts.id,
        name: contacts.name,
        phone: contacts.phone,
        status: contacts.status,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          or(
            ilike(contacts.name, `%${q}%`),
            ilike(contacts.phone, `%${q}%`)
          )
        )
      )
      .limit(10)

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
