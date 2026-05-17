'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/dashboard/contacts', label: 'Contacts', icon: 'users' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: 'check' },
  { href: '/dashboard/calendar', label: 'Calendar', icon: 'cal' },
  { href: '/dashboard/board', label: 'Board', icon: 'board' },
  { href: '/dashboard/crm', label: 'CRM', icon: 'chart' },
]

function Icon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    check: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    cal:   <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    board: <><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="10" rx="1"/><rect x="14" y="17" width="7" height="4" rx="1"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></>,
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[oklch(90%_0.014_254)] bg-white/95 backdrop-blur-sm md:hidden">
      {TABS.map(tab => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-600 transition-colors ${
              active
                ? 'text-[oklch(52%_0.245_265)]'
                : 'text-[oklch(60%_0.016_254)]'
            }`}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
