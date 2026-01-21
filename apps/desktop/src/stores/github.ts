import { create } from 'zustand'
import { useAuthStore } from './auth'
// Use browser-safe imports (no Node.js modules)
import {
	type Organization,
	type Member,
	type Team,
	type Repository,
	type CommitStats,
	// Caching utilities
	MemoryCache,
	deduplicatedFetch,
	batchProcess,
} from '@specto/core/browser'

export type Timeframe = '7d' | '30d' | '90d' | 'ytd' | 'all'
export type MetricType = 'commits' | 'prs' | 'issues' | 'reviews'

// Shared cache instance with 5-minute TTL
const cache = new MemoryCache({
	ttl: 5 * 60 * 1000,
	maxEntries: 500,
	staleWhileRevalidate: 60 * 1000, // 1 minute stale-while-revalidate
})

// Persistent localStorage cache for offline support
const OFFLINE_CACHE_PREFIX = 'specto:cache:org:'

interface OfflineCacheEntry<T> {
	data: T
	timestamp: number
}

function saveToOfflineCache<T>(orgName: string, data: T): void {
	try {
		const entry: OfflineCacheEntry<T> = {
			data,
			timestamp: Date.now(),
		}
		localStorage.setItem(`${OFFLINE_CACHE_PREFIX}${orgName}`, JSON.stringify(entry))
	} catch {
		// localStorage might be full or unavailable
	}
}

function loadFromOfflineCache<T>(orgName: string): OfflineCacheEntry<T> | null {
	try {
		const stored = localStorage.getItem(`${OFFLINE_CACHE_PREFIX}${orgName}`)
		if (stored) {
			const parsed = JSON.parse(stored)
			// Validate the parsed data has expected structure
			if (parsed && typeof parsed === 'object' && 'data' in parsed && 'timestamp' in parsed) {
				return parsed as OfflineCacheEntry<T>
			}
			return null
		}
	} catch {
		// Invalid JSON or localStorage unavailable
	}
	return null
}

function formatCacheAge(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000)
	if (seconds < 60) return 'just now'
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}

