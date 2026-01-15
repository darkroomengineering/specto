import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import { GitHubError, RateLimitError } from '../src/lib/github/client'

describe('GitHub client', () => {
	describe('GitHubError', () => {
		test('creates error with status and message', () => {
			const error = new GitHubError(404, 'Not Found', 'Resource not found')
			expect(error.status).toBe(404)
			expect(error.statusText).toBe('Not Found')
			expect(error.body).toBe('Resource not found')
			expect(error.message).toContain('404')
			expect(error.message).toContain('Not Found')
		})

		test('works without body', () => {
			const error = new GitHubError(500, 'Internal Server Error')
			expect(error.body).toBeUndefined()
			expect(error.message).toBe('GitHub API error: 500 Internal Server Error')
		})
	})

	describe('RateLimitError', () => {
		test('extends GitHubError', () => {
			const resetAt = new Date()
			const error = new RateLimitError(resetAt)
			expect(error instanceof GitHubError).toBe(true)
			expect(error.status).toBe(403)
		})

		test('stores reset time', () => {
			const resetAt = new Date('2025-06-15T12:00:00Z')
			const error = new RateLimitError(resetAt)
			expect(error.resetAt).toEqual(resetAt)
		})
	})

	describe('pagination', () => {
		const originalEnv = { ...process.env }
		let originalFetch: typeof fetch

		beforeEach(() => {
			process.env.GITHUB_TOKEN = 'test-token'
			originalFetch = globalThis.fetch
		})

		afterEach(() => {
			process.env = { ...originalEnv }
			globalThis.fetch = originalFetch
		})

		test('yields items from single page response', async () => {
			globalThis.fetch = mock(() =>
				Promise.resolve(
					new Response(JSON.stringify([{ id: 1 }, { id: 2 }]), {
						status: 200,
						headers: { 'content-type': 'application/json' },
					})
				)
			) as typeof fetch

			const { paginate } = await import('../src/lib/github/client')

			const items: { id: number }[] = []
			for await (const item of paginate<{ id: number }>('/test', { perPage: 100 })) {
				items.push(item)
			}

			expect(items).toEqual([{ id: 1 }, { id: 2 }])
		})

		test('handles empty response', async () => {
			globalThis.fetch = mock(() =>
				Promise.resolve(
					new Response(JSON.stringify([]), {
						status: 200,
						headers: { 'content-type': 'application/json' },
					})
				)
			) as typeof fetch

			const { paginate } = await import('../src/lib/github/client')

			const items: { id: number }[] = []
			for await (const item of paginate<{ id: number }>('/test')) {
				items.push(item)
			}

			expect(items).toEqual([])
		})

		test('throws GitHubError on API error', async () => {
			globalThis.fetch = mock(() =>
				Promise.resolve(
					new Response('Not found', {
						status: 404,
						statusText: 'Not Found',
					})
				)
			) as typeof fetch

			const { paginate } = await import('../src/lib/github/client')

			const generator = paginate('/test')

			await expect(generator.next()).rejects.toThrow(GitHubError)
		})

		test('throws RateLimitError when rate limited', async () => {
			const resetTime = Math.floor(Date.now() / 1000) + 3600

			globalThis.fetch = mock(() =>
				Promise.resolve(
					new Response('Rate limit exceeded', {
						status: 403,
						statusText: 'Forbidden',
						headers: { 'x-ratelimit-reset': String(resetTime) },
					})
				)
			) as typeof fetch

			const { paginate } = await import('../src/lib/github/client')

			const generator = paginate('/test')

			await expect(generator.next()).rejects.toThrow(RateLimitError)
		})
	})

	describe('collectPaginated', () => {
		const originalEnv = { ...process.env }
		let originalFetch: typeof fetch

		beforeEach(() => {
			process.env.GITHUB_TOKEN = 'test-token'
			originalFetch = globalThis.fetch
		})

		afterEach(() => {
			process.env = { ...originalEnv }
			globalThis.fetch = originalFetch
		})

		test('collects items into array', async () => {
			globalThis.fetch = mock(() =>
				Promise.resolve(
					new Response(JSON.stringify([{ id: 1 }, { id: 2 }]), {
						status: 200,
						headers: { 'content-type': 'application/json' },
					})
				)
			) as typeof fetch

			const { collectPaginated } = await import('../src/lib/github/client')

			const items = await collectPaginated<{ id: number }>('/test')

			expect(items).toEqual([{ id: 1 }, { id: 2 }])
		})

		test('returns empty array for empty response', async () => {
			globalThis.fetch = mock(() =>
				Promise.resolve(
					new Response(JSON.stringify([]), {
						status: 200,
						headers: { 'content-type': 'application/json' },
					})
				)
			) as typeof fetch

			const { collectPaginated } = await import('../src/lib/github/client')

			const items = await collectPaginated<{ id: number }>('/test')

			expect(items).toEqual([])
		})
	})
})
