'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function LogoutButton({ variant = 'icon' }: { variant?: 'icon' | 'full' }) {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = () => signOut(() => router.push('/sign-in'))

  if (variant === 'full') {
    return (
      <button
        onClick={handleSignOut}
        className="rounded-md border border-[oklch(88%_0.06_25)] px-3 py-1.5 text-[12px] font-600 text-[oklch(44%_0.21_25)] hover:bg-[oklch(95%_0.040_25)] transition-colors"
      >
        ออกจากระบบ
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      title="ออกจากระบบ"
      className="ml-auto flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[oklch(65%_0.016_254)] transition-colors hover:bg-[oklch(90%_0.014_254)] hover:text-[oklch(40%_0.020_254)]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    </button>
  )
}
