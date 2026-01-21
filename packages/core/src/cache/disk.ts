import type { CacheStore, CacheEntry, CacheOptions, CacheStats } from './types'
import { mkdir, readFile, writeFile, unlink, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'

/**
 * Disk-based cache implementation for persistent storage
 * - Survives app restarts
 * - Uses file system for storage
 * - Automatic cleanup of expired entries
 */
export class DiskCache implements CacheStore {
	private cacheDir: string
	private options: Required<CacheOptions>
	private _stats: CacheStats = { hits: 0, misses: 0, entries: 0 }
	private initialized = false

	constructor(options: CacheOptions & { cacheDir?: string } = {}) {
		this.cacheDir = options.cacheDir ?? join(homedir(), '.specto', 'cache')
		this.options = {
			ttl: options.ttl ?? 30 * 60 * 1000, // 30 minutes default for disk
			staleWhileRevalidate: options.staleWhileRevalidate ?? 5 * 60 * 1000, // 5 min stale
			maxEntries: options.maxEntries ?? 10000,
		}
	}

	private async ensureDir(): Promise<void> {
		if (this.initialized) return
		try {
			await mkdir(this.cacheDir, { recursive: true })
			this.initialized = true
		} catch {
			// Directory might already exist
			this.initialized = true
		}
	}

	private keyToFilename(key: string): string {
		// Create a safe filename from the key using hash
		const hash = createHash('sha256').update(key).digest('hex').slice(0, 16)
		// Also include a readable prefix from the key
		const safePrefix = key.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 32)
		return `${safePrefix}_${hash}.json`
	}

	private getFilePath(key: string): string {
		return join(this.cacheDir, this.keyToFilename(key))
	}

	async get<T>(key: string): Promise<CacheEntry<T> | null> {
		await this.ensureDir()
		const filePath = this.getFilePath(key)

		try {
			const content = await readFile(filePath, 'utf-8')
			const parsed = JSON.parse(content)

			// Validate the parsed data has expected cache entry structure
			if (!parsed || typeof parsed !== 'object' || !('data' in parsed) || !('expiresAt' in parsed)) {
				this._stats.misses++
				return null
			}

			const entry = parsed as CacheEntry<T>

			// Check if completely expired (beyond stale-while-revalidate)
			const now = Date.now()
			const maxStaleTime = entry.expiresAt + this.options.staleWhileRevalidate
			if (now > maxStaleTime) {
				await this.delete(key)
				this._stats.misses++
				return null
			}

			this._stats.hits++
			return entry
		} catch {
			this._stats.misses++
			return null
		}
	}

	async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
		await this.ensureDir()
		const filePath = this.getFilePath(key)

		try {
			await writeFile(filePath, JSON.stringify(entry), 'utf-8')
			this._stats.entries++
		} catch (error) {
			console.error('DiskCache: Failed to write cache entry', error)
		}
	}

	async delete(key: string): Promise<void> {
		const filePath = this.getFilePath(key)
		try {
			await unlink(filePath)
			this._stats.entries = Math.max(0, this._stats.entries - 1)
		} catch {
			// File might not exist
		}
	}

	async clear(): Promise<void> {
		await this.ensureDir()
		try {
			const files = await readdir(this.cacheDir)
			await Promise.all(
				files
					.filter((f) => f.endsWith('.json'))
					.map((f) => unlink(join(this.cacheDir, f)).catch(() => {}))
			)
			this._stats = { hits: 0, misses: 0, entries: 0 }
		} catch {
			// Directory might not exist
		}
	}

	async has(key: string): Promise<boolean> {
		const entry = await this.get(key)
		return entry !== null
	}

	async stats(): Promise<CacheStats> {
		await this.ensureDir()
		try {
			const files = await readdir(this.cacheDir)
			const jsonFiles = files.filter((f) => f.endsWith('.json'))
			this._stats.entries = jsonFiles.length

			// Calculate total size
			let totalSize = 0
			for (const file of jsonFiles) {
				try {
					const fileStat = await stat(join(this.cacheDir, file))
					totalSize += fileStat.size
				} catch {
					// Skip files that can't be accessed
				}
			}
			this._stats.size = totalSize
		} catch {
			// Directory might not exist
		}
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

	/**
	 * Cleanup expired entries (run periodically)
	 */
	async cleanup(): Promise<number> {
		await this.ensureDir()
		let removed = 0

		try {
			const files = await readdir(this.cacheDir)
			const now = Date.now()

			for (const file of files) {
				if (!file.endsWith('.json')) continue

				try {
					const filePath = join(this.cacheDir, file)
					const content = await readFile(filePath, 'utf-8')
					const parsed = JSON.parse(content)

					// Validate the parsed data has expected structure
					if (!parsed || typeof parsed !== 'object' || !('expiresAt' in parsed)) {
						// Invalid cache file, remove it
						await unlink(filePath)
						removed++
						continue
					}

					const entry = parsed as CacheEntry<unknown>
					const maxStaleTime = entry.expiresAt + this.options.staleWhileRevalidate
					if (now > maxStaleTime) {
						await unlink(filePath)
						removed++
					}
				} catch {
					// Skip invalid files
				}
			}
		} catch {
			// Directory might not exist
		}

		return removed
	}
}

// Default singleton instance
let defaultDiskCache: DiskCache | null = null

/**
 * Get the default disk cache instance
 */
export function getDiskCache(options?: CacheOptions & { cacheDir?: string }): DiskCache {
	if (!defaultDiskCache) {
		defaultDiskCache = new DiskCache(options)
	}
	return defaultDiskCache
}

/**
 * Reset the default disk cache (useful for testing)
 */
export function resetDiskCache(): void {
	defaultDiskCache = null
}
