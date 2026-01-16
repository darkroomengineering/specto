'use client'

import { Button, Card } from '@specto/ui'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { OrgStats, LeaderboardCategory } from '@/lib/github'

const LEADERBOARD_CATEGORIES = [
	{ value: 'developer-favorites', label: 'Developer Favorites', description: 'Tools developers love and use daily' },
	{ value: 'frameworks', label: 'Frameworks', description: 'Web frameworks and meta-frameworks' },
	{ value: 'databases', label: 'Databases & Infra', description: 'Database tools and infrastructure' },
	{ value: 'rising-stars', label: 'Rising Stars', description: 'Fast-growing projects to watch' },
] as const

function formatNumber(num: number): string {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + 'M'
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + 'k'
	}
	return num.toString()
}

function LeaderboardLoading() {
	return (
		<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
			<div className="text-[var(--muted)]">Loading leaderboard...</div>
		</div>
	)
}

export default function LeaderboardPage() {
	return (
		<Suspense fallback={<LeaderboardLoading />}>
			<LeaderboardContent />
		</Suspense>
	)
}

function LeaderboardContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const categoryParam = searchParams.get('category') as LeaderboardCategory | null
	const category = categoryParam && LEADERBOARD_CATEGORIES.some(c => c.value === categoryParam)
		? categoryParam
		: 'developer-favorites'

	const [data, setData] = useState<OrgStats[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const setCategory = (newCategory: string) => {
		router.push(`/leaderboard?category=${newCategory}`)
	}

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true)
			try {
				const res = await fetch(`/api/leaderboard?category=${category}`, { cache: 'no-store' })
				const json = await res.json()
				setData(json.data || [])
			} catch (error) {
				console.error('Failed to fetch leaderboard:', error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [category])

	const currentCategory = LEADERBOARD_CATEGORIES.find(c => c.value === category)

	return (
		<div className="min-h-screen bg-[var(--background)]">
			{/* Hero */}
			<section className="pt-32 pb-12 px-6 text-center">
				<h1 className="text-5xl font-bold mb-4">Global Leaderboard</h1>
				<p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
					See how the world's top organizations stack up on GitHub.
					Rankings updated every hour based on activity metrics.
				</p>
			</section>

			{/* Category Selector */}
			<section className="px-6 mb-8">
				<div className="max-w-4xl mx-auto">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div className="flex flex-col gap-2">
							<label className="text-sm text-[var(--muted)]">Category</label>
							<div className="relative">
								<select
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-medium cursor-pointer hover:border-[var(--accent)] transition-colors min-w-[220px]"
								>
									{LEADERBOARD_CATEGORIES.map((cat) => (
										<option key={cat.value} value={cat.value}>
											{cat.label}
										</option>
									))}
								</select>
								<svg
									className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</div>
							{currentCategory && (
								<p className="text-xs text-[var(--muted)]">{currentCategory.description}</p>
							)}
						</div>
						<div className="text-sm text-[var(--muted)]">
							Showing {data.length} organizations
						</div>
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
							<div className="col-span-5">Organization</div>
							<div className="col-span-2 text-right">Stars</div>
							<div className="col-span-2 text-right">Repos</div>
							<div className="col-span-2 text-right" title="Quality score: 70% stars-per-repo + 30% followers">Activity</div>
						</div>

						{/* Loading state */}
						{isLoading && (
							<div className="px-6 py-12 text-center text-[var(--muted)]">
								<div className="inline-flex items-center gap-2">
									<svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									Loading leaderboard...
								</div>
							</div>
						)}

						{/* Table rows */}
						{!isLoading && data.map((org, index) => (
							<a
								key={org.name}
								href={`https://github.com/${org.name}`}
								target="_blank"
								rel="noopener noreferrer"
								className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)] transition-colors cursor-pointer ${
									index === 0 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
								}`}
							>
								<div className="col-span-1 flex items-center">
									{index < 3 ? (
										<span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
											index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
											index === 1 ? 'bg-gray-400/20 text-gray-400' :
											'bg-amber-600/20 text-amber-600'
										}`}>
											{index + 1}
										</span>
									) : (
										<span className="text-[var(--muted)] pl-2">{index + 1}</span>
									)}
								</div>
								<div className="col-span-5 flex items-center gap-3">
									<img
										src={`${org.avatarUrl}?s=64`}
										alt={org.name}
										className="w-8 h-8 rounded-lg"
									/>
									<div className="min-w-0">
										<span className="font-medium truncate block">{org.name}</span>
										{org.description && (
											<span className="text-xs text-[var(--muted)] truncate block max-w-[200px]">
												{org.description}
											</span>
										)}
									</div>
								</div>
								<div className="col-span-2 text-right font-mono text-sm flex items-center justify-end">
									{formatNumber(org.stars)}
								</div>
								<div className="col-span-2 text-right font-mono text-sm flex items-center justify-end text-[var(--muted)]">
									{org.repos}
								</div>
								<div className="col-span-2 text-right flex items-center justify-end">
									<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] font-bold text-sm">
										{org.activityScore}
									</span>
								</div>
							</a>
						))}

						{/* Empty state */}
						{!isLoading && data.length === 0 && (
							<div className="px-6 py-12 text-center text-[var(--muted)]">
								No organizations found for this category.
							</div>
						)}
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
										Activity scores are calculated using stars-per-repo (70%) and follower count (30%).
										This rewards quality over quantity—organizations with fewer but more impactful
										repositories rank higher. Data is refreshed every 30 minutes.
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
							<Link href="/downloads">
								<Button>Download for Mac</Button>
							</Link>
							<Link href="/downloads">
								<Button variant="secondary">Download for Windows</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
