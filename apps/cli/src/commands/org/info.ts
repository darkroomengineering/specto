import type { OutputFormat } from '@specto/core'
import pc from 'picocolors'
import { github } from '../../lib/github'
import { withSpinner } from '../../lib/ui/spinner'
import { printKeyValue, printSection } from '../../lib/ui/table'

interface OrgInfoOptions {
	org: string
	output: OutputFormat
}

export async function runOrgInfo(options: OrgInfoOptions): Promise<void> {
	const { org, output } = options

	const orgData = await withSpinner(
		`Fetching organization info...`,
		async () => (await github()).getOrganization(org),
		{
			successText: 'Organization info fetched',
		}
	)

	if (output === 'json') {
		console.log(JSON.stringify(orgData, null, 2))
		return
	}

	console.log('')
	console.log(pc.bold(pc.cyan(orgData.name ?? orgData.login)))
	if (orgData.description) {
		console.log(pc.dim(orgData.description))
	}
	console.log('')

	printSection('General')
	printKeyValue([
		{ key: 'Login', value: orgData.login },
		{ key: 'Name', value: orgData.name },
		{ key: 'Company', value: orgData.company },
		{ key: 'Location', value: orgData.location },
		{ key: 'Website', value: orgData.blog },
		{ key: 'Email', value: orgData.email },
		{ key: 'Twitter', value: orgData.twitter_username ? `@${orgData.twitter_username}` : null },
	])

	printSection('Repositories')
	printKeyValue([
		{ key: 'Public repos', value: orgData.public_repos },
		{ key: 'Private repos', value: orgData.total_private_repos ?? 'N/A' },
		{ key: 'Total', value: orgData.public_repos + (orgData.total_private_repos ?? 0) },
	])

	if (orgData.plan) {
		printSection('Plan')
		printKeyValue([
			{ key: 'Plan name', value: orgData.plan.name },
			{ key: 'Seats', value: orgData.plan.seats ?? 'Unlimited' },
			{ key: 'Filled seats', value: orgData.plan.filled_seats ?? 'N/A' },
			{ key: 'Private repos', value: orgData.plan.private_repos },
		])
	}

	printSection('Settings')
	printKeyValue([
		{ key: 'Default repo permission', value: orgData.default_repository_permission ?? 'N/A' },
		{
			key: 'Members can create repos',
			value: orgData.members_can_create_repositories ?? 'N/A',
		},
		{
			key: '2FA required',
			value: orgData.two_factor_requirement_enabled ?? 'N/A',
		},
		{
			key: 'Web commit signoff',
			value: orgData.web_commit_signoff_required ?? 'N/A',
		},
	])

	printSection('Security Features (New Repos)')
	printKeyValue([
		{
			key: 'Advanced Security',
			value: orgData.advanced_security_enabled_for_new_repositories ?? 'N/A',
		},
		{
			key: 'Dependabot alerts',
			value: orgData.dependabot_alerts_enabled_for_new_repositories ?? 'N/A',
		},
		{
			key: 'Dependabot updates',
			value: orgData.dependabot_security_updates_enabled_for_new_repositories ?? 'N/A',
		},
		{
			key: 'Dependency graph',
			value: orgData.dependency_graph_enabled_for_new_repositories ?? 'N/A',
		},
		{
			key: 'Secret scanning',
			value: orgData.secret_scanning_enabled_for_new_repositories ?? 'N/A',
		},
		{
			key: 'Push protection',
			value: orgData.secret_scanning_push_protection_enabled_for_new_repositories ?? 'N/A',
		},
	])

	printSection('Links')
	printKeyValue([
		{ key: 'GitHub URL', value: orgData.html_url },
		{ key: 'Created', value: new Date(orgData.created_at).toLocaleDateString() },
	])

	console.log('')
}
