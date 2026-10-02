import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { GitHubError, RateLimitError } from '../src/errors'
import { createGitHubClient } from '../src/github/client'

const json = (body: unknown, init?: ResponseInit) =>
	new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'content-type': 'application/json' },
		...init,
	})

let originalFetch: typeof fetch
let requests: Array<{ url: string; body?: { query: string; variables: Record<string, unknown> } }>

function mockFetch(handler: (url: string, body?: unknown) => Response) {
	globalThis.fetch = mock((input: string | URL, init?: RequestInit) => {
		const url = String(input)
		const body = init?.body ? JSON.parse(String(init.body)) : undefined
		requests.push({ url, body })
		return Promise.resolve(handler(url, body))
	}) as unknown as typeof fetch
}

beforeEach(() => {
	originalFetch = globalThis.fetch
	requests = []
})

afterEach(() => {
	globalThis.fetch = originalFetch
})

const gh = createGitHubClient({ token: 'test-token' })

describe('errors', () => {
	test('GitHubError carries status and body', () => {
		const error = new GitHubError(404, 'Not Found', 'Resource not found')
		expect(error.status).toBe(404)
		expect(error.statusText).toBe('Not Found')
		expect(error.body).toBe('Resource not found')
		expect(error.message).toContain('404')
	})

	test('GitHubError works without body', () => {
		const error = new GitHubError(500, 'Internal Server Error')
		expect(error.body).toBeUndefined()
		expect(error.message).toBe('GitHub API error: 500 Internal Server Error')
	})

	test('RateLimitError extends GitHubError and stores reset time', () => {
		const resetAt = new Date('2025-06-15T12:00:00Z')
		const error = new RateLimitError(resetAt)
		expect(error instanceof GitHubError).toBe(true)
		expect(error.status).toBe(403)
		expect(error.resetAt).toEqual(resetAt)
	})
})

describe('REST', () => {
	test('sends auth headers and query params', async () => {
		let headers: Headers | undefined
		globalThis.fetch = mock((_input: string | URL, init?: RequestInit) => {
			headers = new Headers(init?.headers)
			return Promise.resolve(json({ login: 'acme' }))
		}) as unknown as typeof fetch
		await gh.request('/orgs/acme', { params: { a: 1, b: undefined } })
		expect(headers?.get('authorization')).toBe('Bearer test-token')
	})

	test('paginate yields a single short page', async () => {
		mockFetch(() => json([{ id: 1 }, { id: 2 }]))
		expect(await gh.list<{ id: number }>('/test')).toEqual([{ id: 1 }, { id: 2 }])
		expect(requests).toHaveLength(1)
	})

	test('paginate follows full pages', async () => {
		mockFetch((url) => {
			const page = Number(new URL(url).searchParams.get('page'))
			return json(page === 1 ? [{ id: 1 }, { id: 2 }] : [{ id: 3 }])
		})
		expect(await gh.list('/test', { perPage: 2 })).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
	})

	test('paginate handles empty response', async () => {
		mockFetch(() => json([]))
		expect(await gh.list('/test')).toEqual([])
	})

	test('paginate respects maxPages', async () => {
		mockFetch(() => json([{ id: 1 }]))
		expect(await gh.list('/test', { perPage: 1, maxPages: 2 })).toHaveLength(2)
	})

	test('throws GitHubError on API error', async () => {
		mockFetch(() => new Response('Not found', { status: 404, statusText: 'Not Found' }))
		await expect(gh.list('/test')).rejects.toThrow(GitHubError)
	})

	test('throws RateLimitError when the quota is exhausted', async () => {
		const reset = Math.floor(Date.now() / 1000) + 3600
		mockFetch(
			() =>
				new Response('Rate limit exceeded', {
					status: 403,
					headers: { 'x-ratelimit-reset': String(reset), 'x-ratelimit-remaining': '0' },
				})
		)
		const error = await gh.request('/test').catch((e: unknown) => e)
		expect(error).toBeInstanceOf(RateLimitError)
		expect((error as RateLimitError).resetAt.getTime()).toBe(reset * 1000)
	})

	test('throws RateLimitError on 429', async () => {
		mockFetch(() => new Response('Slow down', { status: 429 }))
		await expect(gh.request('/test')).rejects.toThrow(RateLimitError)
	})

	test('treats a 403 with quota left as a permission error', async () => {
		mockFetch(
			() =>
				new Response('Must have admin rights', {
					status: 403,
					headers: { 'x-ratelimit-reset': '1', 'x-ratelimit-remaining': '4999' },
				})
		)
		const error = await gh.request('/test').catch((e: unknown) => e)
		expect(error).toBeInstanceOf(GitHubError)
		expect(error).not.toBeInstanceOf(RateLimitError)
	})
})

describe('GraphQL', () => {
	test('returns data', async () => {
		mockFetch(() => json({ data: { viewer: { login: 'me' } } }))
		expect(await gh.graphql('{ viewer { login } }')).toEqual({ viewer: { login: 'me' } })
	})

	test('maps NOT_FOUND to a 404 GitHubError', async () => {
		mockFetch(() =>
			json({ data: { organization: null }, errors: [{ type: 'NOT_FOUND', message: 'nope' }] })
		)
		const error = await gh.getOrgOverview('missing').catch((e: unknown) => e)
		expect(error).toBeInstanceOf(GitHubError)
		expect((error as GitHubError).status).toBe(404)
	})

	test('maps RATE_LIMITED to RateLimitError', async () => {
		mockFetch(() => json({ data: null, errors: [{ type: 'RATE_LIMITED', message: 'limit' }] }))
		await expect(gh.graphql('{ x }')).rejects.toThrow(RateLimitError)
	})

	test('keeps partial data when some fields fail', async () => {
		mockFetch(() =>
			json({ data: { a: 1, b: null }, errors: [{ type: 'FORBIDDEN', message: 'x' }] })
		)
		expect(await gh.graphql('{ a b }')).toEqual({ a: 1, b: null })
	})
})

