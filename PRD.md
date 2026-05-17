# PRD: Planner CRM for Insurance Agents
**Version**: v4 (2026-05-16)

---

## Part 1: Context

**Product**: โปรเจคใหม่ทั้งหมด (planessential ดูเป็น reference เท่านั้น)

**Tech Stack**:
| Layer | Tool | ราคา |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) | ฟรี |
| Hosting + webhook | Vercel | ฟรี |
| Database | Neon (Serverless Postgres) | ฟรี (ไม่ pause) |
| Auth | Clerk | ฟรีถึง 10,000 users |
| DB ORM | Drizzle ORM | ฟรี |
| UI | Tailwind CSS + shadcn/ui | ฟรี |
| Payment (บัตร) | Stripe | ~3% |
| Payment (PromptPay) | Omise | ~2.9% |
| Version control | GitHub | ฟรี |

**รวม beta: $0/เดือน**

**Problem**: ตัวแทนประกัน AIA ต้องการ Planner ที่เชื่อม Contact + Task + Calendar + Goal เครื่องมือที่มี (Google Stack) แตกเป็นชิ้น ไม่เชื่อมกัน

---

## Part 2: App Scope (สำคัญ)

โปรเจคนี้ build ทั้ง Planner + CRM ใหม่ทั้งหมด ไม่ใช่แค่ CRM module

**Modules ทั้งหมด**:
| Module | MVP | หมายเหตุ |
|---|---|---|
| Contact (CRM) | ✅ Phase 1 | core feature หลัก |
| Task | ✅ Phase 1 | ต้องมีเพื่อ link contact |
| Calendar | ✅ Phase 2 | นับ "นัด" จาก event + contact |
| Board (Kanban) | ✅ Phase 2 | pipeline visual |
| CRM Dashboard | ✅ Phase 3 | goal tracking |
| Goal / Vision | ⏳ Phase 4 | personal goals (รอ CRM stable ก่อน) |
| Habits | ❌ ไม่ทำ MVP | ไม่ใช่ core pain ของตัวแทนประกัน |
| Diary / Notes | ❌ ไม่ทำ MVP | ไม่ใช่ core pain |

**Timeline**: ~10 สัปดาห์ถึง beta launch

---

## Part 3: Key Decisions

| คำถาม | คำตัดสินใจ | เหตุผล |
|---|---|---|
| Import format | CSV MVP → .xlsx phase 5 | ไม่ต้อง lib; agent บันทึก "CSV UTF-8" ได้ |
| Pro gating | Beta ฟรี 4 สัปดาห์ → Pro 149 บาท/เดือน | validate UX ก่อนคิดเงิน |
| นับ "นัด" จากอะไร | Calendar event ที่ link contact_id | accurate; status change overcount |
| Contact limit | Free=20, Pro=ไม่จำกัด | 20 บังคับให้เห็น upgrade moment เร็วขึ้น |
| Status tracking | ตาราง contact_status_log แยก | SQL join ง่ายกว่า array |
| DB security | Application-level WHERE user_id | RLS + Neon serverless = ซับซ้อนเกินจำเป็น |
| DB connection | @neondatabase/serverless HTTP driver | ป้องกัน connection exhaustion ใน serverless |
| Payment | Stripe (บัตร) + Omise (PromptPay) | คนไทยนิยม PromptPay |
| UI | shadcn/ui + Tailwind, mobile-first | component ready-made, accessible |
| Migrations | Drizzle Kit (`drizzle-kit push` dev, migration files prod) | TypeScript-first |

---

## Part 4: Environment Variables

```env
# Database
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...  # สำหรับ migrations

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Omise
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
OMISE_WEBHOOK_SECRET=...
```

---

## Part 5: Database Schema (Postgres / Neon)

