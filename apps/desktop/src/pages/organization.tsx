import { Badge, Button, Card, ProGate, Select, Stat, Table } from '@specto/ui'
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'
import { open } from '@tauri-apps/plugin-shell'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { OrganizationSkeleton } from '../components/skeletons/organization-skeleton'
import { Spinner } from '../components/spinner'
import { type MetricType, type Timeframe, useGitHubStore } from '../stores/github'
import { useProFeature } from '../stores/license'

const metricOptions = [
	{ value: 'commits', label: 'Commits' },
	{ value: 'prs', label: 'Pull Requests' },
	{ value: 'issues', label: 'Issues' },
]

export function Organization() {
	const { isPro, canExport } = useProFeature()
	const [isExporting, setIsExporting] = useState(false)
	const [showExportMenu, setShowExportMenu] = useState(false)

	const { orgName } = useParams<{ orgName: string }>()
	const navigate = useNavigate()
	const {
		currentOrg,
		orgData,
		isLoading,
		error,
		notFound,
		suggestions,
		timeframe,
		metricType,
		cacheAge,
		isUsingCachedData,
		setOrg,
		setTimeframe,
		setMetricType,
		fetchAll,
	} = useGitHubStore()

	// Timeframe options with Pro gating (clean labels, disabled state handled by Select)
	const timeframeOptions = [
		{ value: '7d', label: 'Last 7 days' },
		{ value: '30d', label: 'Last 30 days' },
		{ value: '90d', label: 'Last 90 days', disabled: !isPro },
		{ value: 'ytd', label: 'Year to date', disabled: !isPro },
		{ value: 'all', label: 'All time', disabled: !isPro },
	]

	// Determine if primary data is still loading (for coordinated skeleton)
	const isPrimaryLoading = isLoading.info && !orgData.info

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

	const {
		info,
		members,
		teams,
		commitStats,
		prStats,
		issueStats,
		repos,
		totalCommits,
		totalPRs,
		totalIssues,
	} = orgData

	const handleExport = async (format: 'csv' | 'json') => {
		if (!canExport || !orgName) {
			navigate('/settings')
			return
		}

		setIsExporting(true)
		setShowExportMenu(false)

		try {
			const _period = getTimeframeLabel(timeframe)
			const exportContent = format === 'json' ? generateJSONExport() : generateCSVExport()

			// Show save dialog
			const defaultFilename = `specto-${orgName}-${timeframe}.${format}`
			const filePath = await save({
				defaultPath: defaultFilename,
				filters:
					format === 'csv'
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
			topContributorsByCommits: commitStats.map((s) => ({
				author: s.author,
				commits: s.count,
			})),
			topContributorsByPRs: prStats.map((s) => ({
				author: s.author,
				pullRequests: s.count,
				merged: s.merged,
			})),
			topContributorsByIssues: issueStats.map((s) => ({
				author: s.author,
				opened: s.opened,
				closed: s.closed,
			})),
			teams: teams.slice(0, 10).map((t) => ({
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
			case '7d':
				return 'Last 7 days'
			case '30d':
				return 'Last 30 days'
			case '90d':
				return 'Last 90 days'
			case 'ytd':
				return 'Year to date'
			case 'all':
				return 'All time'
		}
	}

	const renderContributorTable = () => {
		const isLoadingData =
			metricType === 'commits'
				? isLoading.commits
				: metricType === 'prs'
					? isLoading.prs
					: isLoading.issues

		const data =
			metricType === 'commits' ? commitStats : metricType === 'prs' ? prStats : issueStats

		const total =
			metricType === 'commits' ? totalCommits : metricType === 'prs' ? totalPRs : totalIssues

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
				<Table aria-label="Top contributors by commits">
					<Table.Header>
						<Table.Row>
							<Table.Head scope="col">Author</Table.Head>
							<Table.Head scope="col" className="text-right">
								Commits
							</Table.Head>
							<Table.Head scope="col" className="text-right">
								Share
							</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{commitStats.map((stat) => (
							<Table.Row key={stat.author}>
								<Table.Cell className="font-medium">{stat.author}</Table.Cell>
								<Table.Cell className="text-right text-[var(--accent)]">{stat.count}</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">
									{total > 0 ? `${((stat.count / total) * 100).toFixed(1)}%` : '—'}
								</Table.Cell>
							</Table.Row>
						))}
						{hasOther && (
							<Table.Row>
								<Table.Cell className="font-medium text-[var(--muted)] italic">Other</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">{otherCommits}</Table.Cell>
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
				<Table aria-label="Top contributors by pull requests">
					<Table.Header>
						<Table.Row>
							<Table.Head scope="col">Author</Table.Head>
							<Table.Head scope="col" className="text-right">
								PRs
							</Table.Head>
							<Table.Head scope="col" className="text-right">
								Merged
							</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{prStats.map((stat) => (
							<Table.Row key={stat.author}>
								<Table.Cell className="font-medium">{stat.author}</Table.Cell>
								<Table.Cell className="text-right text-[var(--accent)]">{stat.count}</Table.Cell>
								<Table.Cell className="text-right text-[var(--color-success)]">
									{stat.merged}
								</Table.Cell>
							</Table.Row>
						))}
						{hasOther && (
							<Table.Row>
								<Table.Cell className="font-medium text-[var(--muted)] italic">Other</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">{otherPRs}</Table.Cell>
								<Table.Cell className="text-right text-[var(--muted)]">—</Table.Cell>
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
			<Table aria-label="Top contributors by issues">
				<Table.Header>
					<Table.Row>
						<Table.Head scope="col">Author</Table.Head>
						<Table.Head scope="col" className="text-right">
							Opened
						</Table.Head>
						<Table.Head scope="col" className="text-right">
							Closed
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{issueStats.map((stat) => (
						<Table.Row key={stat.author}>
							<Table.Cell className="font-medium">{stat.author}</Table.Cell>
							<Table.Cell className="text-right text-[var(--accent)]">{stat.opened}</Table.Cell>
							<Table.Cell className="text-right text-[var(--color-success)]">
								{stat.closed}
							</Table.Cell>
						</Table.Row>
					))}
					{hasOther && (
						<Table.Row>
							<Table.Cell className="font-medium text-[var(--muted)] italic">Other</Table.Cell>
							<Table.Cell className="text-right text-[var(--muted)]">{otherIssues}</Table.Cell>
							<Table.Cell className="text-right text-[var(--muted)]">—</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		)
	}

	const handleUpgrade = () => navigate('/settings')

	return (
		<div
			className="h-full flex flex-col relative overflow-hidden"
			role="region"
			aria-label={`Organization: ${orgName}`}
		>
			{/* Coordinated loading skeleton */}
			<OrganizationSkeleton isVisible={isPrimaryLoading} />

			{/* Main content with fade-in transition */}
			<AnimatePresence>
				{!isPrimaryLoading && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, ease: 'easeOut' }}
						className="h-full flex flex-col p-8 overflow-auto"
					>
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
								{isUsingCachedData && cacheAge && (
									<p className="text-xs text-[var(--color-warning)] mt-1 flex items-center gap-1">
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Showing cached data from {cacheAge}
									</p>
								)}
							</div>
							<div className="flex items-center gap-3">
								<div className="relative">
									<Select
										value={timeframe}
										onChange={(v) => setTimeframe(v as Timeframe)}
										options={timeframeOptions}
										size="sm"
									/>
									{!isPro && (
										<button
											type="button"
											onClick={handleUpgrade}
											className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--accent)] text-white"
											aria-label="Pro features available"
										>
											<svg
												className="w-2.5 h-2.5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
												/>
											</svg>
										</button>
									)}
								</div>
								<Select
									value={metricType}
									onChange={(v) => setMetricType(v as MetricType)}
									options={metricOptions}
									size="sm"
								/>
								<ProGate
									isPro={canExport}
									feature="data export"
									onUpgrade={handleUpgrade}
									mode="disable"
								>
									<div className="relative">
										<Button
											variant="secondary"
											size="sm"
											onClick={() => setShowExportMenu(!showExportMenu)}
											disabled={isExporting}
										>
											{isExporting ? <Spinner size="sm" /> : 'Export'}
										</Button>
										{showExportMenu && (
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
								</ProGate>
							</div>
						</div>

						{/* Error state */}
						{error && (
							<Card className="mb-6 border-[var(--color-error)]">
								<Card.Content>
									<p className="text-[var(--color-error)] text-sm">{error}</p>
									{!notFound && (
										<Button variant="secondary" size="sm" className="mt-2" onClick={fetchAll}>
											Retry
										</Button>
									)}
								</Card.Content>
							</Card>
						)}

						{/* Suggestions when org not found */}
						{notFound && suggestions.length > 0 && (
							<Card className="mb-6">
								<Card.Header>
									<h2 className="text-lg font-medium">Did you mean?</h2>
								</Card.Header>
								<Card.Content>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
										{suggestions.map((org) => (
											<button
												key={org.login}
												onClick={() => navigate(`/org/${org.login}`)}
												className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--card-hover)] transition-all text-left"
											>
												<img
													src={org.avatar_url}
													alt={org.login}
													loading="lazy"
													className="w-10 h-10 rounded-lg"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">{org.login}</p>
													{org.description && (
														<p className="text-xs text-[var(--muted)] truncate">
															{org.description}
														</p>
													)}
												</div>
											</button>
										))}
									</div>
								</Card.Content>
							</Card>
						)}

						{/* Stats grid */}
						<div
							className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
							role="region"
							aria-label="Primary statistics"
							aria-live="polite"
						>
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
						<div
							className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
							role="region"
							aria-label="Secondary statistics"
						>
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
											Top Contributors (
											{metricType === 'commits'
												? 'Commits'
												: metricType === 'prs'
													? 'PRs'
													: 'Issues'}
											)
										</h2>
										{(isLoading.commits || isLoading.prs || isLoading.issues) && (
											<Spinner size="sm" />
										)}
									</div>
								</Card.Header>
								<Card.Content className="flex-1 p-0">{renderContributorTable()}</Card.Content>
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
										<Table aria-label="Organization teams">
											<Table.Header>
												<Table.Row>
													<Table.Head scope="col">Team</Table.Head>
													<Table.Head scope="col">Privacy</Table.Head>
													<Table.Head scope="col" className="text-right">
														Members
													</Table.Head>
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
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
