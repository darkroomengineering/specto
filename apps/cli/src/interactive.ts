import * as p from '@clack/prompts'
import { getAuthStatus } from '@specto/core/node'
import pc from 'picocolors'
import { runOrgActions } from './commands/org/actions'
import { runOrgInfo } from './commands/org/info'
import { runOrgMembers } from './commands/org/members'
import { runOrgTeams } from './commands/org/teams'
import { runOrgWebhooks } from './commands/org/webhooks'
import { runCommitStats } from './commands/stats/commits'
import { selectDateRange, selectOrganization, selectOutputFormat } from './lib/ui/prompts'
import { handleError } from './lib/utils/errors'

type Category = 'stats' | 'org' | 'config' | 'exit'
type StatsAction = 'commits'
type OrgAction = 'info' | 'members' | 'teams' | 'webhooks' | 'actions'

export async function runInteractive(): Promise<void> {
	try {
		p.intro(pc.bgCyan(pc.black(' specto ')))

		// Check auth first
		const authStatus = await getAuthStatus()
		if (!authStatus.valid) {
			p.note(
				`Not authenticated. Run ${pc.cyan('specto config auth')} for details.\n` +
					`Or authenticate with ${pc.cyan('gh auth login')}`,
				'Authentication'
			)
			process.exit(1)
		}

		console.log(pc.dim(`Authenticated as ${authStatus.username}\n`))

		// Main loop
		while (true) {
			const category = (await p.select({
				message: 'What would you like to do?',
				options: [
					{ value: 'stats', label: '📊 Statistics - Commit metrics and activity' },
					{ value: 'org', label: '🏢 Organization - Settings and info' },
					{ value: 'config', label: '⚙️  Config - Authentication status' },
					{ value: 'exit', label: '👋 Exit' },
				],
			})) as Category | symbol

			if (p.isCancel(category) || category === 'exit') {
				p.outro('Goodbye!')
				process.exit(0)
			}

			await handleCategory(category as Category)
		}
	} catch (error) {
		handleError(error)
	}
}

async function handleCategory(category: Category): Promise<void> {
	switch (category) {
		case 'stats':
			await handleStats()
			break
		case 'org':
			await handleOrg()
			break
		case 'config':
			await handleConfig()
			break
	}
}

async function handleStats(): Promise<void> {
	const action = (await p.select({
		message: 'Select statistics type',
		options: [{ value: 'commits', label: 'Commit statistics - Commits per member' }],
	})) as StatsAction | symbol

	if (p.isCancel(action)) return

	const org = await selectOrganization()
	const { since, until } = await selectDateRange()
	const output = await selectOutputFormat()

	const membersOnly = await p.confirm({
		message: 'Only include organization members?',
		initialValue: true,
	})

	if (p.isCancel(membersOnly)) return

	await runCommitStats({
		org,
		since,
		until,
		membersOnly,
		includeBots: false,
		output,
	})

	await pause()
}

async function handleOrg(): Promise<void> {
	const action = (await p.select({
		message: 'Select organization info type',
		options: [
			{ value: 'info', label: 'Organization info - General settings' },
			{ value: 'members', label: 'Members - List all members' },
			{ value: 'teams', label: 'Teams - List all teams' },
			{ value: 'webhooks', label: 'Webhooks - Organization webhooks' },
			{ value: 'actions', label: 'Actions - GitHub Actions settings' },
		],
	})) as OrgAction | symbol

	if (p.isCancel(action)) return

	const org = await selectOrganization()
	const output = await selectOutputFormat()

	switch (action) {
		case 'info':
			await runOrgInfo({ org, output })
			break
		case 'members':
			await runOrgMembers({ org, output })
			break
		case 'teams':
			await runOrgTeams({ org, output })
			break
		case 'webhooks':
			await runOrgWebhooks({ org, output })
			break
		case 'actions': {
			const showRunners = await p.confirm({
				message: 'Show self-hosted runners?',
				initialValue: false,
			})
			const showSecrets = await p.confirm({
				message: 'Show organization secrets?',
				initialValue: false,
			})

			if (p.isCancel(showRunners) || p.isCancel(showSecrets)) return

			await runOrgActions({
				org,
				runners: showRunners,
				secrets: showSecrets,
				output,
			})
			break
		}
	}

	await pause()
}

async function handleConfig(): Promise<void> {
	const authStatus = await getAuthStatus()

	console.log('')
	console.log(pc.bold('Authentication Status'))
	console.log('')
	console.log(`  Method:   ${authStatus.method}`)
	console.log(`  Valid:    ${authStatus.valid ? pc.green('Yes') : pc.red('No')}`)
	if (authStatus.username) {
		console.log(`  User:     ${pc.cyan(authStatus.username)}`)
	}
	if (authStatus.scopes && authStatus.scopes.length > 0) {
		console.log(`  Scopes:   ${pc.dim(authStatus.scopes.join(', '))}`)
	}
	console.log('')

	await pause()
}

async function pause(): Promise<void> {
	await p.confirm({
		message: 'Press Enter to continue...',
		initialValue: true,
	})
}