const history = (logins: Array<string | null>, totalCount: number, endCursor: string | null) => ({
	totalCount,
	pageInfo: { hasNextPage: endCursor !== null, endCursor },
	nodes: logins.map((login) => ({ author: { user: login ? { login } : null } })),
})

const repo = (name: string, pushedAt: string, h: ReturnType<typeof history>) => ({
	owner: { login: 'acme' },
	name,
	pushedAt,
	defaultBranchRef: { target: { history: h } },
})

describe('getCommitActivity', () => {
	test('sums totals, follows per-repo pages, and stops at stale repos', async () => {
		mockFetch((_url, body) => {
			const { query } = body as { query: string }
			if (query.includes('organization')) {
				return json({
					data: {
						organization: {
							repositories: {
								pageInfo: { hasNextPage: true, endCursor: 'next' },
								nodes: [
									repo('busy', '2026-03-01T00:00:00Z', history(['ana', 'bo', null], 5, 'c1')),
									repo(
										'quiet',
										'2026-02-01T00:00:00Z',
										history(['dependabot[bot]', 'ana'], 2, null)
									),
									repo('stale', '2025-01-01T00:00:00Z', history([], 0, null)),
								],
							},
						},
					},
				})
			}
			return json({
				data: { r0: { defaultBranchRef: { target: { history: history(['bo', 'bo'], 5, null) } } } },
			})
		})

		const result = await gh.getCommitActivity('acme', { since: '2026-01-01T00:00:00Z' })

		expect(result.total).toBe(7)
		expect(result.repositories).toBe(2)
		expect(result.complete).toBe(true)
		expect(result.byAuthor).toEqual([
			{ author: 'bo', count: 3 },
			{ author: 'ana', count: 2 },
		])
		expect(result.attributed).toBe(5)
		// One repo listing (stale repo ends paging) plus one follow-up batch
		expect(requests).toHaveLength(2)
		expect(requests[1]?.body?.variables).toMatchObject({ o0: 'acme', n0: 'busy', c0: 'c1' })
	})

	test('flags incomplete attribution when a repo exceeds the page cap', async () => {
		mockFetch(() =>
			json({
				data: {
					organization: {
						repositories: {
							pageInfo: { hasNextPage: false, endCursor: null },
							nodes: [repo('huge', '2026-03-01T00:00:00Z', history(['ana'], 500, 'c1'))],
						},
					},
				},
			})
		)
		const result = await gh.getCommitActivity('acme', {
			since: '2026-01-01T00:00:00Z',
			maxPagesPerRepo: 1,
		})
		expect(result.total).toBe(500)
		expect(result.complete).toBe(false)
		expect(requests).toHaveLength(1)
	})

	test('applies includeBots and author filters', async () => {
		mockFetch(() =>
			json({
				data: {
					organization: {
						repositories: {
							pageInfo: { hasNextPage: false, endCursor: null },
							nodes: [
								repo('r', '2026-03-01T00:00:00Z', history(['ana', 'bo', 'renovate[bot]'], 3, null)),
							],
						},
					},
				},
			})
		)
		const withBots = await gh.getCommitActivity('acme', { since: '2026-01-01', includeBots: true })
		expect(withBots.byAuthor.map((a) => a.author)).toContain('renovate[bot]')

		const members = await gh.getCommitActivity('acme', {
			since: '2026-01-01',
			authors: new Set(['ana']),
		})
		expect(members.byAuthor).toEqual([{ author: 'ana', count: 1 }])
	})
})

describe('search activity', () => {
	test('aggregates pull requests by author and skips bots', async () => {
		mockFetch(() =>
			json({
				data: {
					search: {
						issueCount: 4,
						pageInfo: { hasNextPage: false, endCursor: null },
						nodes: [
							{ author: { login: 'ana', __typename: 'User' }, merged: true },
							{ author: { login: 'ana', __typename: 'User' }, merged: false },
							{ author: { login: 'dependabot', __typename: 'Bot' }, merged: true },
							{ author: null, merged: false },
						],
					},
				},
			})
		)
		const result = await gh.getPullRequestActivity('acme', { since: '2026-01-01T00:00:00Z' })
		expect(result.total).toBe(4)
		expect(result.byAuthor).toEqual([{ author: 'ana', count: 2, merged: 1 }])
		expect(requests[0]?.body?.variables.q).toBe(
			'org:acme is:pr created:>=2026-01-01T00:00:00Z sort:created-desc'
		)
	})

	test('reports incomplete when search hits its result cap', async () => {
		mockFetch(() =>
			json({
				data: {
					search: {
						issueCount: 1500,
						pageInfo: { hasNextPage: false, endCursor: null },
						nodes: [{ author: { login: 'ana', __typename: 'User' }, state: 'CLOSED' }],
					},
				},
			})
		)
		const result = await gh.getIssueActivity('acme', {
			since: '2026-01-01T00:00:00Z',
			until: '2026-02-01T00:00:00Z',
		})
		expect(result.complete).toBe(false)
		expect(result.byAuthor).toEqual([{ author: 'ana', opened: 1, closed: 1 }])
		expect(requests[0]?.body?.variables.q).toContain(
			'created:2026-01-01T00:00:00Z..2026-02-01T00:00:00Z'
		)
	})
})