```sql
users
  id          TEXT PRIMARY KEY  -- Clerk user_id
  tier        TEXT DEFAULT 'free'  -- free|pro|pro_plus
  crm_goals   JSONB DEFAULT '{}'
  created_at  TIMESTAMPTZ DEFAULT now()

contacts
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id             TEXT NOT NULL  -- WHERE user_id = ? ทุก query
  name                TEXT NOT NULL
  phone               TEXT NOT NULL
  line_id             TEXT
  email               TEXT
  status              TEXT DEFAULT 'Prospect'
  source              TEXT
  interested_product  TEXT
  estimated_value     NUMERIC
  next_follow_up_date DATE
  last_contacted_at   TIMESTAMPTZ
  notes               TEXT
  tags                TEXT[] DEFAULT '{}'
  created_at          TIMESTAMPTZ DEFAULT now()
  updated_at          TIMESTAMPTZ DEFAULT now()

contact_status_log
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE
  status      TEXT NOT NULL
  note        TEXT
  changed_at  TIMESTAMPTZ DEFAULT now()

tasks
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id      TEXT NOT NULL
  contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL
  contact_name TEXT  -- denormalized snapshot
  title        TEXT NOT NULL
  due_date     DATE
  done         BOOLEAN DEFAULT false
  created_at   TIMESTAMPTZ DEFAULT now()

events
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id      TEXT NOT NULL
  contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL
  contact_name TEXT  -- denormalized snapshot
  title        TEXT NOT NULL
  start_at     TIMESTAMPTZ NOT NULL
  end_at       TIMESTAMPTZ
  created_at   TIMESTAMPTZ DEFAULT now()

board_cards
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id      TEXT NOT NULL
  contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL
  contact_name TEXT  -- denormalized snapshot
  title        TEXT NOT NULL
  column       TEXT DEFAULT 'todo'  -- todo|doing|done
  position     INTEGER DEFAULT 0
  created_at   TIMESTAMPTZ DEFAULT now()
```

**Index**:
```sql
CREATE INDEX ON contacts(user_id, next_follow_up_date);
CREATE INDEX ON contacts(user_id, status);
CREATE INDEX ON contact_status_log(contact_id, changed_at);
CREATE INDEX ON events(user_id, start_at);
CREATE INDEX ON tasks(user_id, due_date, done);
```

**Security pattern** (ทุก query):
```typescript
// ✅ ถูก — application-level security
db.select().from(contacts).where(
  and(eq(contacts.userId, clerkUserId), ...)
)
// ❌ อย่าใช้ RLS กับ Neon serverless (connection overhead สูง)
```

**Contact limit enforcement** (ใน server action ก่อน insert):
```typescript
const count = await db.select({ count: count() })
  .from(contacts).where(eq(contacts.userId, userId))
if (userTier === 'free' && count >= 50) {
  throw new Error('CONTACT_LIMIT_REACHED')
}
```

**Neon connection** (ใช้ HTTP driver ป้องกัน connection exhaustion):
```typescript
// lib/db.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)
```

---

## Part 6: Feature Spec

### Contact CRUD

**Quick Add**: `[ชื่อ] [เบอร์] [Status▼] [+ เพิ่ม]`

**Full Form**: name*, phone* (10 หลัก Thai), lineId, email, status, source, interestedProduct, estimatedValue, nextFollowUpDate, notes, tags (preset: สุขภาพ ชีวิต รถ อุบัติเหตุ บ้าน + custom)

**Contact List**: search, filter by status tab, sort by nextFollowUpDate, badge แดง = overdue

**Contact Detail**: ข้อมูล + status history + linked tasks/events/cards + quick actions

**UI States**:
- Loading: skeleton cards
- Empty: "ยังไม่มี Contact — เพิ่มคนแรกเลย" + CTA button
- Error: toast "เกิดข้อผิดพลาด กรุณาลองใหม่"

---

### "โทร" Action Flow

```
กด [โทร] → เปิด tel:{phone}
→ bottom sheet "บันทึกผลการโทร"
  ├── ติดต่อได้   → nextFollowUpDate picker
  ├── ไม่รับสาย  → auto +1 วัน + log
  └── โทรกลับ    → datetime picker
→ auto-update last_contacted_at = now()
```

**nextFollowUpDate quick picker**: `[+3วัน] [+1สัปดาห์] [+1เดือน] [กำหนดเอง]`

