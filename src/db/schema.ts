import {
  pgTable, text, uuid, numeric, date,
  timestamp, boolean, integer, jsonb,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ── Users ─────────────────────────────────────────────
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user_id
  tier: text('tier').default('free').notNull(), // free | pro | pro_plus
  crmGoals: jsonb('crm_goals').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Contacts ──────────────────────────────────────────
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  lineId: text('line_id'),
  email: text('email'),
  status: text('status').default('Prospect').notNull(),
  // Lead | Prospect | Appointment | Proposal | Client | Lost
  source: text('source'),
  // Facebook | Referral | WalkIn | Friend | Other
  interestedProduct: text('interested_product'),
  estimatedValue: numeric('estimated_value'),
  nextFollowUpDate: date('next_follow_up_date'),
  lastContactedAt: timestamp('last_contacted_at'),
  notes: text('notes'),
  tags: text('tags').array().default(sql`'{}'`).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Contact Status Log ────────────────────────────────
export const contactStatusLog = pgTable('contact_status_log', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  note: text('note'),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
})

// ── Tasks ─────────────────────────────────────────────
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  contactName: text('contact_name'),
  title: text('title').notNull(),
  dueDate: date('due_date'),
  done: boolean('done').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Calendar Events ────────────────────────────────────
export const events = pgTable('events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  contactName: text('contact_name'),
  title: text('title').notNull(),
  startAt: timestamp('start_at').notNull(),
  endAt: timestamp('end_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Board Cards ───────────────────────────────────────
export const boardCards = pgTable('board_cards', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  contactName: text('contact_name'),
  title: text('title').notNull(),
  column: text('column').default('todo').notNull(), // todo | doing | done
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Types ─────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type Contact = typeof contacts.$inferSelect
export type ContactInsert = typeof contacts.$inferInsert
export type ContactStatusLog = typeof contactStatusLog.$inferSelect
export type Task = typeof tasks.$inferSelect
export type Event = typeof events.$inferSelect
export type BoardCard = typeof boardCards.$inferSelect

export const CONTACT_STATUSES = ['Lead', 'Prospect', 'Appointment', 'Proposal', 'Client', 'Lost'] as const
export const CONTACT_SOURCES = ['Facebook', 'Referral', 'WalkIn', 'Friend', 'Other'] as const
export const PRESET_TAGS = ['สุขภาพ', 'ชีวิต', 'รถ', 'อุบัติเหตุ', 'บ้าน'] as const
export const FREE_CONTACT_LIMIT = 20
