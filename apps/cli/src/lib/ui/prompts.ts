import * as p from '@clack/prompts'
import { getDefaultDateRange, getUserOrgs, type OutputFormat } from '@specto/core'
import pc from 'picocolors'

export async function selectOrganization(defaultOrg?: string): Promise<string> {
	// If default provided and user confirms, use it
	if (defaultOrg) {
		const useDefault = await p.confirm({
			message: `Use organization ${pc.cyan(defaultOrg)}?`,
			initialValue: true,
		})

		if (p.isCancel(useDefault)) {
			p.cancel('Operation cancelled')
			process.exit(0)
		}

		if (useDefault) {
			return defaultOrg
		}
	}

	// Try to fetch user's orgs
	let orgs: Array<{ value: string; label: string }> = []
	try {
		const userOrgs = await getUserOrgs()
		orgs = userOrgs.map((org) => ({
			value: org.login,
			label: org.login,
		}))
	} catch {
		// If fetch fails, fall through to text input
	}

	if (orgs.length > 0) {
		const selected = await p.select({
			message: 'Select an organization',
			options: [...orgs, { value: '__other__', label: pc.dim('Enter manually...') }],
		})

		if (p.isCancel(selected)) {
			p.cancel('Operation cancelled')
			process.exit(0)
		}

		if (selected !== '__other__') {
			return selected as string
		}
	}

	// Manual input
	const org = await p.text({
		message: 'Enter organization name',
		placeholder: 'my-organization',
		validate: (value) => {
			if (!value.trim()) return 'Organization name is required'
			if (!/^[a-zA-Z0-9-]+$/.test(value)) return 'Invalid organization name'
			return undefined
		},
	})

	if (p.isCancel(org)) {
		p.cancel('Operation cancelled')
		process.exit(0)
	}

	return org
}

export async function selectDateRange(): Promise<{ since: string; until: string }> {
	const defaults = getDefaultDateRange()

	const preset = await p.select({
		message: 'Select date range',
		options: [
			{ value: 'year', label: `This year (${new Date().getFullYear()})` },
			{ value: 'quarter', label: 'This quarter' },
			{ value: 'month', label: 'This month' },
			{ value: 'last30', label: 'Last 30 days' },
			{ value: 'last90', label: 'Last 90 days' },
			{ value: 'custom', label: 'Custom range' },
		],
	})

	if (p.isCancel(preset)) {
		p.cancel('Operation cancelled')
		process.exit(0)
	}

	const now = new Date()

	switch (preset) {
		case 'year':
			return defaults
		case 'quarter': {
			const quarter = Math.floor(now.getMonth() / 3)
			const startMonth = quarter * 3
			return {
				since: new Date(now.getFullYear(), startMonth, 1).toISOString(),
				until: new Date(now.getFullYear(), startMonth + 3, 0, 23, 59, 59).toISOString(),
			}
		}
		case 'month':
			return {
				since: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
				until: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
			}
		case 'last30': {
			const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
			return {
				since: thirtyDaysAgo.toISOString(),
				until: now.toISOString(),
			}
		}
		case 'last90': {
			const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
			return {
				since: ninetyDaysAgo.toISOString(),
				until: now.toISOString(),
			}
		}
		case 'custom': {
			const since = await p.text({
				message: 'Start date (YYYY-MM-DD)',
				placeholder: defaults.since.split('T')[0],
				validate: (value) => {
					if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Use YYYY-MM-DD format'
					return undefined
				},
			})

			if (p.isCancel(since)) {
				p.cancel('Operation cancelled')
				process.exit(0)
			}

			const until = await p.text({
				message: 'End date (YYYY-MM-DD)',
				placeholder: defaults.until.split('T')[0],
				validate: (value) => {
					if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Use YYYY-MM-DD format'
					return undefined
				},
			})

			if (p.isCancel(until)) {
				p.cancel('Operation cancelled')
				process.exit(0)
			}

			return {
				since: `${since}T00:00:00Z`,
				until: `${until}T23:59:59Z`,
			}
		}
		default:
			return defaults
	}
}

export async function selectOutputFormat(): Promise<OutputFormat> {
	const format = await p.select({
		message: 'Output format',
		options: [
			{ value: 'table', label: 'Table (formatted)' },
			{ value: 'json', label: 'JSON' },
			{ value: 'csv', label: 'CSV' },
		],
	})

	if (p.isCancel(format)) {
		p.cancel('Operation cancelled')
		process.exit(0)
	}

	return format as OutputFormat
}

export async function confirmAction(message: string): Promise<boolean> {
	const confirmed = await p.confirm({
		message,
		initialValue: true,
	})

	if (p.isCancel(confirmed)) {
		p.cancel('Operation cancelled')
		process.exit(0)
	}

	return confirmed
}

export function intro(message: string): void {
	p.intro(pc.bgCyan(pc.black(` ${message} `)))
}

export function outro(message: string): void {
	p.outro(message)
}

export function cancel(message = 'Operation cancelled'): never {
	p.cancel(message)
	process.exit(0)
}

export function note(message: string, title?: string): void {
	p.note(message, title)
}