**last_contacted_at triggers**: กด "โทร" / สร้าง task ที่ link / สร้าง event ที่ link

---

### CSV Import/Export

**Template CSV**:
```
name,phone,lineId,email,status,source,interestedProduct,estimatedValue,nextFollowUpDate,notes
```
> บันทึกเป็น **CSV UTF-8** (Excel: File → Save As → CSV UTF-8 with BOM)

**Flow**: upload → detect BOM → preview 10 rows → validate → warn duplicates → confirm → import → report

**Export**: UTF-8 with BOM เสมอ

---

### CRM Dashboard

```
[← เม.ย.] พ.ค. 69 [→]  [ตั้งเป้า]

นัดแล้ว  ขาดอีก  Follow-up วันนี้  Client ใหม่
 12/20      8         7 คน           2/2 ✓

Pipeline + conversion:
Lead 15 →75%→ Prospect 45 →22%→ Appt 10 →20%→ Client 2

Follow-up วันนี้:
• นายก สมใจ — ค้าง 3 วัน  [โทร] [+1วัน] [Done]
```

**Metrics SQL**:
```sql
-- นัดแล้ว (calendar events ที่ link contact ในเดือน)
SELECT COUNT(*) FROM events
WHERE user_id=? AND contact_id IS NOT NULL
  AND start_at BETWEEN ? AND ?

-- Client ใหม่ (status log เดือนนี้)
SELECT COUNT(*) FROM contact_status_log csl
JOIN contacts c ON c.id = csl.contact_id
WHERE c.user_id=? AND csl.status='Client'
  AND csl.changed_at BETWEEN ? AND ?

-- Follow-up วันนี้
SELECT * FROM contacts
WHERE user_id=? AND next_follow_up_date <= CURRENT_DATE
ORDER BY next_follow_up_date ASC
```

Month navigation: ย้อนหลัง 12 เดือน

---

### Payment Webhooks

**Stripe** `/api/webhooks/stripe`:
```typescript
// verify: stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
// on checkout.session.completed:
//   → UPDATE users SET tier='pro' WHERE id=metadata.userId
```

**Omise** `/api/webhooks/omise`:
```typescript
// verify: HMAC-SHA1 signature จาก x-omise-signature header
// on charge.complete:
//   → UPDATE users SET tier='pro' WHERE id=metadata.userId
// Omise metadata: ส่ง { userId: clerkUserId } ตอนสร้าง charge
```

---

## Part 7: PDPA

**Onboarding modal** (ครั้งแรกที่เข้า CRM):
> "ข้อมูล Prospect ที่คุณบันทึกอยู่ภายใต้ความรับผิดชอบของคุณในฐานะผู้ควบคุมข้อมูล กรุณาได้รับความยินยอมก่อนบันทึก"

- Export CSV = right to portability
- Delete account → CASCADE ลบ contacts ทั้งหมด = right to erasure

---

## Part 8: Pricing

| Tier | ราคา | Contacts | Features |
|------|-----:|---:|---|
| Free | ฟรี | 20 | Contact CRUD + Task + Calendar + Board |
| Pro | 149 บาท/เดือน | ไม่จำกัด | + CRM Dashboard + CSV import/export |
| Pro Plus | 299 บาท/เดือน | ไม่จำกัด | + Historical reports + Insurance templates |

**Beta**: design partners ฟรี (AIA + 10 ตัวแทน)
**Early lock**: upgrade ระหว่าง beta = 149 บาท/เดือนตลอดชีพ

---

