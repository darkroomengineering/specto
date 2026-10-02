'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { LeaderboardCategory, OrgStats } from '@/lib/github'

const LEADERBOARD_CATEGORIES = [
	{ value: 'developer-favorites', label: 'Developer Favorites' },
	{ value: 'frameworks', label: 'Frameworks' },
	{ value: 'databases', label: 'Databases & Infra' },
	{ value: 'rising-stars', label: 'Rising Stars' },
] as const

function formatNumber(num: number): string {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}k`
	}
	return num.toString()
}

function RankBadge({ rank }: { rank: number }) {
	if (rank === 1) {
		return (
			<div className="relative">
				<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
					<svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
						<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
					</svg>
				</div>
				<div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-bold text-yellow-900">
					1
				</div>
			</div>
		)
	}
	if (rank === 2) {
		return (
			<div className="relative">
				<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30">
					<svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
						<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
					</svg>
				</div>
				<div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700">
					2
				</div>
			</div>
		)
	}
	return (
		<div className="relative">
			<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
				<svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
				</svg>
			</div>
			<div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-amber-900">
				3
			</div>
		</div>
	)
}

interface HeroLeaderboardProps {
	initialData: OrgStats[]
	initialCategory?: LeaderboardCategory
}

export function HeroLeaderboard({
	initialData,
	initialCategory = 'developer-favorites',
}: HeroLeaderboardProps) {
	const [data, setData] = useState(initialData)
	const [category, setCategory] = useState<LeaderboardCategory>(initialCategory)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (category === initialCategory) {
			setData(initialData)
			return
		}

		setIsLoading(true)
		fetch(`/api/leaderboard?category=${category}`, { cache: 'no-store' })
			.then((res) => res.json())
			.then((json) => {
				setData(json.data || [])
			})
			.catch((err) => {
				console.error('Failed to fetch leaderboard:', err)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}, [category, initialCategory, initialData])

	const heroOrgs = data.slice(0, 3).map((org, index) => ({
		rank: index + 1,
		name: org.name,
		avatarUrl: org.avatarUrl,
		score: org.activityScore,
		repos: formatNumber(org.repos),
		followers: formatNumber(org.followers),
		stars: formatNumber(org.stars),
	}))

	return (
		<div
			className="relative max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
			role="region"
			aria-label="Organization leaderboard"
		>
			{/* Glow effect behind */}
			<div
				className="absolute -inset-4 bg-gradient-to-r from-[var(--accent)]/20 via-transparent to-[var(--accent)]/20 rounded-3xl blur-2xl opacity-50"
				aria-hidden="true"
			/>

			<div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm shadow-2xl overflow-hidden">
				{/* Header with Category Selector */}
				<div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] to-[var(--background)]">
					<div className="flex items-center gap-2">
						<svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
							<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
						</svg>
						<div className="relative">
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value as LeaderboardCategory)}
								aria-label="Select leaderboard category"
								className="appearance-none font-semibold text-sm sm:text-base bg-transparent border-none cursor-pointer pr-6 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 hover:text-[var(--accent)] transition-colors rounded"
							>
								{LEADERBOARD_CATEGORIES.map((cat) => (
									<option
										key={cat.value}
										value={cat.value}
										className="bg-[var(--card)] text-[var(--foreground)]"
									>
										{cat.label}
									</option>
								))}
							</select>
							<svg
								className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					</div>
					<span className="text-xs text-[var(--muted)] hidden sm:inline">
						{isLoading ? 'Loading...' : 'Updated 5 min ago'}
					</span>
				</div>

				{/* Leaderboard entries */}
				<div
					className="divide-y divide-[var(--border)]"
					role="list"
					aria-label="Top organizations"
					aria-live="polite"
					aria-busy={isLoading}
				>
					{isLoading
						? // Loading skeleton
							[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 animate-pulse"
								>
									<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--border)]" />
									<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--border)]" />
									<div className="flex-1">
										<div className="h-4 w-24 bg-[var(--border)] rounded mb-2" />
										<div className="h-3 w-32 bg-[var(--border)] rounded" />
									</div>
									<div className="text-right">
										<div className="h-6 w-12 bg-[var(--border)] rounded mb-1" />
										<div className="h-3 w-16 bg-[var(--border)] rounded" />
									</div>
								</div>
							))
						: heroOrgs.map((org, index) => (
								<a
									key={org.name}
									href={`https://github.com/${org.name}`}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Rank ${org.rank}: ${org.name} with ${org.repos} repositories, ${org.stars} stars, and activity score of ${org.score} out of 100`}
									className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 transition-all duration-200 hover:bg-[var(--card-hover)] hover:translate-x-1 cursor-pointer ${
										index === 0 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
									} animate-in fade-in slide-in-from-bottom-2`}
									style={{ animationDelay: `${index * 80}ms` }}
								>
									<RankBadge rank={org.rank} />
									<img
										src={`${org.avatarUrl}?s=80`}
										alt={`${org.name} logo`}
										className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-[var(--border)]"
									/>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sm sm:text-base truncate">{org.name}</p>
										<div
											className="flex items-center gap-3 text-xs text-[var(--muted)]"
											aria-hidden="true"
										>
											<span>{org.repos} repos</span>
											<span className="hidden sm:inline">·</span>
											<span className="hidden sm:inline">{org.stars} stars</span>
										</div>
									</div>
									<div className="text-right" aria-hidden="true">
										<p className="text-lg sm:text-xl font-bold text-[var(--accent)]">
											{org.score}
											<span className="text-xs font-normal text-[var(--muted)] ml-0.5">/100</span>
										</p>
										<p className="text-xs text-[var(--muted)]">activity</p>
									</div>
								</a>
							))}
				</div>

				{/* Footer CTA */}
				<div className="px-4 sm:px-6 py-4 bg-[var(--background)] border-t border-[var(--border)]">
					<Link
						href={`/leaderboard?category=${category}`}
						className="flex items-center justify-center gap-2 text-sm text-[var(--accent)] hover:underline"
					>
						View full rankings
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</Link>
				</div>
			</div>
		</div>
	)
}