// Pagination helper - fetches all pages from GitHub API
async function fetchAllPages<T>(
	endpoint: string,
	token: string,
	params: Record<string, string | number | undefined> = {},
	maxPages = 10
): Promise<T[]> {
	const results: T[] = []
	let page = 1
	const perPage = 100

	while (page <= maxPages) {
		const url = new URL(`https://api.github.com${endpoint}`)
		url.searchParams.set('per_page', String(perPage))
		url.searchParams.set('page', String(page))

		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				url.searchParams.set(key, String(value))
			}
		}

		const response = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
			},
		})

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`)
		}

		const data = (await response.json()) as T[]

		if (data.length === 0) break

		results.push(...data)

		// If we got fewer than perPage, we've reached the end
		if (data.length < perPage) break

		page++
	}

	return results
}

interface PRStats {
	author: string
	count: number
	merged: number
}

interface IssueStats {
	author: string
	opened: number
	closed: number
}

interface OrgData {
	info: Organization | null
	members: Member[]
	teams: Team[]
	repos: Repository[]
	commitStats: CommitStats[]
	prStats: PRStats[]
	issueStats: IssueStats[]
	totalCommits: number
	totalPRs: number
	totalIssues: number
	totalLinesAdded: number
	totalLinesDeleted: number
}

interface OrgSuggestion {
	login: string
	avatar_url: string
	description: string | null
}

interface GitHubState {
	currentOrg: string | null
	orgData: OrgData
	timeframe: Timeframe
	metricType: MetricType
	isLoading: {
		info: boolean
		members: boolean
		teams: boolean
		repos: boolean
		commits: boolean
		prs: boolean
		issues: boolean
	}
	error: string | null
	notFound: boolean
	suggestions: OrgSuggestion[]
	cacheAge: string | null // For showing "Last updated X ago" when using cached data
	isUsingCachedData: boolean
	setOrg: (org: string) => void
	setTimeframe: (tf: Timeframe) => void
	setMetricType: (mt: MetricType) => void
	fetchOrgInfo: () => Promise<void>
	fetchMembers: () => Promise<void>
	fetchTeams: () => Promise<void>
	fetchRepos: () => Promise<void>
	fetchCommitStats: () => Promise<void>
	fetchPRStats: () => Promise<void>
	fetchIssueStats: () => Promise<void>
	fetchAll: () => Promise<void>
	clearCache: () => void
}

function getDateSince(timeframe: Timeframe): string {
	const now = new Date()
	switch (timeframe) {
		case '7d':
			now.setDate(now.getDate() - 7)
			break
		case '30d':
			now.setDate(now.getDate() - 30)
			break
		case '90d':
			now.setDate(now.getDate() - 90)
			break
		case 'ytd':
			return `${now.getFullYear()}-01-01T00:00:00Z`
		case 'all':
			return '2008-01-01T00:00:00Z' // GitHub's founding year
	}
	return now.toISOString()
}

/**
 * Cached GitHub fetch with deduplication
 */
async function cachedGitHubFetch<T>(
	cacheKey: string,
	fetcher: () => Promise<T>,
	skipCache = false
): Promise<T> {
	// Check cache first (unless skipped)
	if (!skipCache) {
		const cached = await cache.get<T>(cacheKey)
		if (cached && Date.now() < cached.expiresAt) {
			return cached.data
		}
	}

	// Use deduplication for concurrent requests
	const data = await deduplicatedFetch(cacheKey, fetcher)

	// Store in cache
	await cache.set(cacheKey, cache.createEntry(data))

	return data
}

export const useGitHubStore = create<GitHubState>((set, get) => ({
	currentOrg: null,
	orgData: {
		info: null,
		members: [],
		teams: [],
		repos: [],
		commitStats: [],
		prStats: [],
		issueStats: [],
		totalCommits: 0,
		totalPRs: 0,
		totalIssues: 0,
		totalLinesAdded: 0,
		totalLinesDeleted: 0,
	},
	timeframe: 'ytd',
	metricType: 'commits',
	isLoading: {
		info: false,
		members: false,
		teams: false,
		repos: false,
		commits: false,
		prs: false,
		issues: false,
	},
	error: null,
	notFound: false,
	suggestions: [],
	cacheAge: null,
	isUsingCachedData: false,

	setOrg: (org) => {
		// Check for offline cached data first
		const offlineCache = loadFromOfflineCache<OrgData>(org)

		set({
			currentOrg: org,
			orgData: offlineCache?.data ?? {
				info: null,
				members: [],
				teams: [],
				repos: [],
				commitStats: [],
				prStats: [],
				issueStats: [],
				totalCommits: 0,
				totalPRs: 0,
				totalIssues: 0,
				totalLinesAdded: 0,
				totalLinesDeleted: 0,
			},
			error: null,
			notFound: false,
			suggestions: [],
			cacheAge: offlineCache ? formatCacheAge(offlineCache.timestamp) : null,
			isUsingCachedData: !!offlineCache,
		})
	},

	setTimeframe: (timeframe) => {
		set({ timeframe })
		// Refetch stats with new timeframe
		const { fetchCommitStats, fetchPRStats, fetchIssueStats } = get()
		Promise.all([fetchCommitStats(), fetchPRStats(), fetchIssueStats()])
	},

	setMetricType: (metricType) => {
		set({ metricType })
	},

	fetchOrgInfo: async () => {
		const { currentOrg } = get()
		if (!currentOrg) return

		set((s) => ({
			isLoading: { ...s.isLoading, info: true },
			error: null,
			notFound: false,
			suggestions: [],
		}))

		const token = await useAuthStore.getState().getToken()
		if (!token) {
			set((s) => ({
				isLoading: { ...s.isLoading, info: false },
				error: 'Not authenticated',
			}))
			return
		}

		try {
			const info = await cachedGitHubFetch<Organization>(
				`org:${currentOrg}`,
				async () => {
					const response = await fetch(`https://api.github.com/orgs/${currentOrg}`, {
						headers: {
							Authorization: `Bearer ${token}`,
							Accept: 'application/vnd.github+json',
						},
					})

					if (response.status === 404) {
						throw new Error('NOT_FOUND')
					}

					if (!response.ok) {
						throw new Error(`GitHub API error: ${response.status}`)
					}

					return response.json() as Promise<Organization>
				}
			)

			set((s) => ({
				orgData: { ...s.orgData, info },
				isLoading: { ...s.isLoading, info: false },
			}))
		} catch (err) {
			if (err instanceof Error && err.message === 'NOT_FOUND') {
				// Search for similar organizations
				try {
					const searchResponse = await fetch(
						`https://api.github.com/search/users?q=${encodeURIComponent(currentOrg)}+type:org&per_page=5`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
								Accept: 'application/vnd.github+json',
							},
						}
					)

					let suggestions: OrgSuggestion[] = []
					if (searchResponse.ok) {
						const searchData = await searchResponse.json()
						suggestions = (searchData.items || []).map(
							(item: { login: string; avatar_url: string; description?: string }) => ({
								login: item.login,
								avatar_url: item.avatar_url,
								description: item.description || null,
							})
						)
					}

					set((s) => ({
						isLoading: { ...s.isLoading, info: false },
						error: `Organization "${currentOrg}" not found`,
						notFound: true,
						suggestions,
					}))
				} catch {
					set((s) => ({
						isLoading: { ...s.isLoading, info: false },
						error: `Organization "${currentOrg}" not found`,
						notFound: true,
					}))
				}
			} else {
				set((s) => ({
					isLoading: { ...s.isLoading, info: false },
					error: err instanceof Error ? err.message : 'Failed to fetch org info',
				}))
			}
		}
	},

	fetchMembers: async () => {
		const { currentOrg } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, members: true } }))
		try {
			const token = await useAuthStore.getState().getToken()
			if (!token) throw new Error('Not authenticated')

			const members = await cachedGitHubFetch<Member[]>(
				`members:${currentOrg}`,
				() => fetchAllPages<Member>(`/orgs/${currentOrg}/members`, token, {}, 10)
			)

			set((s) => ({
				orgData: { ...s.orgData, members },
				isLoading: { ...s.isLoading, members: false },
			}))
		} catch {
			set((s) => ({ isLoading: { ...s.isLoading, members: false } }))
		}
	},

	fetchTeams: async () => {
		const { currentOrg } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, teams: true } }))
		try {
			const token = await useAuthStore.getState().getToken()
			if (!token) throw new Error('Not authenticated')

			const teams = await cachedGitHubFetch<Team[]>(
				`teams:${currentOrg}`,
				() => fetchAllPages<Team>(`/orgs/${currentOrg}/teams`, token, {}, 10)
			)

			set((s) => ({
				orgData: { ...s.orgData, teams },
				isLoading: { ...s.isLoading, teams: false },
			}))
		} catch {
			set((s) => ({ isLoading: { ...s.isLoading, teams: false } }))
		}
	},

	fetchRepos: async () => {
		const { currentOrg } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, repos: true } }))
		try {
			const token = await useAuthStore.getState().getToken()
			if (!token) throw new Error('Not authenticated')

			const repos = await cachedGitHubFetch<Repository[]>(
				`repos:${currentOrg}`,
				() =>
					fetchAllPages<Repository>(
						`/orgs/${currentOrg}/repos`,
						token,
						{ type: 'all', sort: 'pushed' },
						10
					)
			)

			set((s) => ({
				orgData: { ...s.orgData, repos },
				isLoading: { ...s.isLoading, repos: false },
			}))
		} catch {
			set((s) => ({ isLoading: { ...s.isLoading, repos: false } }))
		}
	},

	fetchCommitStats: async () => {
		const { currentOrg, orgData, timeframe } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, commits: true } }))

		try {
			const token = await useAuthStore.getState().getToken()
			if (!token) throw new Error('Not authenticated')

			// Get repos first if not loaded
			let repos = orgData.repos
			if (repos.length === 0) {
				repos = await cachedGitHubFetch<Repository[]>(
					`repos:${currentOrg}`,
					() =>
						fetchAllPages<Repository>(
							`/orgs/${currentOrg}/repos`,
							token,
							{ type: 'all', sort: 'pushed' },
							10
						)
				)
				set((s) => ({ orgData: { ...s.orgData, repos } }))
			}

			const commitsByAuthor = new Map<string, number>()
			const since = getDateSince(timeframe)

			// Process repos in parallel batches using core's batchProcess
			await batchProcess(
				repos,
				async (repo) => {
					try {
						const commits = await fetchAllPages<{ author?: { login: string } }>(
							`/repos/${repo.full_name}/commits`,
							token,
							{ since },
							3 // Limit to 3 pages = 300 commits per repo
						)
						for (const commit of commits) {
							if (commit.author?.login) {
								const current = commitsByAuthor.get(commit.author.login) ?? 0
								commitsByAuthor.set(commit.author.login, current + 1)
							}
						}
					} catch {
						// Skip repos we can't access
					}
				},
				{ concurrency: 10 }
			)

			const allStats = Array.from(commitsByAuthor.entries())
				.map(([author, count]) => ({ author, count }))
				.sort((a, b) => b.count - a.count)

			// Calculate total from ALL contributors
			const totalCommits = allStats.reduce((sum, s) => sum + s.count, 0)

			// Keep top 10 for display
			const commitStats: CommitStats[] = allStats.slice(0, 10)

			set((s) => ({
				orgData: { ...s.orgData, commitStats, totalCommits },
				isLoading: { ...s.isLoading, commits: false },
			}))
		} catch {
			set((s) => ({ isLoading: { ...s.isLoading, commits: false } }))
		}
	},

	fetchPRStats: async () => {
		const { currentOrg, orgData, timeframe } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, prs: true } }))

		try {
			const token = await useAuthStore.getState().getToken()
			if (!token) throw new Error('Not authenticated')

			let repos = orgData.repos
			if (repos.length === 0) {
				repos = await cachedGitHubFetch<Repository[]>(
					`repos:${currentOrg}`,
					() =>
						fetchAllPages<Repository>(
							`/orgs/${currentOrg}/repos`,
							token,
							{ type: 'all', sort: 'pushed' },
							10
						)
				)
				set((s) => ({ orgData: { ...s.orgData, repos } }))
			}

			const prsByAuthor = new Map<string, { count: number; merged: number }>()
			let totalPRs = 0

			const since = getDateSince(timeframe)
			const sinceDate = new Date(since)

			// Process repos in parallel batches
			await batchProcess(
				repos,
				async (repo) => {
					try {
						const prs = await fetchAllPages<{
							user?: { login: string }
							merged_at: string | null
							created_at: string
						}>(
							`/repos/${repo.full_name}/pulls`,
							token,
							{ state: 'all', sort: 'created', direction: 'desc' },
							3
						)

						for (const pr of prs) {
							if (new Date(pr.created_at) < sinceDate) continue
							totalPRs++
							if (pr.user?.login) {
								const current = prsByAuthor.get(pr.user.login) ?? { count: 0, merged: 0 }
								current.count++
								if (pr.merged_at) current.merged++
								prsByAuthor.set(pr.user.login, current)
							}
						}
					} catch {
						// Skip repos we can't access
					}
				},
				{ concurrency: 10 }
			)

			const prStats: PRStats[] = Array.from(prsByAuthor.entries())
				.map(([author, stats]) => ({ author, count: stats.count, merged: stats.merged }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10)

			set((s) => ({
				orgData: { ...s.orgData, prStats, totalPRs },
				isLoading: { ...s.isLoading, prs: false },
			}))
		} catch {
			set((s) => ({ isLoading: { ...s.isLoading, prs: false } }))
		}
	},

	fetchIssueStats: async () => {
		const { currentOrg, orgData, timeframe } = get()
		if (!currentOrg) return

		set((s) => ({ isLoading: { ...s.isLoading, issues: true } }))

		try {
			const token = await useAuthStore.getState().getToken()
			if (!token) throw new Error('Not authenticated')

			let repos = orgData.repos
			if (repos.length === 0) {
				repos = await cachedGitHubFetch<Repository[]>(
					`repos:${currentOrg}`,
					() =>
						fetchAllPages<Repository>(
							`/orgs/${currentOrg}/repos`,
							token,
							{ type: 'all', sort: 'pushed' },
							10
						)
				)
				set((s) => ({ orgData: { ...s.orgData, repos } }))
			}

			const issuesByAuthor = new Map<string, { opened: number; closed: number }>()
			let totalIssues = 0

			const since = getDateSince(timeframe)
			const sinceDate = new Date(since)

			// Process repos in parallel batches
			await batchProcess(
				repos,
				async (repo) => {
					try {
						const issues = await fetchAllPages<{
							user?: { login: string }
							state: string
							created_at: string
							pull_request?: unknown
						}>(
							`/repos/${repo.full_name}/issues`,
							token,
							{ state: 'all', since },
							3
						)

						for (const issue of issues) {
							// Skip pull requests (they show up in issues endpoint too)
							if (issue.pull_request) continue
							if (new Date(issue.created_at) < sinceDate) continue
							totalIssues++
							if (issue.user?.login) {
								const current = issuesByAuthor.get(issue.user.login) ?? {
									opened: 0,
									closed: 0,
								}
								current.opened++
								if (issue.state === 'closed') current.closed++
								issuesByAuthor.set(issue.user.login, current)
							}
						}
					} catch {
						// Skip repos we can't access
					}
				},
				{ concurrency: 10 }
			)

			const issueStats: IssueStats[] = Array.from(issuesByAuthor.entries())
				.map(([author, stats]) => ({ author, opened: stats.opened, closed: stats.closed }))
				.sort((a, b) => b.opened - a.opened)
				.slice(0, 10)

			set((s) => ({
				orgData: { ...s.orgData, issueStats, totalIssues },
				isLoading: { ...s.isLoading, issues: false },
			}))
		} catch {
			set((s) => ({ isLoading: { ...s.isLoading, issues: false } }))
		}
	},

	fetchAll: async () => {
		const { currentOrg, fetchOrgInfo, fetchMembers, fetchTeams, fetchRepos } = get()
		if (!currentOrg) return

		// Clear cached data flag when fetching fresh data
		set({ isUsingCachedData: false, cacheAge: null })

		// Phase 1: Fetch org info, members, teams, and repos in parallel
		// Repos are needed by all stats functions, so fetch them first
		await Promise.all([fetchOrgInfo(), fetchMembers(), fetchTeams(), fetchRepos()])

		// Phase 2: Now fetch all stats in parallel (they'll use cached repos)
		const { fetchCommitStats, fetchPRStats, fetchIssueStats } = get()
		await Promise.all([fetchCommitStats(), fetchPRStats(), fetchIssueStats()])

		// Save to offline cache after successful fetch
		const { orgData, notFound, error } = get()
		if (!notFound && !error && orgData.info) {
			saveToOfflineCache(currentOrg, orgData)
		}
	},

	// Clear cache for current org (useful for manual refresh)
	clearCache: () => {
		cache.clear()
	},
}))
