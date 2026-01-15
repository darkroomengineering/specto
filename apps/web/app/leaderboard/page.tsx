'use client'

import { Button, Card } from '@specto/ui'
import { useState, useEffect } from 'react'

interface OrgStats {
	rank: number
	name: string
	avatarUrl: string
	commits: number
	prs: number
	issues: number
	contributors: number
	trend: 'up' | 'down' | 'same'
}

type SortKey = 'commits' | 'prs' | 'issues' | 'contributors'

export default function LeaderboardPage() {
	const [data, setData] = useState<OrgStats[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [sortBy, setSortBy] = useState<SortKey>('commits')

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true)
			try {
				const res = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=50`)
				const json = await res.json()
				setData(json.data)
			} catch (error) {
				console.error('Failed to fetch leaderboard:', error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [sortBy])

	const sortOptions: { key: SortKey; label: string }[] = [
		{ key: 'commits', label: 'Commits' },
		{ key: 'prs', label: 'Pull Requests' },
		{ key: 'issues', label: 'Issues' },
		{ key: 'contributors', label: 'Contributors' },
	]

	return (
		<div className="min-h-screen bg-[var(--background)]">
			{/* Hero */}
			<section className="pt-32 pb-12 px-6 text-center">
				<h1 className="text-5xl font-bold mb-4">Global Leaderboard</h1>
				<p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
					See how the world's top organizations stack up on GitHub.
					Rankings updated daily based on YTD activity.
				</p>
			</section>

			{/* Filters */}
			<section className="px-6 mb-8">
				<div className="max-w-4xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-sm text-[var(--muted)]">Sort by:</span>
						<div className="flex gap-1">
							{sortOptions.map((option) => (
								<button
									key={option.key}
									onClick={() => setSortBy(option.key)}
									className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
										sortBy === option.key
											? 'bg-[var(--accent)] text-white'
											: 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
									}`}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>
					<div className="text-sm text-[var(--muted)]">
						Showing top 50 organizations
					</div>
				</div>
			</section>

			{/* Leaderboard Table */}
			<section className="px-6 pb-24">
				<div className="max-w-4xl mx-auto">
					<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
						{/* Table header */}
						<div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border)] bg-[var(--background)] text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
							<div className="col-span-1">Rank</div>
							<div className="col-span-4">Organization</div>
							<div className="col-span-2 text-right">
								<button
									onClick={() => setSortBy('commits')}
									className={sortBy === 'commits' ? 'text-[var(--accent)]' : ''}
								>
									Commits {sortBy === 'commits' && '↓'}
								</button>
							</div>
							<div className="col-span-2 text-right">
								<button
									onClick={() => setSortBy('prs')}
									className={sortBy === 'prs' ? 'text-[var(--accent)]' : ''}
								>
									PRs {sortBy === 'prs' && '↓'}
								</button>
							</div>
							<div className="col-span-1 text-right">
								<button
									onClick={() => setSortBy('issues')}
									className={sortBy === 'issues' ? 'text-[var(--accent)]' : ''}
								>
									Issues {sortBy === 'issues' && '↓'}
								</button>
							</div>
							<div className="col-span-2 text-right">
								<button
									onClick={() => setSortBy('contributors')}
									className={sortBy === 'contributors' ? 'text-[var(--accent)]' : ''}
								>
									Contributors {sortBy === 'contributors' && '↓'}
								</button>
							</div>
						</div>

						{/* Loading state */}
						{isLoading && (
							<div className="px-6 py-12 text-center text-[var(--muted)]">
								Loading leaderboard...
							</div>
						)}

						{/* Table rows */}
						{!isLoading && data.map((org) => (
							<div
								key={org.name}
								className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)] transition-colors"
							>
								<div className="col-span-1 flex items-center">
									{org.rank <= 3 ? (
										<span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
											org.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
											org.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
											'bg-amber-600/20 text-amber-600'
										}`}>
											{org.rank}
										</span>
									) : (
										<span className="text-[var(--muted)] pl-2">{org.rank}</span>
									)}
								</div>
								<div className="col-span-4 flex items-center gap-3">
									<img
										src={org.avatarUrl}
										alt={org.name}
										className="w-8 h-8 rounded-lg"
									/>
									<div className="flex items-center gap-2">
										<span className="font-medium">{org.name}</span>
										{org.trend === 'up' && (
											<span className="text-green-500 text-xs">↑</span>
										)}
										{org.trend === 'down' && (
											<span className="text-red-500 text-xs">↓</span>
										)}
									</div>
								</div>
								<div className={`col-span-2 text-right font-mono text-sm ${sortBy === 'commits' ? 'text-[var(--accent)]' : ''}`}>
									{org.commits.toLocaleString()}
								</div>
								<div className={`col-span-2 text-right font-mono text-sm ${sortBy === 'prs' ? 'text-[var(--accent)]' : ''}`}>
									{org.prs.toLocaleString()}
								</div>
								<div className={`col-span-1 text-right font-mono text-sm ${sortBy === 'issues' ? 'text-[var(--accent)]' : ''}`}>
									{org.issues.toLocaleString()}
								</div>
								<div className={`col-span-2 text-right font-mono text-sm ${sortBy === 'contributors' ? 'text-[var(--accent)]' : ''}`}>
									{org.contributors}
								</div>
							</div>
						))}
					</div>

					{/* Info box */}
					<Card className="mt-8">
						<Card.Content className="py-6">
							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div>
									<h3 className="font-semibold mb-1">How rankings work</h3>
									<p className="text-sm text-[var(--muted)]">
										Rankings are calculated based on public GitHub activity (commits, PRs, issues)
										from the current year. Data is refreshed daily. Only public repositories are counted.
										Want to see your organization here? Make sure your repos are public and active!
									</p>
								</div>
							</div>
						</Card.Content>
					</Card>

					{/* CTA */}
					<div className="mt-12 text-center">
						<h3 className="text-xl font-semibold mb-2">Want detailed insights for your org?</h3>
						<p className="text-[var(--muted)] mb-6">
							Download Specto to track private repos, view history, and export reports.
						</p>
						<div className="flex items-center justify-center gap-4">
							<Button>Download for Mac</Button>
							<Button variant="secondary">Download for Windows</Button>
						</div>
					</div>
				</div>
			</section>

		</div>
	)
}
