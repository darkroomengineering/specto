import type { OutputFormat } from '@specto/core'
import { Command } from 'commander'
import { wrapCommand } from '../../lib/utils/errors'
import { runOrgActions } from './actions'
import { runOrgInfo } from './info'
import { runOrgMembers } from './members'
import { runOrgTeams } from './teams'
import { runOrgWebhooks } from './webhooks'

export const orgCommand = new Command('org').description('Organization settings and info commands')

orgCommand
	.command('info')
	.description('Show organization information and settings')
	.argument('[org]', 'Organization name')
	.option('-o, --output <format>', 'Output format (table, json)', 'table')
	.action(
		wrapCommand(async (org: string | undefined, options: { output: string }) => {
			if (!org) {
				console.error('Organization name is required. Usage: specto org info <org>')
				process.exit(1)
			}
			await runOrgInfo({ org, output: options.output as OutputFormat })
		})
	)

orgCommand
	.command('members')
	.description('List organization members')
	.argument('[org]', 'Organization name')
	.option('-r, --role <role>', 'Filter by role (admin, member, all)', 'all')
	.option('-o, --output <format>', 'Output format (table, json, csv)', 'table')
	.action(
		wrapCommand(async (org: string | undefined, options: { role: string; output: string }) => {
			if (!org) {
				console.error('Organization name is required. Usage: specto org members <org>')
				process.exit(1)
			}
			await runOrgMembers({
				org,
				role: options.role as 'admin' | 'member' | 'all',
				output: options.output as OutputFormat,
			})
		})
	)

orgCommand
	.command('teams')
	.description('List organization teams')
	.argument('[org]', 'Organization name')
	.option('-o, --output <format>', 'Output format (table, json, csv)', 'table')
	.action(
		wrapCommand(async (org: string | undefined, options: { output: string }) => {
			if (!org) {
				console.error('Organization name is required. Usage: specto org teams <org>')
				process.exit(1)
			}
			await runOrgTeams({ org, output: options.output as OutputFormat })
		})
	)

orgCommand
	.command('webhooks')
	.description('List organization webhooks')
	.argument('[org]', 'Organization name')
	.option('-o, --output <format>', 'Output format (table, json, csv)', 'table')
	.action(
		wrapCommand(async (org: string | undefined, options: { output: string }) => {
			if (!org) {
				console.error('Organization name is required. Usage: specto org webhooks <org>')
				process.exit(1)
			}
			await runOrgWebhooks({ org, output: options.output as OutputFormat })
		})
	)

orgCommand
	.command('actions')
	.description('Show GitHub Actions settings')
	.argument('[org]', 'Organization name')
	.option('--runners', 'Show self-hosted runners')
	.option('--secrets', 'Show organization secrets (names only)')
	.option('-o, --output <format>', 'Output format (table, json)', 'table')
	.action(
		wrapCommand(
			async (
				org: string | undefined,
				options: { runners: boolean; secrets: boolean; output: string }
			) => {
				if (!org) {
					console.error('Organization name is required. Usage: specto org actions <org>')
					process.exit(1)
				}
				await runOrgActions({
					org,
					runners: options.runners ?? false,
					secrets: options.secrets ?? false,
					output: options.output as OutputFormat,
				})
			}
		)
	)

// Default command
orgCommand.action(() => {
	orgCommand.help()
})
