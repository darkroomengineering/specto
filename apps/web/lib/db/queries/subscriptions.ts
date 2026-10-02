import { and, eq } from 'drizzle-orm'
import { db, type NewSubscription, type Subscription, subscriptions } from '../index'

export async function findSubscriptionById(id: string): Promise<Subscription | undefined> {
	return db.query.subscriptions.findFirst({
		where: eq(subscriptions.id, id),
	})
}

export async function findActiveSubscriptionByUserId(
	userId: string
): Promise<Subscription | undefined> {
	return db.query.subscriptions.findFirst({
		where: and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')),
	})
}

export async function createSubscription(
	data: Omit<NewSubscription, 'createdAt' | 'updatedAt'>
): Promise<Subscription> {
	const now = new Date()
	const result = await db
		.insert(subscriptions)
		.values({
			...data,
			createdAt: now,
			updatedAt: now,
		})
		.returning()

	const subscription = result[0]
	if (!subscription) {
		throw new Error('Failed to create subscription')
	}
	return subscription
}

export async function updateSubscriptionStatus(
	id: string,
	status: string,
	canceledAt?: Date
): Promise<void> {
	await db
		.update(subscriptions)
		.set({
			status,
			canceledAt: canceledAt ?? null,
			updatedAt: new Date(),
		})
		.where(eq(subscriptions.id, id))
}

export async function updateSubscriptionPeriod(
	id: string,
	periodStart: Date | null,
	periodEnd: Date | null
): Promise<void> {
	await db
		.update(subscriptions)
		.set({
			currentPeriodStart: periodStart,
			currentPeriodEnd: periodEnd,
			updatedAt: new Date(),
		})
		.where(eq(subscriptions.id, id))
}

export async function upsertSubscription(
	data: Omit<NewSubscription, 'createdAt' | 'updatedAt'>
): Promise<Subscription> {
	const existing = await findSubscriptionById(data.id)

	if (existing) {
		await db
			.update(subscriptions)
			.set({
				status: data.status,
				plan: data.plan,
				currentPeriodStart: data.currentPeriodStart,
				currentPeriodEnd: data.currentPeriodEnd,
				canceledAt: data.canceledAt,
				updatedAt: new Date(),
			})
			.where(eq(subscriptions.id, data.id))

		return { ...existing, ...data, updatedAt: new Date() }
	}

	return createSubscription(data)
}
