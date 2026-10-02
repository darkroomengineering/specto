import { getOrgMembersList, type OutputFormat } from '@specto/core'
import pc from 'picocolors'
import { withSpinner } from '../../lib/ui/spinner'
import { printTable } from '../../lib/ui/table'

interface MembersOptions {
	org: string
	role?: 'admin' | 'member' | 'all'
	output: OutputFormat
}

export async function runOrgMembers(options: MembersOptions): Promise<void> {
	const { org, output, role } = options

	const members = await withSpinner(`Fetching members...`, () => getOrgMembersList(org), {
		successText: 'Members fetched',
	})

	if (members.length === 0) {
		console.log(pc.yellow('No members found'))
		return
	}

	console.log('')
	console.log(pc.bold(`Members of ${pc.cyan(org)}`))
	console.log(pc.dim(`${members.length} members total`))

	const displayMembers = members.map((m) => ({
		login: m.login,
		type: m.type,
		profile: m.html_url,
	}))

	printTable({
		columns: [
			{
				key: 'login',
				header: 'Username',
				color: (v) => pc.cyan(String(v)),
			},
			{
				key: 'type',
				header: 'Type',
				color: (v) => (v === 'User' ? pc.green(String(v)) : pc.yellow(String(v))),
			},
			{
				key: 'profile',
				header: 'Profile URL',
				color: (v) => pc.dim(String(v)),
			},
		],
		rows: displayMembers,
		format: output,
	})
}