## Part 9: Project Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          - sidebar + nav
│   │   ├── contacts/
│   │   │   ├── page.tsx        - contact list
│   │   │   └── [id]/page.tsx   - contact detail
│   │   ├── tasks/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── board/page.tsx
│   │   └── crm/page.tsx        - CRM dashboard
│   └── api/
│       ├── contacts/route.ts
│       ├── tasks/route.ts
│       ├── events/route.ts
│       └── webhooks/
│           ├── stripe/route.ts
│           └── omise/route.ts
├── components/
│   ├── contact-picker.tsx      - reusable picker
│   ├── call-result-sheet.tsx   - "บันทึกผลการโทร" bottom sheet
│   └── ui/                     - shadcn/ui components
├── lib/
│   ├── db.ts                   - Neon HTTP driver + Drizzle
│   ├── auth.ts                 - Clerk currentUser helper
│   └── tier.ts                 - contact limit check
├── drizzle/
│   ├── schema.ts               - table definitions
│   └── migrations/             - migration files (prod)
├── middleware.ts               - Clerk protect /dashboard/*
└── drizzle.config.ts
```

---

## Part 10: Implementation Phases

### Phase 1 — Setup + Contact + Task (สัปดาห์ 1-3)
- [ ] Next.js + Clerk + Neon + Drizzle setup
- [ ] middleware.ts protect dashboard routes
- [ ] DB schema + first migration
- [ ] PDPA onboarding modal
- [ ] Contact CRUD (Quick Add + Full Form)
- [ ] Contact list (search, filter, badge, empty state)
- [ ] Contact detail + status history
- [ ] Free tier: limit 50 (enforce ใน server action)
- [ ] Task module + link contact
- [ ] Export CSV (UTF-8 BOM)

### Phase 2 — Calendar + Board (สัปดาห์ 4-5)
- [ ] Calendar event module + link contact
- [ ] Board (Kanban) + link contact
- [ ] Contact picker component (reusable)
- [ ] "โทร" action flow + last_contacted_at auto-update
- [ ] nextFollowUpDate quick picker
- [ ] Contact detail: timeline tasks + events + cards

### Phase 3 — CSV Import + Dashboard (สัปดาห์ 6-7)
- [ ] CSV import (encoding detection + preview + validate)
- [ ] CRM goal setting (crm_goals ใน users)
- [ ] CRM Dashboard (metrics + pipeline + follow-up list)
- [ ] Month navigation (12 เดือน)
- [ ] Follow-up badge + Daily summary section
- [ ] PWA push notification 08:30 น.

### Phase 4 — Payment + Pro Gating (สัปดาห์ 8-9)
- [ ] Stripe Checkout + webhook `/api/webhooks/stripe`
- [ ] Omise charge + webhook `/api/webhooks/omise`
- [ ] Tier check + upgrade prompt (เมื่อ contact > 50)
- [ ] Insurance template goals (default: 20 นัด/เดือน)
- [ ] Beta outreach: 10 ตัวแทน AIA

### Phase 5 — Roadmap
- [ ] Goal / Vision module
- [ ] .xlsx import (SheetJS)
- [ ] Google Contacts import (read-only)
- [ ] Advanced historical reports

---

## Part 11: Verification / Test Plan

### Golden Path
1. Sign up (Clerk) → redirect dashboard → PDPA modal
2. Quick Add: นายก สมใจ / 0812345678 / Prospect
3. ตั้ง nextFollowUpDate = วันนี้
4. CRM Dashboard → "Follow-up วันนี้: 1 คน"
5. กด [โทร] → dialer → bottom sheet → "ติดต่อได้" → +1 สัปดาห์
6. ตรวจ: last_contacted_at อัปเดต, nextFollowUpDate เลื่อน
7. เปลี่ยน status → Client → ตรวจ contact_status_log มี row ใหม่
8. Dashboard → "Client ใหม่เดือนนี้: 1"
9. สร้าง Task → link นายก → Contact detail เห็น task
10. สร้าง Calendar event → link นายก → Dashboard นับ "นัดแล้ว: 1"
11. Import CSV 5 rows (UTF-8) → preview → confirm → 5 contacts
12. Export CSV → Excel อ่านภาษาไทยได้
13. ลบ contact → Task แสดง "[ลูกค้าที่ถูกลบ]" ไม่ error
14. Free user เพิ่ม contact ที่ 51 → upgrade prompt

### Edge Cases
- CSV Windows TIS-620 → encoding warning
- phone 9 หลัก → validation error
- Push notification denied → badge fallback
- Stripe webhook replay → idempotency key check
- Omise webhook → verify HMAC ก่อน process

---

Last updated: 2026-05-16 (v4)
