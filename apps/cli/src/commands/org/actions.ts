import type { OutputFormat } from '@specto/core'
import pc from 'picocolors'
import { github } from '../../lib/github'
import { withSpinner } from '../../lib/ui/spinner'
import { printKeyValue, printSection, printTable, printWarning } from '../../lib/ui/table'

interface ActionsOptions {
	org: string
	runners: boolean
	secrets: boolean
	output: OutputFormat
}

export async function runOrgActions(options: ActionsOptions): Promise<void> {
	const { org, runners: showRunners, secrets: showSecrets, output } = options

	// Fetch settings
	try {
		const settings = await withSpinner(`Fetching Actions settings...`, async () =>
			(await github()).getActionsSettings(org)
		)

		if (output === 'json') {
			const data: Record<string, unknown> = { settings }

			if (showRunners) {
				try {
					data.runners = await (await github()).getOrgRunners(org)
				} catch {
					data.runners = { error: 'No access' }
				}
			}

			if (showSecrets) {
				try {
					data.secrets = await (await github()).getOrgSecrets(org)
				} catch {
					data.secrets = { error: 'No access' }
				}
			}

			console.log(JSON.stringify(data, null, 2))
			return
		}

		console.log('')
		console.log(pc.bold(`GitHub Actions Settings for ${pc.cyan(org)}`))

		printSection('Permissions')
		printKeyValue([
			{
				key: 'Enabled repositories',
				value: settings.enabled_repositories,
			},
			{
				key: 'Allowed actions',
				value: settings.allowed_actions ?? 'N/A',
			},
		])
	} catch {
		printWarning('Could not fetch Actions settings (admin access required)')
	}

	// Fetch runners if requested
	if (showRunners) {
		try {
			const runnersData = await withSpinner(`Fetching self-hosted runners...`, async () =>
				(await github()).getOrgRunners(org)
			)

			if (runnersData.runners.length === 0) {
				console.log(pc.dim('\nNo self-hosted runners configured'))
			} else {
				printSection('Self-Hosted Runners')
				console.log(pc.dim(`${runnersData.total_count} runners total`))

				const displayRunners = runnersData.runners.map((r) => ({
					id: r.id,
					name: r.name,
					os: r.os,
					status: r.status,
					busy: r.busy ? 'Yes' : 'No',
					labels: r.labels.map((l) => l.name).join(', '),
				}))

				printTable({
					columns: [
						{ key: 'name', header: 'Name', color: (v) => pc.cyan(String(v)) },
						{ key: 'os', header: 'OS' },
						{
							key: 'status',
							header: 'Status',
							color: (v) => (v === 'online' ? pc.green(String(v)) : pc.yellow(String(v))),
						},
						{
							key: 'busy',
							header: 'Busy',
							color: (v) => (v === 'Yes' ? pc.yellow(String(v)) : pc.dim(String(v))),
						},
						{ key: 'labels', header: 'Labels', color: (v) => pc.dim(String(v)) },
					],
					rows: displayRunners,
					format: output,
				})
			}
		} catch {
			printWarning('Could not fetch runners (admin access required)')
		}
	}

	// Fetch secrets if requested
	if (showSecrets) {
		try {
			const secretsData = await withSpinner(`Fetching organization secrets...`, async () =>
				(await github()).getOrgSecrets(org)
			)

			if (secretsData.secrets.length === 0) {
				console.log(pc.dim('\nNo organization secrets configured'))
			} else {
				printSection('Organization Secrets')
				console.log(pc.dim(`${secretsData.total_count} secrets total (names only)`))

				const displaySecrets = secretsData.secrets.map((s) => ({
					name: s.name,
					visibility: s.visibility,
					updated: new Date(s.updated_at).toLocaleDateString(),
				}))

				printTable({
					columns: [
						{ key: 'name', header: 'Name', color: (v) => pc.cyan(String(v)) },
						{
							key: 'visibility',
							header: 'Visibility',
							color: (v) =>
								v === 'all'
									? pc.yellow(String(v))
									: v === 'private'
										? pc.green(String(v))
										: pc.blue(String(v)),
						},
						{ key: 'updated', header: 'Updated', color: (v) => pc.dim(String(v)) },
					],
					rows: displaySecrets,
					format: output,
				})
			}
		} catch {
			printWarning('Could not fetch secrets (admin access required)')
		}
	}

	console.log('')
}
