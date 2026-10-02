import { getDefaultDateRange, type OutputFormat } from '@specto/core'
import { Command } from 'commander'
import { wrapCommand } from '../../lib/utils/errors'
import { runCommitStats } from './commits'

export const statsCommand = new Command('stats').description('Statistics and metrics commands')

statsCommand
	.command('commits')
	.description('Show commit statistics per member')
	.argument('[org]', 'Organization name')
	.option('-s, --since <date>', 'Start date (ISO format or YYYY-MM-DD)')
	.option('-u, --until <date>', 'End date (ISO format or YYYY-MM-DD)')
	.option('--no-members-only', 'Include commits from non-members')
	.option('--include-bots', 'Include commits from bot accounts')
	.option('-o, --output <format>', 'Output format (table, json, csv)', 'table')
	.option('-t, --top <n>', 'Show only top N contributors', Number.parseInt)
	.action(
		wrapCommand(
			async (
				org: string | undefined,
				options: {
					since?: string
					until?: string
					membersOnly: boolean
					includeBots: boolean
					output: string
					top?: number
				}
			) => {
				if (!org) {
					console.error('Organization name is required. Usage: pondus stats commits <org>')
					process.exit(1)
				}

				const defaults = getDefaultDateRange()
				const since = options.since
					? options.since.includes('T')
						? options.since
						: `${options.since}T00:00:00Z`
					: defaults.since
				const until = options.until
					? options.until.includes('T')
						? options.until
						: `${options.until}T23:59:59Z`
					: defaults.until

				await runCommitStats({
					org,
					since,
					until,
					membersOnly: options.membersOnly,
					includeBots: options.includeBots ?? false,
					output: options.output as OutputFormat,
					top: options.top,
				})
			}
		)
	)

// Default command (just run commits)
statsCommand.action(() => {
	statsCommand.commands.find((c) => c.name() === 'commits')?.help()
})
