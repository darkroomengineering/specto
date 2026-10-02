import {
	type CommitActivity,
	createGitHubClient,
	type GitHubClient,
	GitHubError,
	type IssueActivity,
	type OrgOverview,
	type OrgSuggestion,
	type PullRequestActivity,
	RateLimitError,
} from '@specto/core'
import { create } from 'zustand'
import { useAuthStore } from './auth'

export type Timeframe = '7d' | '30d' | '90d' | 'ytd' | 'all'
export type MetricType = 'commits' | 'prs' | 'issues' | 'reviews'

interface Activity {
	commits: CommitActivity
	prs: PullRequestActivity
	issues: IssueActivity
}

interface LoadingState {
	overview: boolean
	commits: boolean
	prs: boolean
	issues: boolean
}

const IDLE: LoadingState = { overview: false, commits: false, prs: false, issues: false }
const BUSY: LoadingState = { overview: true, commits: true, prs: true, issues: true }

// In-memory per-session cache so switching back to an org or timeframe does not refetch
const MEMORY_TTL = 5 * 60 * 1000
const memoryCache = new Map<string, { at: number; value: unknown }>()

function memoryGet<T>(key: string): T | undefined {
	const hit = memoryCache.get(key)
	if (!hit) return undefined
	if (Date.now() - hit.at > MEMORY_TTL) {
		memoryCache.delete(key)
		return undefined
	}
	return hit.value as T
}

function memorySet(key: string, value: unknown): void {
	memoryCache.set(key, { at: Date.now(), value })
}

// Persistent localStorage cache for offline support
const OFFLINE_CACHE_PREFIX = 'specto:cache:org:'

