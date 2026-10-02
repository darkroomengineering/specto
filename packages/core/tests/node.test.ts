import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { AuthError } from '../src/errors'
import { detectAuth, getToken } from '../src/node'

describe('auth utilities', () => {
	const originalEnv = { ...process.env }

	beforeEach(() => {
		delete process.env.GITHUB_TOKEN
		delete process.env.GH_TOKEN
	})

	afterEach(() => {
		process.env = { ...originalEnv }
	})

	describe('AuthError', () => {
		test('creates error with message', () => {
			const error = new AuthError('Test error message')
			expect(error.message).toBe('Test error message')
			expect(error.name).toBe('AuthError')
		})

		test('is instanceof Error', () => {
			expect(new AuthError('Test') instanceof Error).toBe(true)
		})
	})

	describe('environment variable detection', () => {
		test('GITHUB_TOKEN takes priority', async () => {
			process.env.GITHUB_TOKEN = 'test-token-123'
			const result = await detectAuth()
			expect(result.method).toBe('token')
			expect(result.token).toBe('test-token-123')
		})

		test('GH_TOKEN is fallback', async () => {
			process.env.GH_TOKEN = 'gh-token-456'
			const result = await detectAuth()
			expect(result.method).toBe('token')
			expect(result.token).toBe('gh-token-456')
		})

		test('GITHUB_TOKEN preferred over GH_TOKEN', async () => {
			process.env.GITHUB_TOKEN = 'github-token'
			process.env.GH_TOKEN = 'gh-token'
			const result = await detectAuth()
			expect(result.token).toBe('github-token')
		})
	})

	describe('getToken', () => {
		test('throws AuthError when no env token and gh CLI is unavailable', async () => {
			process.env.PATH = ''
			const error = await getToken().catch((e: unknown) => e)
			expect(error).toBeInstanceOf(AuthError)
			expect((error as AuthError).message).toContain('GITHUB_TOKEN')
			expect((error as AuthError).message).toContain('gh auth login')
		})

		test('returns the env token', async () => {
			process.env.GITHUB_TOKEN = 'env-token'
			expect(await getToken()).toBe('env-token')
		})
	})
})
