import { describe, expect, test } from 'bun:test'
import { formatError } from '../src/lib/utils/errors'
import { GitHubError, RateLimitError } from '../src/lib/github/client'
import { AuthError } from '../src/lib/github/auth'

describe('error formatting', () => {
	describe('formatError', () => {
		test('formats AuthError', () => {
			const error = new AuthError('No token found')
			const result = formatError(error)

			expect(result).toContain('Authentication Error')
			expect(result).toContain('No token found')
		})

		test('formats RateLimitError with reset time', () => {
			const resetAt = new Date('2025-06-15T15:30:00Z')
			const error = new RateLimitError(resetAt)
			const result = formatError(error)

			expect(result).toContain('Rate Limit Exceeded')
			expect(result).toContain('Resets at')
		})

		test('formats GitHubError 404', () => {
			const error = new GitHubError(404, 'Not Found')
			const result = formatError(error)

			expect(result).toContain('Not Found')
			expect(result).toContain('organization name is correct')
		})

		test('formats GitHubError 403', () => {
			const error = new GitHubError(403, 'Forbidden')
			const result = formatError(error)

			expect(result).toContain('Access Denied')
			expect(result).toContain('admin access')
		})

		test('formats GitHubError 401', () => {
			const error = new GitHubError(401, 'Unauthorized')
			const result = formatError(error)

			expect(result).toContain('Unauthorized')
			expect(result).toContain('invalid or expired')
		})

		test('formats generic GitHubError', () => {
			const error = new GitHubError(500, 'Internal Server Error', 'Something broke')
			const result = formatError(error)

			expect(result).toContain('GitHub API Error')
		})

		test('formats standard Error', () => {
			const error = new Error('Something went wrong')
			const result = formatError(error)

			expect(result).toContain('Error')
			expect(result).toContain('Something went wrong')
		})

		test('formats unknown error type', () => {
			const result = formatError('string error')

			expect(result).toContain('Unknown Error')
			expect(result).toContain('string error')
		})

		test('formats null/undefined', () => {
			expect(formatError(null)).toContain('null')
			expect(formatError(undefined)).toContain('undefined')
		})
	})
})
