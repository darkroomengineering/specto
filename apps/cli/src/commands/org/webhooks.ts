import type { OutputFormat } from '@specto/core'
import pc from 'picocolors'
import { github } from '../../lib/github'
import { withSpinner } from '../../lib/ui/spinner'
import { printTable } from '../../lib/ui/table'

interface WebhooksOptions {
	org: string
	output: OutputFormat
}

export async function runOrgWebhooks(options: WebhooksOptions): Promise<void> {
	const { org, output } = options

	const webhooks = await withSpinner(
		`Fetching webhooks...`,
		async () => (await github()).getOrgWebhooks(org),
		{
			successText: 'Webhooks fetched',
		}
	)

	if (webhooks.length === 0) {
		console.log(pc.yellow('No organization webhooks found'))
		return
	}

	console.log('')
	console.log(pc.bold(`Webhooks in ${pc.cyan(org)}`))
	console.log(pc.dim(`${webhooks.length} webhooks total`))

	const displayWebhooks = webhooks.map((w) => ({
		id: w.id,
		name: w.name,
		active: w.active ? 'Yes' : 'No',
		url: w.config.url ?? 'N/A',
		events: w.events.slice(0, 3).join(', ') + (w.events.length > 3 ? '...' : ''),
	}))

	printTable({
		columns: [
			{
				key: 'id',
				header: 'ID',
				align: 'right',
			},
			{
				key: 'name',
				header: 'Name',
				color: (v) => pc.cyan(String(v)),
			},
			{
				key: 'active',
				header: 'Active',
				color: (v) => (v === 'Yes' ? pc.green(String(v)) : pc.red(String(v))),
			},
			{
				key: 'url',
				header: 'URL',
				color: (v) => pc.dim(String(v)),
			},
			{
				key: 'events',
				header: 'Events',
				color: (v) => pc.dim(String(v)),
			},
		],
		rows: displayWebhooks,
		format: output,
	})
}
