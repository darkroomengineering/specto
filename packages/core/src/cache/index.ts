export * from './disk'
export * from './memory'
export * from './types'

import { DiskCache } from './disk'
import { MemoryCache } from './memory'
import type { CacheOptions, CacheStore } from './types'

export type CacheType = 'memory' | 'disk'

export interface CreateCacheOptions extends CacheOptions {
	type?: CacheType
	cacheDir?: string // for disk cache
}

/**
 * Create a cache store based on environment and options
 */
export function createCache(options: CreateCacheOptions = {}): CacheStore {
	const type = options.type ?? 'memory'

	switch (type) {
		case 'disk':
			return new DiskCache(options)
		default:
			return new MemoryCache(options)
	}
}

/**
 * Request deduplication - prevents duplicate in-flight requests
 */
const inFlightRequests = new Map<string, Promise<unknown>>()

/**
 * Deduplicate concurrent requests with the same key
 * If a request for the same key is already in flight, return that promise
 */
export async function deduplicatedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
	// Check if request is already in flight
	const existing = inFlightRequests.get(key) as Promise<T> | undefined
	if (existing) {
		return existing
	}

	// Create new request
	const promise = fetcher().finally(() => {
		// Remove from in-flight map when done
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

/**
 * Cached fetch with deduplication and stale-while-revalidate support
 */
export async function cachedFetch<T>(
	cache: CacheStore,
	key: string,
	fetcher: () => Promise<T>,
	options: {
		ttl?: number
		staleWhileRevalidate?: number
		skipCache?: boolean
		forceRevalidate?: boolean
	} = {}
): Promise<{ data: T; fromCache: boolean; stale: boolean }> {
	const { skipCache = false, forceRevalidate = false } = options

	// Skip cache if requested
	if (skipCache) {
		const data = await deduplicatedFetch(key, fetcher)
		return { data, fromCache: false, stale: false }
	}

	// Try to get from cache
	const cached = await cache.get<T>(key)

	if (cached) {
		const isStale = Date.now() > cached.expiresAt

		// Return cached data if fresh
		if (!isStale && !forceRevalidate) {
			return { data: cached.data, fromCache: true, stale: false }
		}

		// Stale-while-revalidate: return stale data and revalidate in background
		if (isStale && options.staleWhileRevalidate) {
			// Fire off background revalidation (don't await)
			deduplicatedFetch(`${key}:revalidate`, async () => {
				try {
					const freshData = await fetcher()
					const ttl = options.ttl ?? 5 * 60 * 1000
					await cache.set(key, {
						data: freshData,
						timestamp: Date.now(),
						expiresAt: Date.now() + ttl,
					})
				} catch {
					// Silently fail background revalidation
				}
			}).catch(() => {})

			return { data: cached.data, fromCache: true, stale: true }
		}
	}

	// Fetch fresh data
	const data = await deduplicatedFetch(key, fetcher)
	const ttl = options.ttl ?? 5 * 60 * 1000
	await cache.set(key, {
		data,
		timestamp: Date.now(),
		expiresAt: Date.now() + ttl,
	})

	return { data, fromCache: false, stale: false }
}
