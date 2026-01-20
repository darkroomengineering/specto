import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Stat, Table, Badge, Button, Select } from '@specto/ui'
import { toast } from 'sonner'
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'
import { open } from '@tauri-apps/plugin-shell'
import { useGitHubStore, type Timeframe, type MetricType } from '../stores/github'
import { useProFeature } from '../stores/license'
import { Spinner } from '../components/spinner'

const metricOptions = [
	{ value: 'commits', label: 'Commits' },
	{ value: 'prs', label: 'Pull Requests' },
	{ value: 'issues', label: 'Issues' },
]

export function Organization() {
	const { isPro, canExport } = useProFeature()
	const [isExporting, setIsExporting] = useState(false)
	const [showExportMenu, setShowExportMenu] = useState(false)

	// Timeframe options with Pro gating
	const timeframeOptions = [
		{ value: '7d', label: 'Last 7 days' },
		{ value: '30d', label: 'Last 30 days' },
		{ value: '90d', label: isPro ? 'Last 90 days' : '🔒 Last 90 days', disabled: !isPro },
		{ value: 'ytd', label: isPro ? 'Year to date' : '🔒 Year to date', disabled: !isPro },
		{ value: 'all', label: isPro ? 'All time' : '🔒 All time', disabled: !isPro },
	]
	const { orgName } = useParams<{ orgName: string }>()
	const navigate = useNavigate()
	const {
		currentOrg,
		orgData,
		isLoading,
		error,
		timeframe,
		metricType,
		setOrg,
		setTimeframe,
		setMetricType,
		fetchAll,
	} = useGitHubStore()

	useEffect(() => {
		if (orgName && orgName !== currentOrg) {
			setOrg(orgName)
		}
	}, [orgName, currentOrg, setOrg])

	useEffect(() => {
		if (currentOrg) {
			fetchAll()
		}
	}, [currentOrg, fetchAll])

	const { info, members, teams, commitStats, prStats, issueStats, repos, totalCommits, totalPRs, totalIssues } = orgData

	const handleExport = async (format: 'csv' | 'json') => {
		if (!canExport || !orgName) {
			navigate('/settings')
			return
		}

		setIsExporting(true)
		setShowExportMenu(false)

		try {
			const period = getTimeframeLabel(timeframe)
			const exportContent = format === 'json'
				? generateJSONExport()
				: generateCSVExport()

			// Show save dialog
			const defaultFilename = `specto-${orgName}-${timeframe}.${format}`
			const filePath = await save({
				defaultPath: defaultFilename,
				filters: format === 'csv'
					? [{ name: 'CSV', extensions: ['csv'] }]
					: [{ name: 'JSON', extensions: ['json'] }],
			})

			if (filePath) {
				await writeTextFile(filePath, exportContent)

				// Get the folder path for "Show in Finder"
				const folderPath = filePath.substring(0, filePath.lastIndexOf('/'))

				toast.success(
					<div className="flex flex-col gap-1">
						<span>Export saved</span>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								open(folderPath)
							}}
							className="text-xs underline text-left hover:opacity-80"
						>
							Show in Finder
						</button>
					</div>,
					{ duration: 5000 }
				)
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Export failed')
		} finally {
			setIsExporting(false)
		}
	}

	const generateJSONExport = () => {
		const period = getTimeframeLabel(timeframe)
		const data = {
			organization: {
				name: orgName,
				description: info?.description || null,
				publicRepos: info?.public_repos || repos.length,
				members: members.length,
				teams: teams.length,
			},
			period,
			exportedAt: new Date().toISOString(),
			summary: {
				totalCommits,
				totalPullRequests: totalPRs,
				totalIssues,
				activeContributors: commitStats.length,
			},
			topContributorsByCommits: commitStats.map(s => ({
				author: s.author,
				commits: s.count,
			})),
			topContributorsByPRs: prStats.map(s => ({
				author: s.author,
				pullRequests: s.count,
				merged: s.merged,
			})),
			topContributorsByIssues: issueStats.map(s => ({
				author: s.author,
				opened: s.opened,
				closed: s.closed,
			})),
			teams: teams.slice(0, 10).map(t => ({
				name: t.name,
				privacy: t.privacy,
				membersCount: t.members_count,
			})),
		}
		return JSON.stringify(data, null, 2)
	}

	const generateCSVExport = () => {
		const period = getTimeframeLabel(timeframe)
		const lines: string[] = []

		// Header info
		lines.push('Specto Export')
		lines.push(`Organization,${orgName}`)
		lines.push(`Period,${period}`)
		lines.push(`Exported At,${new Date().toISOString()}`)
		lines.push('')

		// Summary
		lines.push('Summary')
		lines.push(`Total Commits,${totalCommits}`)
		lines.push(`Total Pull Requests,${totalPRs}`)
		lines.push(`Total Issues,${totalIssues}`)
		lines.push(`Active Contributors,${commitStats.length}`)
		lines.push(`Repositories,${repos.length}`)
		lines.push(`Members,${members.length}`)
		lines.push(`Teams,${teams.length}`)
		lines.push('')

		// Top contributors by commits
		lines.push('Top Contributors by Commits')
		lines.push('Author,Commits')
		for (const s of commitStats) {
			lines.push(`${s.author},${s.count}`)
		}
		lines.push('')

		// Top contributors by PRs
		lines.push('Top Contributors by Pull Requests')
		lines.push('Author,PRs,Merged')
		for (const s of prStats) {
			lines.push(`${s.author},${s.count},${s.merged}`)
		}
		lines.push('')

		// Top contributors by issues
		lines.push('Top Contributors by Issues')
		lines.push('Author,Opened,Closed')
		for (const s of issueStats) {
			lines.push(`${s.author},${s.opened},${s.closed}`)
		}

		return lines.join('\n')
	}

	const getTimeframeLabel = (tf: Timeframe) => {
		switch (tf) {
			case '7d': return 'Last 7 days'
			case '30d': return 'Last 30 days'
			case '90d': return 'Last 90 days'
			case 'ytd': return 'Year to date'
			case 'all': return 'All time'
		}
	}

	const renderContributorTable = () => {
		const isLoadingData = metricType === 'commits' ? isLoading.commits
			: metricType === 'prs' ? isLoading.prs
			: isLoading.issues

		const data = metricType === 'commits' ? commitStats
			: metricType === 'prs' ? prStats
			: issueStats

		const total = metricType === 'commits' ? totalCommits
			: metricType === 'prs' ? totalPRs
			: totalIssues

		if (isLoadingData && data.length === 0) {
			return (
				<div className="flex items-center justify-center h-32">
					<Spinner />
				</div>
			)
		}

		if (data.length === 0) {
			return (
				<div className="flex items-center justify-center h-32 text-[var(--muted)] text-sm">
					No data available
				</div>
			)
		}

		if (metricType === 'commits') {
			// Calculate "Other" commits (total minus top 10)
			const top10Total = commitStats.reduce((sum, s) => sum + s.count, 0)
			const otherCommits = total - top10Total
			const hasOther = otherCommits > 0

			return (
				<Table>
					<Table.Header>
						<Table.Row>
							<Table.Head>Author</Table.Head>
							<Table.Head className="text-right">Commits</Table.Head>
							<Table.Head className="text-right">Share</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{commitStats.map((stat) => (
							<Table.Row key={stat.author}>
								<Table.Cell className="font-medium">{stat.author}</Table.Cell>
								<Table.Cell className="text-right text-[var(--accent)]">
									{stat.count}
								</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">
									{total > 0 ? `${((stat.count / total) * 100).toFixed(1)}%` : '—'}
								</Table.Cell>
							</Table.Row>
						))}
						{hasOther && (
							<Table.Row>
								<Table.Cell className="font-medium text-[var(--muted)] italic">Other</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">
									{otherCommits}
								</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">
									{total > 0 ? `${((otherCommits / total) * 100).toFixed(1)}%` : '—'}
								</Table.Cell>
							</Table.Row>
						)}
					</Table.Body>
				</Table>
			)
		}

		if (metricType === 'prs') {
			// Calculate "Other" PRs
			const top10Total = prStats.reduce((sum, s) => sum + s.count, 0)
			const otherPRs = total - top10Total
			const hasOther = otherPRs > 0

			return (
				<Table>
					<Table.Header>
						<Table.Row>
							<Table.Head>Author</Table.Head>
							<Table.Head className="text-right">PRs</Table.Head>
							<Table.Head className="text-right">Merged</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{prStats.map((stat) => (
							<Table.Row key={stat.author}>
								<Table.Cell className="font-medium">{stat.author}</Table.Cell>
								<Table.Cell className="text-right text-[var(--accent)]">
									{stat.count}
								</Table.Cell>
								<Table.Cell className="text-right text-[var(--color-success)]">
									{stat.merged}
								</Table.Cell>
							</Table.Row>
						))}
						{hasOther && (
							<Table.Row>
								<Table.Cell className="font-medium text-[var(--muted)] italic">Other</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">
									{otherPRs}
								</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">
									—
								</Table.Cell>
							</Table.Row>
						)}
					</Table.Body>
				</Table>
			)
		}

		// Calculate "Other" issues
		const top10Total = issueStats.reduce((sum, s) => sum + s.opened, 0)
		const otherIssues = total - top10Total
		const hasOther = otherIssues > 0

		return (
			<Table>
				<Table.Header>
					<Table.Row>
						<Table.Head>Author</Table.Head>
						<Table.Head className="text-right">Opened</Table.Head>
						<Table.Head className="text-right">Closed</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{issueStats.map((stat) => (
						<Table.Row key={stat.author}>
							<Table.Cell className="font-medium">{stat.author}</Table.Cell>
							<Table.Cell className="text-right text-[var(--accent)]">
								{stat.opened}
							</Table.Cell>
							<Table.Cell className="text-right text-[var(--color-success)]">
								{stat.closed}
							</Table.Cell>
						</Table.Row>
					))}
					{hasOther && (
						<Table.Row>
							<Table.Cell className="font-medium text-[var(--muted)] italic">Other</Table.Cell>
							<Table.Cell className="text-right text-[var(--muted)]">
								{otherIssues}
							</Table.Cell>
							<Table.Cell className="text-right text-[var(--muted)]">
								—
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		)
	}

	return (
		<div className="h-full flex flex-col p-8 overflow-auto">
			{/* Header */}
			<div className="mb-8 flex items-start justify-between">
				<div>
					<button
						onClick={() => navigate('/dashboard')}
						className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-1 flex items-center gap-1"
					>
						<span>←</span> back
					</button>
					<h1 className="text-2xl font-semibold text-[var(--foreground)] flex items-center gap-2">
						{orgName}
						{isLoading.info ? (
							<Spinner size="sm" />
						) : info ? (
							<Badge variant="success">Connected</Badge>
						) : error ? (
							<Badge variant="error">Error</Badge>
						) : null}
					</h1>
					{info?.description && (
						<p className="text-sm text-[var(--muted)] mt-1">{info.description}</p>
					)}
				</div>
				<div className="flex items-center gap-3">
					<Select
						value={timeframe}
						onChange={(v) => setTimeframe(v as Timeframe)}
						options={timeframeOptions}
						size="sm"
					/>
					<Select
						value={metricType}
						onChange={(v) => setMetricType(v as MetricType)}
						options={metricOptions}
						size="sm"
					/>
					<div className="relative">
						<Button
							variant="secondary"
							size="sm"
							onClick={() => canExport ? setShowExportMenu(!showExportMenu) : navigate('/settings')}
							disabled={isExporting}
						>
							{isExporting ? (
								<Spinner size="sm" />
							) : (
								<>
									{!canExport && <span className="mr-1">🔒</span>}
									Export
								</>
							)}
						</Button>
						{showExportMenu && canExport && (
							<div className="absolute right-0 top-full mt-1 py-1 bg-[var(--card)] border border-[var(--border)] rounded-md shadow-lg z-10 min-w-[120px]">
								<button
									className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--card-hover)] transition-colors"
									onClick={() => handleExport('csv')}
								>
									Export CSV
								</button>
								<button
									className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--card-hover)] transition-colors"
									onClick={() => handleExport('json')}
								>
									Export JSON
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Error state */}
			{error && (
				<Card className="mb-6 border-[var(--color-error)]">
					<Card.Content>
						<p className="text-[var(--color-error)] text-sm">{error}</p>
						<Button variant="secondary" size="sm" className="mt-2" onClick={fetchAll}>
							Retry
						</Button>
					</Card.Content>
				</Card>
			)}

			{/* Stats grid */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
				<Stat
					label="Total Commits"
					value={isLoading.commits ? '...' : totalCommits || '—'}
					description={getTimeframeLabel(timeframe)}
				/>
				<Stat
					label="Pull Requests"
					value={isLoading.prs ? '...' : totalPRs || '—'}
					description={getTimeframeLabel(timeframe)}
				/>
				<Stat
					label="Issues"
					value={isLoading.issues ? '...' : totalIssues || '—'}
					description={getTimeframeLabel(timeframe)}
				/>
				<Stat
					label="Repositories"
					value={isLoading.repos ? '...' : repos.length || info?.public_repos || '—'}
					description="Total repos"
				/>
			</div>

			{/* Secondary stats */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
				<Stat
					label="Members"
					value={isLoading.members ? '...' : members.length || '—'}
					description="Organization members"
				/>
				<Stat
					label="Teams"
					value={isLoading.teams ? '...' : teams.length || '—'}
					description="Active teams"
				/>
				<Stat
					label="Contributors"
					value={isLoading.commits ? '...' : commitStats.length || '—'}
					description="Active contributors"
				/>
				<Stat
					label="Avg Commits/Person"
					value={
						isLoading.commits
							? '...'
							: commitStats.length > 0
								? Math.round(totalCommits / commitStats.length)
								: '—'
					}
					description={getTimeframeLabel(timeframe)}
				/>
			</div>

			{/* Content grid */}
			<div className="grid lg:grid-cols-2 gap-8 flex-1">
				{/* Top contributors based on selected metric */}
				<Card className="flex flex-col">
					<Card.Header>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium">
								Top Contributors ({metricType === 'commits' ? 'Commits' : metricType === 'prs' ? 'PRs' : 'Issues'})
							</h2>
							{(isLoading.commits || isLoading.prs || isLoading.issues) && <Spinner size="sm" />}
						</div>
					</Card.Header>
					<Card.Content className="flex-1 p-0">
						{renderContributorTable()}
					</Card.Content>
				</Card>

				{/* Teams */}
				<Card className="flex flex-col">
					<Card.Header>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-medium">Teams</h2>
							{isLoading.teams && <Spinner size="sm" />}
						</div>
					</Card.Header>
					<Card.Content className="flex-1 p-0">
						{isLoading.teams && teams.length === 0 ? (
							<div className="flex items-center justify-center h-32">
								<Spinner />
							</div>
						) : teams.length === 0 ? (
							<div className="flex items-center justify-center h-32 text-[var(--muted)] text-sm">
								No teams found
							</div>
						) : (
							<Table>
								<Table.Header>
									<Table.Row>
										<Table.Head>Team</Table.Head>
										<Table.Head>Privacy</Table.Head>
										<Table.Head className="text-right">Members</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{teams.slice(0, 5).map((team) => (
										<Table.Row key={team.id}>
											<Table.Cell className="font-medium">{team.name}</Table.Cell>
											<Table.Cell>
												<Badge variant={team.privacy === 'secret' ? 'warning' : 'success'}>
													{team.privacy}
												</Badge>
											</Table.Cell>
											<Table.Cell className="text-right">{team.members_count}</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table>
						)}
					</Card.Content>
				</Card>
			</div>

		</div>
	)
}
