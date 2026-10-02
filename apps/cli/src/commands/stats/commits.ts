import { type CommitActivity, formatDateRange, type OutputFormat } from '@specto/core'
import pc from 'picocolors'
import { github } from '../../lib/github'
import { startSpinner, withSpinner } from '../../lib/ui/spinner'
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

export async function getCommitStats(options: CommitStatsOptions): Promise<CommitActivity> {
	const { org, since, until, membersOnly, includeBots } = options
	const gh = await github()

	const authors = membersOnly
		? new Set(
				(
					await withSpinner('Fetching organization members...', () => gh.listOrgMembers(org), {
						successText: 'Members fetched',
					})
				).map((m) => m.login)
			)
		: undefined

	const spinner = startSpinner('Counting commits...')
	try {
		const activity = await gh.getCommitActivity(org, {
			since,
			until,
			includeBots,
			authors,
			onProgress: (repos) => {
				spinner.text = `Counting commits... ${pc.dim(`${repos} active repositories`)}`
			},
		})
		spinner.succeed(`Scanned ${activity.repositories} repositories with recent pushes`)
		return activity
	} catch (error) {
		spinner.fail(pc.red('Failed'))
		throw error
	}
}

export async function runCommitStats(options: CommitStatsOptions): Promise<void> {
	const { org, since, until, output, top } = options

	console.log('')
	console.log(pc.bold(`Commit Statistics for ${pc.cyan(org)}`))
	console.log(pc.dim(formatDateRange(since, until)))
	console.log('')

	const activity = await getCommitStats(options)
	const stats = activity.byAuthor

	if (stats.length === 0) {
		console.log(pc.yellow('No commits found in the specified date range'))
		return
	}

	const displayStats = top ? stats.slice(0, top) : stats
	const totalCommits = activity.attributed

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
	if (activity.total > totalCommits) {
		console.log(
			pc.dim(
				`${activity.total} commits on default branches overall; the rest are from bots, non-members, or authors without a GitHub account`
			)
		)
	}
	if (!activity.complete) {
		console.log(pc.yellow('Some very active repositories were only partially counted per author'))
	}
	if (top && stats.length > top) {
		console.log(pc.dim(`Showing top ${top} of ${stats.length} contributors`))
	}
}
