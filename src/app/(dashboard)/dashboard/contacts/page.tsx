import { Suspense } from 'react'
import { getContacts } from './actions'
import { ContactsTable } from '@/components/contacts/contacts-table'
import { WelcomeBanner } from '@/components/onboarding/welcome-banner'
import { UpgradeSuccessHandler } from './upgrade-success'
import { ensureUserExists } from '@/lib/auth'
import { getUserTier } from '@/lib/tier'
import { db } from '@/db'
import { contacts } from '@/db/schema'
import { eq, count } from 'drizzle-orm'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; upgraded?: string; tier?: string }>
}) {
  const { filter, q, upgraded, tier: upgradedTier } = await searchParams
  const userId = await ensureUserExists()
  if (!userId) return null

  const [allContacts, tier, countResult] = await Promise.all([
    getContacts(filter, q),
    getUserTier(userId),
    db.select({ count: count() }).from(contacts).where(eq(contacts.userId, userId)),
  ])

  const totalCount = Number(countResult[0]?.count ?? 0)

  return (
    <>
      {upgraded === 'true' && upgradedTier && (
        <UpgradeSuccessHandler tier={upgradedTier} />
      )}
      <Suspense fallback={null}>
        <WelcomeBanner contactCount={totalCount} />
      </Suspense>
      <ContactsTable
        contacts={allContacts}
        filter={filter ?? 'all'}
        tier={tier}
        totalCount={totalCount}
      />
    </>
  )
}
