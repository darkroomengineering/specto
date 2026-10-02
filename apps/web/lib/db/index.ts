import { type Client, createClient } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import * as schema from './schema'

// Lazy initialization to avoid build-time errors
let client: Client | null = null
let database: LibSQLDatabase<typeof schema> | null = null

function getClient(): Client {
	if (!client) {
		const url = process.env.TURSO_DATABASE_URL
		if (!url) {
			throw new Error('TURSO_DATABASE_URL environment variable is required')
		}
		client = createClient({
			url,
			authToken: process.env.TURSO_AUTH_TOKEN,
		})
	}
	return client
}

export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
	get(_target, prop) {
		if (!database) {
			database = drizzle(getClient(), { schema })
		}
		return Reflect.get(database, prop)
	},
})
export * from './schema'
