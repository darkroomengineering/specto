import type { CacheEntry, CacheOptions, CacheStats, CacheStore } from './types'

/**
 * In-memory LRU cache implementation
 * - O(1) get/set operations
 * - Automatic TTL-based expiration
 * - LRU eviction when maxEntries is reached
 */
export class MemoryCache implements CacheStore {
	private cache = new Map<string, CacheEntry<unknown>>()
	private accessOrder: string[] = []
	private options: Required<CacheOptions>
	private _stats: CacheStats = { hits: 0, misses: 0, entries: 0 }

	constructor(options: CacheOptions = {}) {
		this.options = {
			ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes default
			staleWhileRevalidate: options.staleWhileRevalidate ?? 0,
			maxEntries: options.maxEntries ?? 1000,
		}
	}

	async get<T>(key: string): Promise<CacheEntry<T> | null> {
		const entry = this.cache.get(key) as CacheEntry<T> | undefined

		if (!entry) {
			this._stats.misses++
			return null
		}

		// Check if expired (beyond stale-while-revalidate window)
		const now = Date.now()
		const maxStaleTime = entry.expiresAt + this.options.staleWhileRevalidate
		if (now > maxStaleTime) {
			this.cache.delete(key)
			this.removeFromAccessOrder(key)
			this._stats.misses++
			this._stats.entries = this.cache.size
			return null
		}

		// Update access order for LRU
		this.updateAccessOrder(key)
		this._stats.hits++
		return entry
	}

	async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
		// Evict if at capacity
		if (!this.cache.has(key) && this.cache.size >= this.options.maxEntries) {
			this.evictLRU()
		}

		this.cache.set(key, entry as CacheEntry<unknown>)
		this.updateAccessOrder(key)
		this._stats.entries = this.cache.size
	}

	async delete(key: string): Promise<void> {
		this.cache.delete(key)
		this.removeFromAccessOrder(key)
		this._stats.entries = this.cache.size
	}

	async clear(): Promise<void> {
		this.cache.clear()
		this.accessOrder = []
		this._stats = { hits: 0, misses: 0, entries: 0 }
	}

	async has(key: string): Promise<boolean> {
		const entry = await this.get(key)
		return entry !== null
	}

	async stats(): Promise<CacheStats> {
		return { ...this._stats }
	}

	/**
	 * Check if a cached entry is stale (expired but within stale-while-revalidate window)
	 */
	isStale(entry: CacheEntry<unknown>): boolean {
		return Date.now() > entry.expiresAt
	}

	/**
	 * Create a cache entry with proper expiration
	 */
	createEntry<T>(data: T, etag?: string): CacheEntry<T> {
		const now = Date.now()
		return {
			data,
			timestamp: now,
			etag,
			expiresAt: now + this.options.ttl,
		}
	}

	private updateAccessOrder(key: string): void {
		this.removeFromAccessOrder(key)
		this.accessOrder.push(key)
	}

	private removeFromAccessOrder(key: string): void {
		const index = this.accessOrder.indexOf(key)
		if (index !== -1) {
			this.accessOrder.splice(index, 1)
		}
	}

	private evictLRU(): void {
		const lruKey = this.accessOrder.shift()
		if (lruKey) {
			this.cache.delete(lruKey)
		}
	}
}

// Default singleton instance
let defaultCache: MemoryCache | null = null

/**
 * Get the default memory cache instance
 */
export function getMemoryCache(options?: CacheOptions): MemoryCache {
	if (!defaultCache) {
		defaultCache = new MemoryCache(options)
	}
	return defaultCache
}

/**
 * Reset the default memory cache (useful for testing)
 */
export function resetMemoryCache(): void {
	defaultCache = null
}
