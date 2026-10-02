import type {
	AuthorCount,
	CommitActivity,
	IssueActivity,
	IssueAuthorCount,
	PullRequestActivity,
	PullRequestAuthorCount,
} from '../types'
import type { GraphQL } from './client'

export interface ActivityOptions {
	/** ISO timestamp, inclusive */
	since: string
	/** ISO timestamp, inclusive; open-ended when omitted */
	until?: string
	/** Count bot accounts (dependabot, renovate, ...) in per-author results */
	includeBots?: boolean
	/** Only count these logins in per-author results */
	authors?: ReadonlySet<string>
}

export interface CommitActivityOptions extends ActivityOptions {
	/** Pages of 100 commits fetched per repo for per-author attribution */
	maxPagesPerRepo?: number
	onProgress?: (scannedRepos: number) => void
}

const REPOS_PER_PAGE = 25
const REPOS_PER_FOLLOW_UP = 10
const DEFAULT_MAX_PAGES_PER_REPO = 10
// SHORTCUT: GitHub search returns at most 1,000 results per query.
// ceiling: per-author PR/issue breakdowns cover the newest 1,000 items; totals stay exact.
// upgrade: split the date range into windows under 1,000 results when orgs hit the cap.
const MAX_SEARCH_PAGES = 10

interface History {
	totalCount: number
	pageInfo: { hasNextPage: boolean; endCursor: string | null }
	nodes: Array<{ author: { user: { login: string } | null } | null }>
}

interface BranchRef {
	target: { history?: History } | null
}

const HISTORY_FIELDS = `
	totalCount
	pageInfo { hasNextPage endCursor }
	nodes { author { user { login } } }
`

const REPOS_QUERY = `
	query ($login: String!, $cursor: String, $since: GitTimestamp!, $until: GitTimestamp) {
		organization(login: $login) {
			repositories(first: ${REPOS_PER_PAGE}, after: $cursor, orderBy: { field: PUSHED_AT, direction: DESC }) {
				pageInfo { hasNextPage endCursor }
				nodes {
					owner { login }
					name
					pushedAt
					defaultBranchRef {
						target {
							... on Commit {
								history(first: 100, since: $since, until: $until) { ${HISTORY_FIELDS} }
							}
						}
					}
				}
			}
		}
	}
`

interface ReposResponse {
	organization: {
		repositories: {
			pageInfo: { hasNextPage: boolean; endCursor: string | null }
			nodes: Array<{
				owner: { login: string }
				name: string
				pushedAt: string | null
				defaultBranchRef: BranchRef | null
			}>
		}
	}
}

interface PendingRepo {
	owner: string
	name: string
	cursor: string
	pagesLeft: number
}

function isBot(login: string, typename?: string): boolean {
	return typename === 'Bot' || login.endsWith('[bot]')
}

function createFilter({ includeBots = false, authors }: ActivityOptions) {
	return (login: string, typename?: string) =>
		(includeBots || !isBot(login, typename)) && (!authors || authors.has(login))
}

/** Batch follow-up pages for several repos into one aliased query */
function followUpQuery(count: number): string {
	const vars = Array.from(
		{ length: count },
		(_, i) => `$o${i}: String!, $n${i}: String!, $c${i}: String!`
	)
	const fields = Array.from(
		{ length: count },
		(_, i) => `
		r${i}: repository(owner: $o${i}, name: $n${i}) {
			defaultBranchRef {
				target {
					... on Commit {
						history(first: 100, after: $c${i}, since: $since, until: $until) { ${HISTORY_FIELDS} }
					}
				}
			}
		}`
	)
	return `query ($since: GitTimestamp!, $until: GitTimestamp, ${vars.join(', ')}) {${fields.join('')}\n}`
}

/**
 * Commits on each repo's default branch in the date range.
 *
 * Totals are exact (summed from `history.totalCount`). Per-author counts page
 * through up to `maxPagesPerRepo` x 100 commits per repo; `complete` is false
 * when any repo had more than that.
 */
