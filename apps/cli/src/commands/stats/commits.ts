import {
	type CommitStats,
	formatDateRange,
	getOrgMembersList,
	getOrgReposList,
	getRepoCommits,
	type OutputFormat,
	type Repository,
} from '@specto/core'
import pc from 'picocolors'
import { createProgressSpinner, withSpinner } from '../../lib/ui/spinner'
import { printTable } from '../../lib/ui/table'

interface CommitStatsOptions {
	org: string
	since: string
	until: string
	membersOnly: boolean
	includeBots: boolean
	output: OutputFormat
	top?: number
}

const CONCURRENCY = 10

async function processReposInBatches<T, R>(
	items: T[],
	processor: (item: T) => Promise<R>,
	concurrency: number
): Promise<R[]> {
	const results: R[] = []

	for (let i = 0; i < items.length; i += concurrency) {
		const batch = items.slice(i, i + concurrency)
		const batchResults = await Promise.all(batch.map(processor))
		results.push(...batchResults)
	}

	return results
}

export async function getCommitStats(options: CommitStatsOptions): Promise<CommitStats[]> {
	const { org, since, until, membersOnly, includeBots } = options

	// Step 1: Get org members (for filtering)
	let memberLogins: Set<string> | null = null
	if (membersOnly) {
		const members = await withSpinner(
			'Fetching organization members...',
			() => getOrgMembersList(org),
			{ successText: 'Members fetched' }
		)
		memberLogins = new Set(members.map((m) => m.login))
	}

	// Step 2: Get all repos
	const repos = await withSpinner('Fetching repositories...', () => getOrgReposList(org), {
		successText: 'Repositories fetched',
	})

	console.log(pc.dim(`Found ${repos.length} repositories\n`))

	// Step 3: Fetch commits from each repo
	const commitsByAuthor = new Map<string, number>()
	const progress = createProgressSpinner(repos.length, 'Processing repositories')

	let processed = 0

	await processReposInBatches(
		repos,
		async (repo: Repository) => {
			try {
				const commits: Array<{ author: string }> = []

				for await (const commit of getRepoCommits(repo.full_name, { since, until })) {
					const authorLogin = commit.author?.login
					if (!authorLogin) continue

					// Filter bots if requested
					if (!includeBots && commit.author?.type === 'Bot') continue

					// Filter to members only if requested
					if (memberLogins && !memberLogins.has(authorLogin)) continue

					commits.push({ author: authorLogin })
				}

				// Count commits per author
				for (const commit of commits) {
					const current = commitsByAuthor.get(commit.author) ?? 0
					commitsByAuthor.set(commit.author, current + 1)
				}
			} catch {
				// Skip repos we can't access (private repos, etc.)
			}

			processed++
			progress.update(processed, repo.name)
		},
		CONCURRENCY
	)

	progress.succeed(`Processed ${repos.length} repositories`)

	// Step 4: Sort and return results
	const stats: CommitStats[] = Array.from(commitsByAuthor.entries())
		.map(([author, count]) => ({ author, count }))
		.sort((a, b) => b.count - a.count)

	return stats
}

export async function runCommitStats(options: CommitStatsOptions): Promise<void> {
	const { org, since, until, output, top } = options

	console.log('')
	console.log(pc.bold(`Commit Statistics for ${pc.cyan(org)}`))
	console.log(pc.dim(formatDateRange(since, until)))
	console.log('')

	const stats = await getCommitStats(options)

	if (stats.length === 0) {
		console.log(pc.yellow('No commits found in the specified date range'))
		return
	}

	const displayStats = top ? stats.slice(0, top) : stats
	const totalCommits = stats.reduce((sum, s) => sum + s.count, 0)

	printTable({
		columns: [
			{
				key: 'count',
				header: 'Commits',
				align: 'right',
				color: (v) => pc.yellow(String(v)),
			},
			{
				key: 'author',
				header: 'Author',
				color: (v) => pc.cyan(String(v)),
			},
			{
				key: (row) => {
					const percent = ((row.count / totalCommits) * 100).toFixed(1)
					return `${percent}%`
				},
				header: 'Share',
				align: 'right',
				color: (v) => pc.dim(String(v)),
			},
		],
		rows: displayStats,
		format: output,
	})

	console.log(pc.dim(`Total: ${totalCommits} commits from ${stats.length} contributors`))
	if (top && stats.length > top) {
		console.log(pc.dim(`Showing top ${top} of ${stats.length} contributors`))
	}
}
