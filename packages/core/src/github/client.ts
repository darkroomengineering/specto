import { GitHubError, RateLimitError } from '../errors'
import type {
	ActionsSettings,
	Member,
	Organization,
	OrgOverview,
	OrgSecret,
	OrgSuggestion,
	Runner,
	Webhook,
} from '../types'
import {
	type ActivityOptions,
	type CommitActivityOptions,
	getCommitActivity,
	getIssueActivity,
	getPullRequestActivity,
} from './activity'

const API_URL = 'https://api.github.com'

type Params = Record<string, string | number | undefined>

export interface RequestOptions {
	method?: string
	params?: Params
	body?: unknown
}

export interface PaginateOptions {
	params?: Params
	perPage?: number
	maxPages?: number
}

export interface GitHubClientOptions {
	token: string
	userAgent?: string
}

export type GraphQL = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>

export type GitHubClient = ReturnType<typeof createGitHubClient>

interface GraphQLResponse<T> {
	data?: T | null
	errors?: Array<{ type?: string; message: string }>
}

// GitHub sends x-ratelimit-reset on every response, so only an exhausted quota
// (or a 429 secondary limit) counts as rate limiting; other 403s are permission errors.
async function toError(response: Response): Promise<GitHubError> {
	const body = await response.text()
	const exhausted = response.headers.get('x-ratelimit-remaining') === '0'
	if (response.status === 429 || (response.status === 403 && exhausted)) {
		const reset = Number(response.headers.get('x-ratelimit-reset'))
		return new RateLimitError(reset ? new Date(reset * 1000) : new Date(), body)
	}
	return new GitHubError(response.status, response.statusText, body)
}

/**
 * Browser-safe GitHub client. Takes the token explicitly so it runs in the
 * desktop webview, the CLI, and server routes alike.
 */
export function createGitHubClient({ token, userAgent = 'specto' }: GitHubClientOptions) {
	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': userAgent,
	}

	async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		const { method = 'GET', params, body } = options
		const url = new URL(`${API_URL}${endpoint}`)
		for (const [key, value] of Object.entries(params ?? {})) {
			if (value !== undefined) url.searchParams.set(key, String(value))
		}

		const response = await fetch(url, {
			method,
			headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
			body: body ? JSON.stringify(body) : undefined,
		})
		if (!response.ok) throw await toError(response)
		return response.json() as Promise<T>
	}

	async function* paginate<T>(
		endpoint: string,
		options: PaginateOptions = {}
	): AsyncGenerator<T, void, unknown> {
		const { params = {}, perPage = 100, maxPages = Number.POSITIVE_INFINITY } = options
		for (let page = 1; page <= maxPages; page++) {
			const items = await request<T[]>(endpoint, { params: { ...params, page, per_page: perPage } })
			yield* items
			if (items.length < perPage) return
		}
	}

	async function list<T>(endpoint: string, options?: PaginateOptions): Promise<T[]> {
		const items: T[] = []
		for await (const item of paginate<T>(endpoint, options)) items.push(item)
		return items
	}

	const graphql: GraphQL = async <T>(query: string, variables?: Record<string, unknown>) => {
		const response = await fetch(`${API_URL}/graphql`, {
			method: 'POST',
			headers: { ...headers, 'Content-Type': 'application/json' },
			body: JSON.stringify({ query, variables }),
		})
		if (!response.ok) throw await toError(response)

		const { data, errors } = (await response.json()) as GraphQLResponse<T>
		if (errors?.length) {
			const message = errors.map((e) => e.message).join('; ')
			if (errors.some((e) => e.type === 'RATE_LIMITED')) {
				const reset = response.headers.get('x-ratelimit-reset')
				throw new RateLimitError(reset ? new Date(Number(reset) * 1000) : new Date(), message)
			}
			if (errors.some((e) => e.type === 'NOT_FOUND')) {
				throw new GitHubError(404, 'Not Found', message)
			}
			// Partial data is still useful (e.g. teams hidden by missing read:org scope)
			if (!data) throw new GitHubError(response.status, 'GraphQL Error', message)
		}
		if (!data) throw new GitHubError(response.status, 'GraphQL Error', 'Empty response')
		return data
	}

	const org = (login: string) => `/orgs/${encodeURIComponent(login)}`

	return {
		request,
		list,
		graphql,

		getOrganization: (login: string) => request<Organization>(org(login)),
		listOrgMembers: (login: string, role: 'all' | 'admin' | 'member' = 'all') =>
			list<Member>(`${org(login)}/members`, { params: { role } }),
		listUserOrgs: () => list<Organization>('/user/orgs'),
		getOrgWebhooks: (login: string) => list<Webhook>(`${org(login)}/hooks`),
		getActionsSettings: (login: string) =>
			request<ActionsSettings>(`${org(login)}/actions/permissions`),
		getOrgRunners: (login: string) =>
			request<{ total_count: number; runners: Runner[] }>(`${org(login)}/actions/runners`),
		getOrgSecrets: (login: string) =>
			request<{ total_count: number; secrets: OrgSecret[] }>(`${org(login)}/actions/secrets`),

		getOrgOverview: (login: string) => getOrgOverview(graphql, login),
		searchOrgs: (query: string, limit = 5) => searchOrgs(request, query, limit),
		getCommitActivity: (login: string, options: CommitActivityOptions) =>
			getCommitActivity(graphql, login, options),
		getPullRequestActivity: (login: string, options: ActivityOptions) =>
			getPullRequestActivity(graphql, login, options),
		getIssueActivity: (login: string, options: ActivityOptions) =>
			getIssueActivity(graphql, login, options),
	}
}

