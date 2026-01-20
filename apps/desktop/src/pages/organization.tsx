import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Stat, Table, Badge, Button, Select } from '@specto/ui'
import { useGitHubStore, type Timeframe, type MetricType } from '../stores/github'
import { useProFeature, exportData } from '../stores/license'
import { Spinner } from '../components/spinner'

const metricOptions = [
	{ value: 'commits', label: 'Commits' },
	{ value: 'prs', label: 'Pull Requests' },
	{ value: 'issues', label: 'Issues' },
]

export function Organization() {
	const { isPro, canExport } = useProFeature()
	const [isExporting, setIsExporting] = useState(false)
	const [exportError, setExportError] = useState<string | null>(null)
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
		setExportError(null)
		setShowExportMenu(false)

		const result = await exportData(format, {
			organization: orgName,
			metrics: {
				commits: totalCommits,
				pullRequests: totalPRs,
				issues: totalIssues,
				contributors: commitStats.length,
				repositories: repos.length,
				stars: info?.public_repos || 0,
			},
			period: getTimeframeLabel(timeframe),
		})

		setIsExporting(false)

		if (result.success && result.blob) {
			// Download the file
			const url = URL.createObjectURL(result.blob)
			const a = document.createElement('a')
			a.href = url
			a.download = result.filename || `specto-export.${format}`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
		} else {
			setExportError(result.error || 'Export failed')
		}
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

			{/* Toast notification */}
			{exportError && (
				<div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
					<div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--color-error)] shadow-lg">
						<svg className="w-5 h-5 text-[var(--color-error)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p className="text-sm text-[var(--foreground)]">{exportError}</p>
						<button
							onClick={() => setExportError(null)}
							className="ml-2 p-1 rounded hover:bg-[var(--card-hover)] transition-colors"
						>
							<svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
