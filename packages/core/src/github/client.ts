import type {
	ActionsSettings,
	AuditLogEntry,
	Commit,
	Member,
	Organization,
	OrgSecret,
	PaginationOptions,
	Repository,
	Runner,
	Team,
	Webhook,
} from '../types'
import { getToken } from './auth'

const BASE_URL = 'https://api.github.com'

export class GitHubError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public body?: string
	) {
		super(`GitHub API error: ${status} ${statusText}${body ? ` - ${body}` : ''}`)
		this.name = 'GitHubError'
	}
}

export class RateLimitError extends GitHubError {
	constructor(
		public resetAt: Date,
		body?: string
	) {
		super(403, 'Rate Limit Exceeded', body)
		this.name = 'RateLimitError'
	}
}

interface FetchOptions {
	method?: string
	body?: string
	params?: Record<string, string | number | undefined>
}

async function githubFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
	const token = await getToken()
	const { method = 'GET', body, params } = options

	const url = new URL(`${BASE_URL}${endpoint}`)
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				url.searchParams.set(key, String(value))
			}
		}
	}

	const response = await fetch(url.toString(), {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			...(body ? { 'Content-Type': 'application/json' } : {}),
		},
		body,
	})

	if (!response.ok) {
		const resetHeader = response.headers.get('x-ratelimit-reset')
		if (response.status === 403 && resetHeader) {
			const resetAt = new Date(Number.parseInt(resetHeader, 10) * 1000)
			throw new RateLimitError(resetAt, await response.text())
		}
		throw new GitHubError(response.status, response.statusText, await response.text())
	}

	return response.json() as Promise<T>
}

export async function* paginate<T>(
	endpoint: string,
	options: PaginationOptions & { params?: Record<string, string | number | undefined> } = {}
): AsyncGenerator<T, void, unknown> {
	const { perPage = 100, maxPages, params = {} } = options
	let page = 1

	while (true) {
		if (maxPages && page > maxPages) break

		const data = await githubFetch<T[]>(endpoint, {
			params: { ...params, page, per_page: perPage },
		})

		if (data.length === 0) break

		for (const item of data) {
			yield item
		}

		if (data.length < perPage) break
		page++
	}
}

export async function collectPaginated<T>(
	endpoint: string,
	options: PaginationOptions & { params?: Record<string, string | number | undefined> } = {}
): Promise<T[]> {
	const results: T[] = []
	for await (const item of paginate<T>(endpoint, options)) {
		results.push(item)
	}
	return results
}

// Organization endpoints
export async function getOrganization(org: string): Promise<Organization> {
	return githubFetch<Organization>(`/orgs/${org}`)
}

export async function* getOrgMembers(
	org: string,
	options?: PaginationOptions
): AsyncGenerator<Member, void, unknown> {
	yield* paginate<Member>(`/orgs/${org}/members`, options)
}

export async function getOrgMembersList(
	org: string,
	options?: PaginationOptions
): Promise<Member[]> {
	return collectPaginated<Member>(`/orgs/${org}/members`, options)
}

export async function* getOrgRepos(
	org: string,
	options?: PaginationOptions
): AsyncGenerator<Repository, void, unknown> {
	yield* paginate<Repository>(`/orgs/${org}/repos`, {
		...options,
		params: { type: 'all', sort: 'pushed' },
	})
}

export async function getOrgReposList(
	org: string,
	options?: PaginationOptions
): Promise<Repository[]> {
	return collectPaginated<Repository>(`/orgs/${org}/repos`, {
		...options,
		params: { type: 'all', sort: 'pushed' },
	})
}

export async function* getOrgTeams(
	org: string,
	options?: PaginationOptions
): AsyncGenerator<Team, void, unknown> {
	yield* paginate<Team>(`/orgs/${org}/teams`, options)
}

export async function getOrgTeamsList(org: string, options?: PaginationOptions): Promise<Team[]> {
	return collectPaginated<Team>(`/orgs/${org}/teams`, options)
}

// Repository endpoints
export async function* getRepoCommits(
	repo: string,
	options: PaginationOptions & { since?: string; until?: string; author?: string } = {}
): AsyncGenerator<Commit, void, unknown> {
	const { since, until, author, ...paginationOptions } = options
	yield* paginate<Commit>(`/repos/${repo}/commits`, {
		...paginationOptions,
		params: { since, until, author },
	})
}

// Organization settings (require admin)
export async function getOrgWebhooks(org: string): Promise<Webhook[]> {
	return githubFetch<Webhook[]>(`/orgs/${org}/hooks`)
}

export async function getActionsSettings(org: string): Promise<ActionsSettings> {
	return githubFetch<ActionsSettings>(`/orgs/${org}/actions/permissions`)
}

export async function getOrgRunners(
	org: string
): Promise<{ total_count: number; runners: Runner[] }> {
	return githubFetch<{ total_count: number; runners: Runner[] }>(`/orgs/${org}/actions/runners`)
}

export async function getOrgSecrets(
	org: string
): Promise<{ total_count: number; secrets: OrgSecret[] }> {
	return githubFetch<{ total_count: number; secrets: OrgSecret[] }>(`/orgs/${org}/actions/secrets`)
}

export async function* getAuditLog(
	org: string,
	options: PaginationOptions & {
		phrase?: string
		include?: string
		after?: string
		before?: string
	} = {}
): AsyncGenerator<AuditLogEntry, void, unknown> {
	const { phrase, include, after, before, ...paginationOptions } = options
	yield* paginate<AuditLogEntry>(`/orgs/${org}/audit-log`, {
		...paginationOptions,
		params: { phrase, include, after, before },
	})
}

// User organizations
export async function getUserOrgs(): Promise<Organization[]> {
	return collectPaginated<Organization>('/user/orgs')
}