const ORG_OVERVIEW_QUERY = `
	query ($login: String!) {
		organization(login: $login) {
			login
			name
			description
			avatarUrl
			url
			websiteUrl
			location
			createdAt
			repositories { totalCount }
			membersWithRole { totalCount }
			teams(first: 100) {
				nodes {
					id
					slug
					name
					description
					privacy
					url
					members { totalCount }
					repositories { totalCount }
					parentTeam { name }
				}
			}
		}
	}
`

interface OrgOverviewResponse {
	organization: {
		login: string
		name: string | null
		description: string | null
		avatarUrl: string
		url: string
		websiteUrl: string | null
		location: string | null
		createdAt: string
		repositories: { totalCount: number }
		membersWithRole: { totalCount: number }
		teams: {
			nodes: Array<{
				id: string
				slug: string
				name: string
				description: string | null
				privacy: 'SECRET' | 'VISIBLE'
				url: string
				members: { totalCount: number }
				repositories: { totalCount: number }
				parentTeam: { name: string } | null
			}>
		} | null
	}
}

async function getOrgOverview(graphql: GraphQL, login: string): Promise<OrgOverview> {
	const { organization: o } = await graphql<OrgOverviewResponse>(ORG_OVERVIEW_QUERY, { login })
	return {
		login: o.login,
		name: o.name,
		description: o.description,
		avatarUrl: o.avatarUrl,
		url: o.url,
		websiteUrl: o.websiteUrl,
		location: o.location,
		createdAt: o.createdAt,
		repositoryCount: o.repositories.totalCount,
		memberCount: o.membersWithRole.totalCount,
		teams: (o.teams?.nodes ?? []).map(({ members, repositories, parentTeam, ...team }) => ({
			...team,
			memberCount: members.totalCount,
			repositoryCount: repositories.totalCount,
			parentName: parentTeam?.name ?? null,
		})),
	}
}

async function searchOrgs(
	request: <T>(endpoint: string, options?: RequestOptions) => Promise<T>,
	query: string,
	limit: number
): Promise<OrgSuggestion[]> {
	const { items } = await request<{
		items: Array<{ login: string; avatar_url: string }>
	}>('/search/users', { params: { q: `${query} type:org`, per_page: limit } })
	return items.map((item) => ({ login: item.login, avatarUrl: item.avatar_url }))
}
