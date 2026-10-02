import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
	id: text('id').primaryKey(), // UUID
	email: text('email').notNull().unique(),
	polarCustomerId: text('polar_customer_id').unique(),
	isPro: integer('is_pro', { mode: 'boolean' }).default(false).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const subscriptions = sqliteTable('subscriptions', {
	id: text('id').primaryKey(), // Polar subscription ID
	userId: text('user_id')
		.references(() => users.id)
		.notNull(),
	status: text('status').notNull(), // 'active' | 'canceled' | 'past_due' | 'incomplete'
	plan: text('plan').notNull(), // 'pro_monthly' | 'pro_yearly'
	currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
	currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
	canceledAt: integer('canceled_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
