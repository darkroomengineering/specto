// Browser-safe exports for @specto/core
// Use this entry point in browser environments (desktop app, web)
// Node.js-specific modules (DiskCache, auth with spawn) are excluded

// Types (all browser-safe)
export * from './types'

// Cache types
export type { CacheStore, CacheEntry, CacheOptions, CacheStats } from './cache/types'

// Memory cache (browser-safe)
export { MemoryCache, getMemoryCache, resetMemoryCache } from './cache/memory'

// Batch processing (browser-safe)
export { batchProcess, withRetry } from './github/batch'

// Request deduplication (browser-safe) - reimplemented here to avoid cache/index.ts
const inFlightRequests = new Map<string, Promise<unknown>>()

/**
 * Deduplicate concurrent requests with the same key
 * If a request for the same key is already in flight, return that promise
 */
export async function deduplicatedFetch<T>(
	key: string,
	fetcher: () => Promise<T>
): Promise<T> {
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
