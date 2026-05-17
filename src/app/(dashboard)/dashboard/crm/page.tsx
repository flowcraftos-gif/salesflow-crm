import { getCrmStats, getCrmGoals } from './actions'
import { CrmDashboard } from '@/components/crm/crm-dashboard'
import { getUserTier } from '@/lib/tier'
import { ensureUserExists } from '@/lib/auth'

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

  const [tier, stats, goals] = await Promise.all([
    getUserTier(userId),
    getCrmStats(month),
    getCrmGoals(),
  ])

  return <CrmDashboard stats={stats} goals={goals} month={month} tier={tier} />
}
