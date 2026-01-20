// Browser-safe batch processing utilities
// No Node.js dependencies

/**
 * Batch processor for concurrent operations with rate limit awareness
 */
export async function batchProcess<T, R>(
	items: T[],
	processor: (item: T) => Promise<R>,
	options: {
		concurrency?: number
		onProgress?: (completed: number, total: number) => void
		signal?: AbortSignal
	} = {}
): Promise<R[]> {
	const { concurrency = 10, onProgress, signal } = options
	const results: R[] = []
	let completed = 0

	// Process in batches
	for (let i = 0; i < items.length; i += concurrency) {
		if (signal?.aborted) {
			throw new Error('Batch processing aborted')
		}

		const batch = items.slice(i, i + concurrency)
		const batchResults = await Promise.all(
			batch.map(async (item) => {
				const result = await processor(item)
				completed++
				onProgress?.(completed, items.length)
				return result
			})
		)
		results.push(...batchResults)
	}

	return results
}

/**
 * Retry with exponential backoff
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	options: {
		maxRetries?: number
		baseDelay?: number
		maxDelay?: number
		shouldRetry?: (error: Error) => boolean
		onRetry?: (error: Error, attempt: number) => void
	} = {}
): Promise<T> {
	const {
		maxRetries = 3,
		baseDelay = 1000,
		maxDelay = 30000,
		shouldRetry = () => true,
		onRetry,
	} = options

	let lastError: Error | undefined
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error as Error

			// Don't retry if shouldRetry returns false
			if (!shouldRetry(lastError)) {
				throw error
			}

			if (attempt < maxRetries) {
				// Exponential backoff with jitter
				const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay)
				onRetry?.(lastError, attempt + 1)
				await new Promise((resolve) => setTimeout(resolve, delay))
			}
		}
	}

	throw lastError
}
