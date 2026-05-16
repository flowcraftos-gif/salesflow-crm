import { getCrmStats, getCrmGoals } from './actions'
import { CrmDashboard } from '@/components/crm/crm-dashboard'
import { getUserTier } from '@/lib/tier'
import { ensureUserExists } from '@/lib/auth'
import { CrmTeaser } from '@/components/crm/crm-teaser'

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const month = params.month ?? currentMonth

  const userId = await ensureUserExists()
  if (!userId) return null

  const tier = await getUserTier(userId)

  // Free users see teaser
  if (tier === 'free') return <CrmTeaser />

  const [stats, goals] = await Promise.all([
    getCrmStats(month),
    getCrmGoals(),
  ])

  return <CrmDashboard stats={stats} goals={goals} month={month} />
}
