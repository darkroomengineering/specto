import { getAuthStatus, isGhCliAvailable } from '@specto/core'
import { Command } from 'commander'
import pc from 'picocolors'
import { printError, printKeyValue, printSuccess, printWarning } from '../../lib/ui/table'
import { wrapCommand } from '../../lib/utils/errors'

export const configCommand = new Command('config').description('CLI configuration and status')

configCommand
	.command('auth')
	.description('Show authentication status')
	.action(
		wrapCommand(async () => {
			console.log('')
			console.log(pc.bold('Authentication Status'))
			console.log('')

			const ghAvailable = await isGhCliAvailable()
			const status = await getAuthStatus()

			printKeyValue([
				{ key: 'GitHub CLI', value: ghAvailable ? 'Installed' : 'Not found' },
				{ key: 'Auth method', value: status.method === 'none' ? 'None' : status.method },
				{ key: 'Status', value: status.valid ? 'Valid' : 'Invalid' },
			])

			if (status.valid && status.username) {
				console.log('')
				printSuccess(`Authenticated as ${pc.cyan(status.username)}`)

				if (status.scopes && status.scopes.length > 0) {
					console.log(pc.dim(`Scopes: ${status.scopes.join(', ')}`))
				}
			} else if (status.method === 'none') {
				console.log('')
				printWarning('Not authenticated')
				console.log('')
				console.log('To authenticate, either:')
				console.log(`  1. Run ${pc.cyan('gh auth login')} (recommended)`)
				console.log(`  2. Set ${pc.cyan('GITHUB_TOKEN')} environment variable`)
			} else {
				console.log('')
				printError('Authentication token is invalid or expired')
				console.log('')
				console.log('Try re-authenticating:')
				console.log(`  ${pc.cyan('gh auth login')}`)
			}

			console.log('')
		})
	)

// Default command
configCommand.action(() => {
	configCommand.help()
})
