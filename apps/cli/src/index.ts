#!/usr/bin/env node
import { Command } from 'commander'
import pc from 'picocolors'
import { configCommand } from './commands/config'
import { orgCommand } from './commands/org'
import { statsCommand } from './commands/stats'
import { runInteractive } from './interactive'

const program = new Command()

program
	.name('specto')
	.description('GitHub organization metrics and settings CLI')
	.version('1.0.0')
	.addHelpText(
		'after',
		`
${pc.bold('Examples:')}
  ${pc.dim('# Show commit statistics for an organization')}
  $ specto stats commits myorg

  ${pc.dim('# Show commits for a specific date range')}
  $ specto stats commits myorg --since 2025-01-01 --until 2025-06-30

  ${pc.dim('# Show organization info')}
  $ specto org info myorg

  ${pc.dim('# List organization members')}
  $ specto org members myorg

  ${pc.dim('# List organization teams')}
  $ specto org teams myorg

  ${pc.dim('# Show Actions settings with runners and secrets')}
  $ specto org actions myorg --runners --secrets

  ${pc.dim('# Check authentication status')}
  $ specto config auth

  ${pc.dim('# Run in interactive mode')}
  $ specto
`
	)

program.addCommand(statsCommand)
program.addCommand(orgCommand)
program.addCommand(configCommand)

program
	.command('interactive')
	.description('Run in interactive mode')
	.action(async () => {
		await runInteractive()
	})

// Interactive mode when no args
if (process.argv.length === 2) {
	runInteractive()
} else {
	program.parse()
}
