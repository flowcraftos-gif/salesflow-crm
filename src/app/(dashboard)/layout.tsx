import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { checkContactLimit } from '@/lib/tier'
import { ensureUserExists } from '@/lib/auth'
import { PdpaNotice } from '@/components/onboarding/pdpa-notice'
import { MobileNav } from './mobile-nav'
import { TopbarSearch } from './topbar-search'
import { Suspense } from 'react'

const NAV = [
  { href: '/dashboard/contacts', label: 'Contacts', icon: 'users' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: 'check' },
  { href: '/dashboard/calendar', label: 'Calendar', icon: 'cal' },
  { href: '/dashboard/board', label: 'Board', icon: 'board' },
  { href: '/dashboard/crm', label: 'Dashboard', icon: 'chart' },
]

function Icon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    check: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    cal:   <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    board: <><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="10" rx="1"/><rect x="14" y="17" width="7" height="4" rx="1"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></>,
    setting: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  // Ensure user row exists before checking limit
  await ensureUserExists()
  const { count: contactCount, limit } = await checkContactLimit(user.id)
  const { getUserTier } = await import('@/lib/tier')
  const tier = await getUserTier(user.id)
  const isPro = tier !== 'free'

  // Show banner when approaching 80% of limit
  const showApproachingBanner = limit !== null && contactCount >= Math.floor(limit * 0.8)

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || '?'

  return (
    <div className="flex h-screen overflow-hidden bg-[oklch(98.2%_0.006_254)] font-[system-ui,-apple-system,'Segoe_UI',sans-serif]">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex w-56 flex-shrink-0 flex-col border-r border-[oklch(90%_0.014_254)] bg-[oklch(97%_0.010_254)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-[oklch(90%_0.014_254)] px-4 py-4">
          <img src="/tamdee-logo.png" alt="Tamdee" width={34} height={34} className="rounded-xl" />
          <span className="text-sm tracking-tight text-[oklch(18%_0.012_254)]" style={{ fontFamily: 'var(--font-brand)', fontWeight: 800 }}>Tamdee</span>
          {isPro ? (
            <span className="ml-auto rounded-full bg-[oklch(93%_0.04_265)] px-2 py-0.5 text-[10px] font-700 text-[oklch(42%_0.20_265)]">Pro</span>
          ) : (
            <Link href="/dashboard/upgrade" className="ml-auto rounded-full bg-[oklch(92%_0.010_254)] px-2 py-0.5 text-[10px] font-700 text-[oklch(55%_0.020_254)] hover:bg-[oklch(88%_0.06_265)] hover:text-[oklch(42%_0.20_265)] transition-colors">Free</Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="mb-3">
            <p className="mb-1 px-2 text-[10px] font-700 uppercase tracking-[0.8px] text-[oklch(75%_0.012_254)]">หลัก</p>
            {NAV.slice(0, 4).map(item => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-500 text-[oklch(46%_0.022_254)] transition-colors hover:bg-[oklch(90%_0.014_254)] hover:text-[oklch(18%_0.012_254)]"
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mb-3">
            <p className="mb-1 px-2 text-[10px] font-700 uppercase tracking-[0.8px] text-[oklch(75%_0.012_254)]">วิเคราะห์</p>
            <Link
              href="/dashboard/crm"
              prefetch={true}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-500 text-[oklch(46%_0.022_254)] transition-colors hover:bg-[oklch(90%_0.014_254)] hover:text-[oklch(18%_0.012_254)]"
            >
              <Icon name="chart" />
              Dashboard
            </Link>
          </div>
          <div>
            <p className="mb-1 px-2 text-[10px] font-700 uppercase tracking-[0.8px] text-[oklch(75%_0.012_254)]">ระบบ</p>
            <Link
              href="/dashboard/settings"
              prefetch={true}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-500 text-[oklch(46%_0.022_254)] transition-colors hover:bg-[oklch(90%_0.014_254)] hover:text-[oklch(18%_0.012_254)]"
            >
              <Icon name="setting" />
              Settings
            </Link>
          </div>
        </nav>

        {/* Upgrade button */}
        <div className="px-2 pb-1">
          <Link
            href="/dashboard/upgrade"
            prefetch={false}
            className="flex w-full items-center gap-2 rounded-md bg-[oklch(93%_0.04_265)] px-2 py-1.5 text-[12px] font-700 text-[oklch(42%_0.20_265)] transition-colors hover:bg-[oklch(88%_0.06_265)]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/>
            </svg>
            อัปเกรด Pro
          </Link>
        </div>

        {/* Help button */}
        <div className="px-2 pb-2">
          <Link
            href="/dashboard/guide"
            prefetch={false}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-500 text-[oklch(55%_0.020_254)] transition-colors hover:bg-[oklch(90%_0.014_254)] hover:text-[oklch(30%_0.015_254)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            วิธีใช้งาน
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 border-t border-[oklch(90%_0.014_254)] px-4 py-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[oklch(52%_0.245_265)] text-[11px] font-800 text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-600 text-[oklch(18%_0.012_254)]">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-[11px] text-[oklch(65%_0.016_254)]">AIA Agent</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Upgrade approaching banner */}
        {showApproachingBanner && (
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[oklch(85%_0.045_60)] bg-[oklch(97%_0.025_60)] px-5 py-2">
            <p className="text-[12px] text-[oklch(38%_0.080_60)]">
              ใกล้ถึงขีดจำกัด{' '}
              <span className="font-700">
                ({contactCount}/{limit} contacts)
              </span>{' '}
              — อัปเกรด Pro เพื่อไม่จำกัด
            </p>
            <Link
              href="/dashboard/contacts"
              className="flex-shrink-0 rounded-md bg-[oklch(52%_0.245_265)] px-3 py-1 text-[11px] font-700 text-white transition-colors hover:bg-[oklch(46%_0.245_265)]"
            >
              อัปเกรด →
            </Link>
          </div>
        )}

        {/* PDPA inline notice */}
        <PdpaNotice />

        {/* Topbar */}
        <div className="flex h-[52px] flex-shrink-0 items-center gap-3 border-b border-[oklch(90%_0.014_254)] bg-white px-4 md:px-5">
          <Suspense fallback={
            <div className="relative flex-1 md:max-w-xs">
              <div className="h-8 w-full rounded-md border border-[oklch(90%_0.014_254)] bg-[oklch(98.2%_0.006_254)]" />
            </div>
          }>
            <TopbarSearch />
          </Suspense>
          <div className="flex items-center gap-2"></div>
        </div>

        {/* Page content — add bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto overflow-x-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
