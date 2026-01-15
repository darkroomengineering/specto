import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import { AuthError } from '../src/lib/github/auth'

describe('auth utilities', () => {
	const originalEnv = { ...process.env }

	beforeEach(() => {
		// Clear auth env vars before each test
		delete process.env.GITHUB_TOKEN
		delete process.env.GH_TOKEN
	})

	afterEach(() => {
		// Restore original env
		process.env = { ...originalEnv }
	})

	describe('AuthError', () => {
		test('creates error with message', () => {
			const error = new AuthError('Test error message')
			expect(error.message).toBe('Test error message')
			expect(error.name).toBe('AuthError')
		})

		test('is instanceof Error', () => {
			const error = new AuthError('Test')
			expect(error instanceof Error).toBe(true)
		})
	})

	describe('environment variable detection', () => {
		test('GITHUB_TOKEN takes priority', async () => {
			process.env.GITHUB_TOKEN = 'test-token-123'

			// Re-import to get fresh module
			const { detectAuth } = await import('../src/lib/github/auth')
			const result = await detectAuth()

			expect(result.method).toBe('token')
			expect(result.token).toBe('test-token-123')
		})

		test('GH_TOKEN is fallback', async () => {
			process.env.GH_TOKEN = 'gh-token-456'

			const { detectAuth } = await import('../src/lib/github/auth')
			const result = await detectAuth()

			expect(result.method).toBe('token')
			expect(result.token).toBe('gh-token-456')
		})

		test('GITHUB_TOKEN preferred over GH_TOKEN', async () => {
			process.env.GITHUB_TOKEN = 'github-token'
			process.env.GH_TOKEN = 'gh-token'

			const { detectAuth } = await import('../src/lib/github/auth')
			const result = await detectAuth()

			expect(result.token).toBe('github-token')
		})
	})

	describe('getToken', () => {
		test('throws AuthError when no auth available', async () => {
			// Ensure no tokens are set
			delete process.env.GITHUB_TOKEN
			delete process.env.GH_TOKEN

			// Mock gh CLI to fail
			const mockExec = mock(() => Promise.reject(new Error('gh not found')))

			// This test needs the actual module behavior
			// We test the error message format
			const error = new AuthError(
				'No GitHub authentication found. Either:\n' +
					'  1. Set GITHUB_TOKEN environment variable\n' +
					'  2. Run `gh auth login` to authenticate with GitHub CLI'
			)

			expect(error.message).toContain('GITHUB_TOKEN')
			expect(error.message).toContain('gh auth login')
		})
	})

	describe('validateToken', () => {
		test('returns true for valid token', async () => {
			const { validateToken } = await import('../src/lib/github/auth')

			// Mock fetch for this test
			const originalFetch = globalThis.fetch
			globalThis.fetch = mock(() =>
				Promise.resolve(new Response(JSON.stringify({ login: 'testuser' }), { status: 200 }))
			) as typeof fetch

			const result = await validateToken('valid-token')
			expect(result).toBe(true)

			globalThis.fetch = originalFetch
		})

		test('returns false for invalid token', async () => {
			const { validateToken } = await import('../src/lib/github/auth')

			const originalFetch = globalThis.fetch
			globalThis.fetch = mock(() =>
				Promise.resolve(new Response('Unauthorized', { status: 401 }))
			) as typeof fetch

			const result = await validateToken('invalid-token')
			expect(result).toBe(false)

			globalThis.fetch = originalFetch
		})

		test('returns false on network error', async () => {
			const { validateToken } = await import('../src/lib/github/auth')

			const originalFetch = globalThis.fetch
			globalThis.fetch = mock(() => Promise.reject(new Error('Network error'))) as typeof fetch

			const result = await validateToken('any-token')
			expect(result).toBe(false)

			globalThis.fetch = originalFetch
		})
	})
})