interface OfflineData {
	overview: OrgOverview
	timeframe: Timeframe
	activity: Activity | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function isActivity(value: unknown): value is Activity {
	if (!isRecord(value)) return false
	const { commits, prs, issues } = value
	return (
		isRecord(commits) &&
		Array.isArray(commits['byAuthor']) &&
		typeof commits['total'] === 'number' &&
		isRecord(prs) &&
		Array.isArray(prs['byAuthor']) &&
		typeof prs['total'] === 'number' &&
		isRecord(issues) &&
		Array.isArray(issues['byAuthor']) &&
		typeof issues['total'] === 'number'
	)
}

function isOfflineData(value: unknown): value is OfflineData {
	if (!isRecord(value)) return false
	const { overview, timeframe, activity } = value
	return (
		isRecord(overview) &&
		typeof overview['avatarUrl'] === 'string' &&
		typeof overview['repositoryCount'] === 'number' &&
		typeof overview['memberCount'] === 'number' &&
		Array.isArray(overview['teams']) &&
		typeof timeframe === 'string' &&
		(activity === null || isActivity(activity))
	)
}

function saveToOfflineCache(org: string, data: OfflineData): void {
	try {
		localStorage.setItem(
			`${OFFLINE_CACHE_PREFIX}${org}`,
			JSON.stringify({ data, timestamp: Date.now() })
		)
	} catch {
		// localStorage might be full or unavailable
	}
}

// Entries written by older versions have a different shape and are discarded
function loadFromOfflineCache(org: string): { data: OfflineData; timestamp: number } | null {
	try {
		const stored = localStorage.getItem(`${OFFLINE_CACHE_PREFIX}${org}`)
		if (!stored) return null
		const parsed: unknown = JSON.parse(stored)
		if (
			isRecord(parsed) &&
			typeof parsed['timestamp'] === 'number' &&
			isOfflineData(parsed['data'])
		) {
			return { data: parsed['data'], timestamp: parsed['timestamp'] }
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
	return `${Math.floor(hours / 24)}d ago`
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

let client: { token: string; gh: GitHubClient } | null = null

async function getClient(): Promise<GitHubClient> {
	const token = await useAuthStore.getState().getToken()
	if (!token) throw new Error('Not authenticated')
	if (client?.token !== token) client = { token, gh: createGitHubClient({ token }) }
	return client.gh
}

function describeError(err: unknown, fallback: string): string {
	if (err instanceof RateLimitError) {
		return `GitHub rate limit reached. Resets at ${err.resetAt.toLocaleTimeString()}.`
	}
	if (err instanceof GitHubError && err.status === 401) {
		// The cached token was revoked or expired; the next call re-reads it from gh
		useAuthStore.setState({ token: null })
		return 'GitHub rejected the token. Run: gh auth login'
	}
	return err instanceof Error ? err.message : fallback
}

interface GitHubState {
	currentOrg: string | null
	overview: OrgOverview | null
	commits: CommitActivity | null
	prs: PullRequestActivity | null
	issues: IssueActivity | null
	timeframe: Timeframe
	metricType: MetricType
	isLoading: LoadingState
	error: string | null
	activityError: string | null
	notFound: boolean
	suggestions: OrgSuggestion[]
	cacheAge: string | null // For showing "Last updated X ago" when using cached data
	isUsingCachedData: boolean
	setOrg: (org: string) => void
	setTimeframe: (tf: Timeframe) => void
	setMetricType: (mt: MetricType) => void
	fetchOverview: () => Promise<void>
	fetchActivity: () => Promise<void>
	fetchAll: () => Promise<void>
	clearCache: () => void
}

const EMPTY_ORG = {
	overview: null,
	commits: null,
	prs: null,
	issues: null,
	error: null,
	activityError: null,
	notFound: false,
	suggestions: [] as OrgSuggestion[],
	cacheAge: null,
	isUsingCachedData: false,
} as const

export const useGitHubStore = create<GitHubState>((set, get) => ({
	currentOrg: null,
	...EMPTY_ORG,
	timeframe: 'ytd',
	metricType: 'commits',
	isLoading: IDLE,

	setOrg: (org) => {
		const offline = loadFromOfflineCache(org)
		const activity =
			offline?.data.activity && offline.data.timeframe === get().timeframe
				? offline.data.activity
				: null

		set({
			...EMPTY_ORG,
			currentOrg: org,
			overview: offline?.data.overview ?? null,
			commits: activity?.commits ?? null,
			prs: activity?.prs ?? null,
			issues: activity?.issues ?? null,
			cacheAge: offline ? formatCacheAge(offline.timestamp) : null,
			isUsingCachedData: !!offline,
			isLoading: IDLE,
		})
	},

	setTimeframe: (timeframe) => {
		set({ timeframe })
		void get().fetchActivity()
	},

	setMetricType: (metricType) => {
		set({ metricType })
	},

	fetchOverview: async () => {
		const org = get().currentOrg
		if (!org) return

		const cached = memoryGet<OrgOverview>(`overview:${org}`)
		if (cached) {
			set((s) => ({
				overview: cached,
				isLoading: { ...s.isLoading, overview: false },
				error: null,
				notFound: false,
				suggestions: [],
			}))
			return
		}

		set((s) => ({
			isLoading: { ...s.isLoading, overview: true },
			error: null,
			notFound: false,
			suggestions: [],
		}))

		try {
			const gh = await getClient()
			const overview = await gh.getOrgOverview(org)
			memorySet(`overview:${org}`, overview)
			if (get().currentOrg !== org) return
			set((s) => ({ overview, isLoading: { ...s.isLoading, overview: false } }))
		} catch (err) {
			if (get().currentOrg !== org) return
			if (err instanceof GitHubError && err.status === 404) {
				const suggestions = await getClient()
					.then((gh) => gh.searchOrgs(org))
					.catch((): OrgSuggestion[] => [])
				if (get().currentOrg !== org) return
				set((s) => ({
					isLoading: { ...s.isLoading, overview: false },
					error: `Organization "${org}" not found`,
					notFound: true,
					suggestions,
				}))
				return
			}
			set((s) => ({
				isLoading: { ...s.isLoading, overview: false },
				error: describeError(err, 'Failed to fetch org info'),
			}))
		}
	},

	fetchActivity: async () => {
		const { currentOrg: org, timeframe } = get()
		if (!org) return

		const key = `activity:${org}:${timeframe}`
		const cached = memoryGet<Activity>(key)
		if (cached) {
			set({
				...cached,
				activityError: null,
				isLoading: { ...get().isLoading, commits: false, prs: false, issues: false },
			})
			return
		}

		set((s) => ({ isLoading: { ...s.isLoading, commits: true, prs: true, issues: true } }))

		try {
			const gh = await getClient()
			const since = getDateSince(timeframe)
			const [commits, prs, issues] = await Promise.allSettled([
				gh.getCommitActivity(org, { since }),
				gh.getPullRequestActivity(org, { since }),
				gh.getIssueActivity(org, { since }),
			])

			// Ignore results for an org or timeframe the user has already left
			if (get().currentOrg !== org || get().timeframe !== timeframe) return

			if (
				commits.status === 'fulfilled' &&
				prs.status === 'fulfilled' &&
				issues.status === 'fulfilled'
			) {
				memorySet(key, { commits: commits.value, prs: prs.value, issues: issues.value })
			}

			const failed = [commits, prs, issues].find((r) => r.status === 'rejected')
			set((s) => ({
				commits: commits.status === 'fulfilled' ? commits.value : null,
				prs: prs.status === 'fulfilled' ? prs.value : null,
				issues: issues.status === 'fulfilled' ? issues.value : null,
				isLoading: { ...s.isLoading, commits: false, prs: false, issues: false },
				activityError: failed ? describeError(failed.reason, 'Failed to fetch activity') : null,
			}))
		} catch (err) {
			if (get().currentOrg !== org || get().timeframe !== timeframe) return
			set((s) => ({
				isLoading: { ...s.isLoading, commits: false, prs: false, issues: false },
				activityError: describeError(err, 'Failed to fetch activity'),
			}))
		}
	},

	fetchAll: async () => {
		const org = get().currentOrg
		if (!org) return

		set({ isUsingCachedData: false, cacheAge: null, isLoading: BUSY })
		await Promise.all([get().fetchOverview(), get().fetchActivity()])

		const { currentOrg, overview, commits, prs, issues, timeframe, error, notFound } = get()
		if (currentOrg === org && overview && !error && !notFound) {
			saveToOfflineCache(org, {
				overview,
				timeframe,
				activity: commits && prs && issues ? { commits, prs, issues } : null,
			})
		}
	},

	clearCache: () => {
		memoryCache.clear()
	},
}))