export async function getCommitActivity(
	graphql: GraphQL,
	login: string,
	options: CommitActivityOptions
): Promise<CommitActivity> {
	const { since, until, maxPagesPerRepo = DEFAULT_MAX_PAGES_PER_REPO, onProgress } = options
	const accept = createFilter(options)
	const counts = new Map<string, number>()
	const pending: PendingRepo[] = []
	let total = 0
	let repositories = 0
	let complete = true

	const tally = (history: History | undefined) => {
		for (const node of history?.nodes ?? []) {
			const author = node.author?.user?.login
			if (author && accept(author)) counts.set(author, (counts.get(author) ?? 0) + 1)
		}
	}

	const queue = (owner: string, name: string, history: History | undefined, pagesLeft: number) => {
		if (!history?.pageInfo.hasNextPage || !history.pageInfo.endCursor) return
		if (pagesLeft > 0) pending.push({ owner, name, cursor: history.pageInfo.endCursor, pagesLeft })
		else complete = false
	}

	// Repos come newest-push first, so paging stops at the first repo untouched since `since`.
	const sinceMs = Date.parse(since)
	let cursor: string | null = null
	let more = true
	while (more) {
		const data: ReposResponse = await graphql<ReposResponse>(REPOS_QUERY, {
			login,
			cursor,
			since,
			until,
		})
		const { nodes, pageInfo } = data.organization.repositories
		for (const repo of nodes) {
			if (!repo.pushedAt) continue
			if (Date.parse(repo.pushedAt) < sinceMs) {
				more = false
				break
			}
			const history = repo.defaultBranchRef?.target?.history
			repositories++
			total += history?.totalCount ?? 0
			tally(history)
			queue(repo.owner.login, repo.name, history, maxPagesPerRepo - 1)
		}
		onProgress?.(repositories)
		more = more && pageInfo.hasNextPage
		cursor = pageInfo.endCursor
	}

	while (pending.length > 0) {
		const batch = pending.splice(0, REPOS_PER_FOLLOW_UP)
		const variables: Record<string, unknown> = { since, until }
		batch.forEach((repo, i) => {
			variables[`o${i}`] = repo.owner
			variables[`n${i}`] = repo.name
			variables[`c${i}`] = repo.cursor
		})
		const data = await graphql<Record<string, { defaultBranchRef: BranchRef | null } | null>>(
			followUpQuery(batch.length),
			variables
		)
		batch.forEach((repo, i) => {
			const history = data[`r${i}`]?.defaultBranchRef?.target?.history
			tally(history)
			queue(repo.owner, repo.name, history, repo.pagesLeft - 1)
		})
	}

	const byAuthor: AuthorCount[] = Array.from(counts, ([author, count]) => ({ author, count })).sort(
		(a, b) => b.count - a.count
	)
	return {
		total,
		attributed: byAuthor.reduce((sum, a) => sum + a.count, 0),
		byAuthor,
		repositories,
		complete,
	}
}

interface SearchAuthor {
	author: { login: string; __typename: string } | null
}

interface SearchResponse<N> {
	search: {
		issueCount: number
		pageInfo: { hasNextPage: boolean; endCursor: string | null }
		nodes: Array<N | Record<string, never>>
	}
}

function searchQuery(fragment: string): string {
	return `
		query ($q: String!, $cursor: String) {
			search(query: $q, type: ISSUE, first: 100, after: $cursor) {
				issueCount
				pageInfo { hasNextPage endCursor }
				nodes { ${fragment} }
			}
		}
	`
}

async function searchAll<N extends SearchAuthor>(
	graphql: GraphQL,
	fragment: string,
	q: string
): Promise<{ total: number; nodes: N[]; complete: boolean }> {
	const query = searchQuery(fragment)
	const nodes: N[] = []
	let cursor: string | null = null
	let total = 0
	for (let page = 0; page < MAX_SEARCH_PAGES; page++) {
		const { search }: SearchResponse<N> = await graphql<SearchResponse<N>>(query, { q, cursor })
		total = search.issueCount
		nodes.push(...(search.nodes.filter((n) => 'author' in n) as N[]))
		if (!search.pageInfo.hasNextPage) break
		cursor = search.pageInfo.endCursor
	}
	// Search stops paging at its 1,000-result cap, so compare counts instead of hasNextPage
	return { total, nodes, complete: nodes.length >= total }
}

function searchFilter(login: string, kind: 'pr' | 'issue', { since, until }: ActivityOptions) {
	const created = until ? `${since}..${until}` : `>=${since}`
	return `org:${login} is:${kind} created:${created} sort:created-desc`
}

/** Pull requests opened in the date range. `total` is exact; see MAX_SEARCH_PAGES for per-author. */
export async function getPullRequestActivity(
	graphql: GraphQL,
	login: string,
	options: ActivityOptions
): Promise<PullRequestActivity> {
	const accept = createFilter(options)
	const { total, nodes, complete } = await searchAll<SearchAuthor & { merged: boolean }>(
		graphql,
		'... on PullRequest { author { login __typename } merged }',
		searchFilter(login, 'pr', options)
	)

	const counts = new Map<string, PullRequestAuthorCount>()
	for (const { author, merged } of nodes) {
		if (!author || !accept(author.login, author.__typename)) continue
		const entry = counts.get(author.login) ?? { author: author.login, count: 0, merged: 0 }
		entry.count++
		if (merged) entry.merged++
		counts.set(author.login, entry)
	}
	const byAuthor = [...counts.values()].sort((a, b) => b.count - a.count)
	return { total, sampled: nodes.length, byAuthor, complete }
}

/** Issues opened in the date range. `total` is exact; see MAX_SEARCH_PAGES for per-author. */
export async function getIssueActivity(
	graphql: GraphQL,
	login: string,
	options: ActivityOptions
): Promise<IssueActivity> {
	const accept = createFilter(options)
	const { total, nodes, complete } = await searchAll<SearchAuthor & { state: 'OPEN' | 'CLOSED' }>(
		graphql,
		'... on Issue { author { login __typename } state }',
		searchFilter(login, 'issue', options)
	)

	const counts = new Map<string, IssueAuthorCount>()
	for (const { author, state } of nodes) {
		if (!author || !accept(author.login, author.__typename)) continue
		const entry = counts.get(author.login) ?? { author: author.login, opened: 0, closed: 0 }
		entry.opened++
		if (state === 'CLOSED') entry.closed++
		counts.set(author.login, entry)
	}
	const byAuthor = [...counts.values()].sort((a, b) => b.opened - a.opened)
	return { total, sampled: nodes.length, byAuthor, complete }
}
