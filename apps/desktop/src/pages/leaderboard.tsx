import { useState, useEffect, useCallback } from 'react'
import { Card, Badge } from '@specto/ui'
import { useAuthStore } from '../stores/auth'
import { Spinner } from '../components/spinner'
import {
	fetchLeaderboard,
	LEADERBOARD_CATEGORIES,
	FALLBACK_DATA,
	type OrgStats,
	type LeaderboardCategory,
} from '../lib/api'

interface UserOrgStats {
	login: string
	avatar_url: string
	name: string | null
	description: string | null
	public_repos: number
	followers: number
	score: number
}

function formatNumber(num: number): string {
	if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
	if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
	return num.toString()
}

function RankBadge({ rank }: { rank: number }) {
	if (rank === 1) {
		return (
			<div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
				<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
				</svg>
			</div>
		)
	}
	if (rank === 2) {
		return (
			<div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30">
				<span className="text-sm font-bold text-white">2</span>
			</div>
		)
	}
	if (rank === 3) {
		return (
			<div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
				<span className="text-sm font-bold text-white">3</span>
			</div>
		)
	}
	return (
		<div className="w-8 h-8 rounded-full bg-[var(--card-hover)] flex items-center justify-center">
			<span className="text-sm font-medium text-[var(--muted)]">{rank}</span>
		</div>
	)
}

function ActivityScoreHint() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
			>
				<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				How is this calculated?
			</button>
			{isOpen && (
				<div className="absolute top-full left-0 mt-2 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-xl z-50 w-72">
					<h4 className="font-medium text-sm mb-2">Activity Score (0-100)</h4>
					<p className="text-xs text-[var(--muted)] mb-3">
						Measures quality over quantity using two metrics:
					</p>
					<div className="space-y-2 text-xs">
						<div className="flex items-center justify-between">
							<span className="text-[var(--muted)]">Stars per repo</span>
							<span className="font-medium text-[var(--accent)]">70%</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-[var(--muted)]">Follower count</span>
							<span className="font-medium text-[var(--accent)]">30%</span>
						</div>
					</div>
					<p className="text-xs text-[var(--muted)] mt-3 pt-3 border-t border-[var(--border)]">
						Organizations with fewer but higher-impact repos rank higher than those with many low-star repos.
					</p>
				</div>
			)}
		</div>
	)
}

