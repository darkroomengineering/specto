import type { OutputFormat } from '@specto/core'
import pc from 'picocolors'
import { github } from '../../lib/github'
import { withSpinner } from '../../lib/ui/spinner'
import { printTable } from '../../lib/ui/table'

interface TeamsOptions {
	org: string
	output: OutputFormat
}

export async function runOrgTeams(options: TeamsOptions): Promise<void> {
	const { org, output } = options

	const teams = await withSpinner(
		`Fetching teams...`,
		async () => (await (await github()).getOrgOverview(org)).teams,
		{
			successText: 'Teams fetched',
		}
	)

	if (teams.length === 0) {
		console.log(pc.yellow('No teams found'))
		return
	}

	console.log('')
	console.log(pc.bold(`Teams in ${pc.cyan(org)}`))
	console.log(pc.dim(`${teams.length} teams total`))

	const displayTeams = teams.map((t) => ({
		name: t.name,
		slug: t.slug,
		privacy: t.privacy.toLowerCase(),
		members: t.memberCount,
		repos: t.repositoryCount,
		parent: t.parentName ?? '-',
	}))

	printTable({
		columns: [
			{
				key: 'name',
				header: 'Name',
				color: (v) => pc.cyan(String(v)),
			},
			{
				key: 'slug',
				header: 'Slug',
				color: (v) => pc.dim(String(v)),
			},
			{
				key: 'privacy',
				header: 'Privacy',
				color: (v) => (v === 'secret' ? pc.yellow(String(v)) : pc.green(String(v))),
			},
			{
				key: 'members',
				header: 'Members',
				align: 'right',
			},
			{
				key: 'repos',
				header: 'Repos',
				align: 'right',
			},
			{
				key: 'parent',
				header: 'Parent',
				color: (v) => (v === '-' ? pc.dim(String(v)) : String(v)),
			},
		],
		rows: displayTeams,
		format: output,
	})
}
