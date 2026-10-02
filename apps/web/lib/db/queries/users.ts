import { eq } from 'drizzle-orm'
import { db, type NewUser, type User, users } from '../index'

export async function findUserByEmail(email: string): Promise<User | undefined> {
	return db.query.users.findFirst({
		where: eq(users.email, email),
	})
}

export async function findUserByPolarCustomerId(customerId: string): Promise<User | undefined> {
	return db.query.users.findFirst({
		where: eq(users.polarCustomerId, customerId),
	})
}

export async function findUserById(id: string): Promise<User | undefined> {
	return db.query.users.findFirst({
		where: eq(users.id, id),
	})
}

export async function createUser(data: Omit<NewUser, 'createdAt' | 'updatedAt'>): Promise<User> {
	const now = new Date()
	const result = await db
		.insert(users)
		.values({
			...data,
			createdAt: now,
			updatedAt: now,
		})
		.returning()

	const user = result[0]
	if (!user) {
		throw new Error('Failed to create user')
	}
	return user
}

export async function updateUserProStatus(userId: string, isPro: boolean): Promise<void> {
	await db.update(users).set({ isPro, updatedAt: new Date() }).where(eq(users.id, userId))
}

export async function linkPolarCustomerId(userId: string, polarCustomerId: string): Promise<void> {
	await db.update(users).set({ polarCustomerId, updatedAt: new Date() }).where(eq(users.id, userId))
}

export async function findOrCreateUserByEmail(
	email: string,
	polarCustomerId?: string
): Promise<User> {
	let user = await findUserByEmail(email)

	if (!user) {
		user = await createUser({
			id: crypto.randomUUID(),
			email,
			polarCustomerId: polarCustomerId ?? null,
			isPro: false,
		})
	} else if (polarCustomerId && !user.polarCustomerId) {
		await linkPolarCustomerId(user.id, polarCustomerId)
		user = { ...user, polarCustomerId }
	}

	return user
}