export function Leaderboard() {
	const [orgs, setOrgs] = useState<OrgStats[]>([])
	const [category, setCategory] = useState<LeaderboardCategory>('developer-favorites')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [userOrgs, setUserOrgs] = useState<UserOrgStats[]>([])
	const { getToken } = useAuthStore()

	// Fetch leaderboard data
	const loadLeaderboard = useCallback(async (cat: LeaderboardCategory) => {
		console.log(`[Leaderboard] Loading category: ${cat}`)
		setIsLoading(true)
		setError(null)

		try {
			const data = await fetchLeaderboard(cat)
			console.log(`[Leaderboard] Received ${data.length} orgs`)
			setOrgs(data)
		} catch (err) {
			console.error('[Leaderboard] Failed to fetch:', err)
			setError('Failed to load leaderboard')
			setOrgs(FALLBACK_DATA[cat])
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Load data when category changes
	useEffect(() => {
		loadLeaderboard(category)
	}, [category, loadLeaderboard])

	// Fetch user's orgs separately
	useEffect(() => {
		async function fetchUserOrgs() {
			try {
				const token = await getToken()
				if (!token) return

				const headers = {
					Accept: 'application/vnd.github+json',
					Authorization: `Bearer ${token}`,
				}

				const userOrgsRes = await fetch('https://api.github.com/user/orgs', { headers })
				if (!userOrgsRes.ok) return

				const userOrgsList = await userOrgsRes.json()
				const userOrgPromises = userOrgsList.slice(0, 5).map(async (org: { login: string }) => {
					try {
						const res = await fetch(`https://api.github.com/orgs/${org.login}`, { headers })
						if (!res.ok) return null
						const data = await res.json()

						const score = Math.min(99, Math.max(10,
							Math.round((data.public_repos * 0.5 + data.followers * 0.3) / 10)
						))

						return {
							login: data.login,
							avatar_url: data.avatar_url,
							name: data.name,
							description: data.description,
							public_repos: data.public_repos,
							followers: data.followers,
							score,
						} as UserOrgStats
					} catch {
						return null
					}
				})

				const userResults = await Promise.all(userOrgPromises)
				setUserOrgs(userResults.filter((o): o is UserOrgStats => o !== null)
					.sort((a, b) => b.score - a.score))
			} catch (err) {
				console.error('Failed to fetch user orgs:', err)
			}
		}

		fetchUserOrgs()
	}, [getToken])

	const handleCategoryChange = (newCategory: LeaderboardCategory) => {
		console.log(`[Leaderboard] Category changed to: ${newCategory}`)
		setCategory(newCategory)
	}

	const currentCategory = LEADERBOARD_CATEGORIES.find(c => c.value === category)

	return (
		<div className="h-full flex flex-col p-8 overflow-auto">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center">
						<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
							<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
						</svg>
					</div>
					<div>
						<h1 className="text-2xl font-semibold text-[var(--foreground)]">Global Leaderboard</h1>
						<p className="text-sm text-[var(--muted)]">
							Top GitHub organizations ranked by activity
						</p>
					</div>
				</div>

				{/* Category Selector */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<label className="text-sm text-[var(--muted)]">Category:</label>
						<div className="relative">
							<select
								value={category}
								onChange={(e) => handleCategoryChange(e.target.value as LeaderboardCategory)}
								className="appearance-none px-4 py-2 pr-10 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-medium cursor-pointer hover:border-[var(--accent)] transition-colors min-w-[200px]"
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
					</div>
					{currentCategory && (
						<span className="text-xs text-[var(--muted)] hidden sm:inline">{currentCategory.description}</span>
					)}
					<div className="ml-auto">
						<ActivityScoreHint />
					</div>
				</div>

				{error && (
					<div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
						{error} - showing cached data
					</div>
				)}
			</div>

			{isLoading ? (
				<div className="flex-1 flex items-center justify-center">
					<Spinner size="lg" />
				</div>
			) : (
				<div className="grid lg:grid-cols-2 gap-6">
					{/* Global Rankings */}
					<Card>
						<Card.Header>
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-medium">Top Organizations</h2>
								<Badge>{currentCategory?.label || 'Global'}</Badge>
							</div>
						</Card.Header>
						<Card.Content className="p-0">
							<div className="divide-y divide-[var(--border)]">
								{orgs.map((org, index) => (
									<button
										key={`${category}-${org.name}`}
										onClick={() => window.open(`https://github.com/${org.name}`, '_blank')}
										className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--card-hover)] transition-colors text-left ${
											index === 0 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
										}`}
									>
										<RankBadge rank={index + 1} />
										<img
											src={`${org.avatarUrl}?s=80`}
											alt={org.name}
											className="w-10 h-10 rounded-lg border border-[var(--border)]"
										/>
										<div className="flex-1 min-w-0">
											<p className="font-medium truncate">{org.name}</p>
											<p className="text-xs text-[var(--muted)] truncate">
												{org.repos} repos · {formatNumber(org.stars)} stars
											</p>
										</div>
										<div className="text-right">
											<p className="text-lg font-bold text-[var(--accent)]">
												{org.activityScore}
												<span className="text-xs font-normal text-[var(--muted)]">/100</span>
											</p>
											<p className="text-xs text-[var(--muted)]">activity</p>
										</div>
									</button>
								))}
							</div>
						</Card.Content>
					</Card>

					{/* Your Organizations */}
					<Card>
						<Card.Header>
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-medium">Your Organizations</h2>
								<Badge variant="success">Personal</Badge>
							</div>
						</Card.Header>
						<Card.Content className="p-0">
							{userOrgs.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-center px-6">
									<div className="w-12 h-12 rounded-full bg-[var(--card-hover)] flex items-center justify-center mb-4">
										<svg className="w-6 h-6 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
										</svg>
									</div>
									<h3 className="text-sm font-medium mb-2">No organizations yet</h3>
									<p className="text-xs text-[var(--muted)] max-w-xs">
										Sign in with GitHub to see your organizations here.
									</p>
								</div>
							) : (
								<div className="divide-y divide-[var(--border)]">
									{userOrgs.map((org, index) => (
										<button
											key={org.login}
											onClick={() => window.open(`https://github.com/${org.login}`, '_blank')}
											className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--card-hover)] transition-colors text-left"
										>
											<RankBadge rank={index + 1} />
											<img
												src={org.avatar_url}
												alt={org.login}
												className="w-10 h-10 rounded-lg border border-[var(--border)]"
											/>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{org.login}</p>
												<p className="text-xs text-[var(--muted)] truncate">
													{org.public_repos} repos · {formatNumber(org.followers)} followers
												</p>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-[var(--accent)]">{org.score}</p>
												<p className="text-xs text-[var(--muted)]">score</p>
											</div>
										</button>
									))}
								</div>
							)}
						</Card.Content>
					</Card>

					{/* Stats Summary */}
					<Card className="lg:col-span-2">
						<Card.Header>
							<h2 className="text-lg font-medium">Category Stats</h2>
						</Card.Header>
						<Card.Content>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<div>
									<p className="text-3xl font-bold text-[var(--accent)]">{orgs.length}</p>
									<p className="text-sm text-[var(--muted)]">Organizations</p>
								</div>
								<div>
									<p className="text-3xl font-bold text-[var(--accent)]">
										{formatNumber(orgs.reduce((sum, o) => sum + o.stars, 0))}
									</p>
									<p className="text-sm text-[var(--muted)]">Total stars</p>
								</div>
								<div>
									<p className="text-3xl font-bold text-[var(--accent)]">
										{formatNumber(orgs.reduce((sum, o) => sum + o.repos, 0))}
									</p>
									<p className="text-sm text-[var(--muted)]">Repositories</p>
								</div>
								<div>
									<p className="text-3xl font-bold text-[var(--accent)]">
										{formatNumber(orgs.reduce((sum, o) => sum + o.followers, 0))}
									</p>
									<p className="text-sm text-[var(--muted)]">Followers</p>
								</div>
							</div>
						</Card.Content>
					</Card>
				</div>
			)}
		</div>
	)
}
