// Browser-safe exports for @specto/core
// Use this entry point in browser environments (desktop app, web)
// Node.js-specific modules (DiskCache, auth with spawn) are excluded

// Memory cache (browser-safe)
export { getMemoryCache, MemoryCache, resetMemoryCache } from './cache/memory'

// Cache types
export type { CacheEntry, CacheOptions, CacheStats, CacheStore } from './cache/types'
// Batch processing (browser-safe)
export { batchProcess, withRetry } from './github/batch'
// Types (all browser-safe)
export * from './types'

// Request deduplication (browser-safe) - reimplemented here to avoid cache/index.ts
const inFlightRequests = new Map<string, Promise<unknown>>()

/**
 * Deduplicate concurrent requests with the same key
 * If a request for the same key is already in flight, return that promise
 */
export async function deduplicatedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
	const existing = inFlightRequests.get(key) as Promise<T> | undefined
	if (existing) {
		return existing
	}

	const promise = fetcher().finally(() => {
		inFlightRequests.delete(key)
	})

	inFlightRequests.set(key, promise)
	return promise
}

/**
 * Clear all in-flight request tracking (useful for testing)
 */
export function clearInFlightRequests(): void {
	inFlightRequests.clear()
}
