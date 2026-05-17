import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserTier } from '@/lib/tier'
import { ensureUserExists } from '@/lib/auth'
import { LogoutButton } from '../../logout-button'

export default async function SettingsPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const userId = await ensureUserExists()
  const tier = userId ? await getUserTier(userId) : 'free'
  const isPro = tier !== 'free'

  const email = user.emailAddresses[0]?.emailAddress ?? '-'
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || '-'

  return (
    <div className="p-4 md:p-5 max-w-[600px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-800 tracking-tight text-[oklch(18%_0.012_254)]">Settings</h1>
        <p className="text-[13px] text-[oklch(55%_0.020_254)]">จัดการบัญชีและข้อมูลของคุณ</p>
      </div>

      {/* Account */}
      <section className="mb-4 overflow-hidden rounded-xl border border-[oklch(90%_0.014_254)] bg-white">
        <div className="border-b border-[oklch(90%_0.014_254)] px-5 py-3.5">
          <p className="text-[12px] font-700 uppercase tracking-[0.5px] text-[oklch(60%_0.016_254)]">บัญชี</p>
        </div>
        <div className="divide-y divide-[oklch(90%_0.014_254)]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-[12px] text-[oklch(55%_0.020_254)]">ชื่อ</p>
              <p className="text-[14px] font-600 text-[oklch(18%_0.012_254)]">{name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-[12px] text-[oklch(55%_0.020_254)]">อีเมล</p>
              <p className="text-[14px] font-600 text-[oklch(18%_0.012_254)]">{email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <p className="text-[13px] text-[oklch(46%_0.022_254)]">จัดการบัญชี (ชื่อ, อีเมล, รหัสผ่าน)</p>
            <a
              href="/user-profile"
              className="rounded-md border border-[oklch(90%_0.014_254)] px-3 py-1.5 text-[12px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)] transition-colors"
            >
              แก้ไข →
            </a>
          </div>
        </div>
      </section>

      {/* Plan */}
      <section className="mb-4 overflow-hidden rounded-xl border border-[oklch(90%_0.014_254)] bg-white">
        <div className="border-b border-[oklch(90%_0.014_254)] px-5 py-3.5">
          <p className="text-[12px] font-700 uppercase tracking-[0.5px] text-[oklch(60%_0.016_254)]">แผนการใช้งาน</p>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-700 text-[oklch(18%_0.012_254)]">{isPro ? 'Pro' : 'Free'}</p>
              {isPro && <span className="rounded-full bg-[oklch(93%_0.04_265)] px-2 py-0.5 text-[10px] font-700 text-[oklch(42%_0.20_265)]">Active</span>}
            </div>
            <p className="text-[12px] text-[oklch(55%_0.020_254)]">
              {isPro ? 'Contacts ไม่จำกัด + ดู Dashboard ย้อนหลัง 12 เดือน' : 'Contacts สูงสุด 20 คน'}
            </p>
          </div>
          {!isPro && (
            <Link
              href="/dashboard/upgrade"
              className="rounded-md bg-[oklch(52%_0.245_265)] px-4 py-2 text-[12px] font-700 text-white hover:bg-[oklch(46%_0.245_265)] transition-colors"
            >
              อัปเกรด Pro ฿149 →
            </Link>
          )}
        </div>
      </section>

      {/* Logout */}
      <section className="mb-4 overflow-hidden rounded-xl border border-[oklch(90%_0.014_254)] bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[13px] font-600 text-[oklch(18%_0.012_254)]">ออกจากระบบ</p>
            <p className="text-[11px] text-[oklch(65%_0.016_254)]">{email}</p>
          </div>
          <LogoutButton variant="full" />
        </div>
      </section>

      {/* Data */}
      <section className="overflow-hidden rounded-xl border border-[oklch(90%_0.014_254)] bg-white">
        <div className="border-b border-[oklch(90%_0.014_254)] px-5 py-3.5">
          <p className="text-[12px] font-700 uppercase tracking-[0.5px] text-[oklch(60%_0.016_254)]">ข้อมูล</p>
        </div>
        <div className="divide-y divide-[oklch(90%_0.014_254)]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-[13px] font-600 text-[oklch(18%_0.012_254)]">Export Contacts</p>
              <p className="text-[11px] text-[oklch(65%_0.016_254)]">ดาวน์โหลดข้อมูล contacts ทั้งหมดเป็นไฟล์ CSV</p>
            </div>
            <a
              href="/api/contacts/export"
              className="rounded-md border border-[oklch(90%_0.014_254)] px-3 py-1.5 text-[12px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)] transition-colors"
            >
              Export CSV
            </a>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-[13px] font-600 text-[oklch(18%_0.012_254)]">Import Contacts</p>
              <p className="text-[11px] text-[oklch(65%_0.016_254)]">นำเข้าข้อมูลจากไฟล์ CSV (ต้องมีคอลัมน์ name, phone)</p>
            </div>
            <Link
              href="/dashboard/contacts"
              className="rounded-md border border-[oklch(90%_0.014_254)] px-3 py-1.5 text-[12px] font-600 text-[oklch(46%_0.022_254)] hover:border-[oklch(84%_0.018_254)] transition-colors"
            >
              ไปหน้า Contacts
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
