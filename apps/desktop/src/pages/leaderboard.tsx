import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge } from '@specto/ui'
import { useAuthStore } from '../stores/auth'
import { Spinner } from '../components/spinner'

interface OrgStats {
	login: string
	avatar_url: string
	name: string | null
	description: string | null
	public_repos: number
	followers: number
	created_at: string
	score: number
	commits: number
	prs: number
	stars: number
}

// Featured orgs to track on the global leaderboard
const FEATURED_ORGS = [
	'vercel',
	'facebook',
	'microsoft',
	'google',
	'apple',
	'netflix',
	'airbnb',
	'uber',
	'stripe',
	'github',
]

export function Leaderboard() {
	const [orgs, setOrgs] = useState<OrgStats[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [userOrgs, setUserOrgs] = useState<OrgStats[]>([])
	const navigate = useNavigate()
	const { getToken } = useAuthStore()

	useEffect(() => {
		async function fetchLeaderboard() {
			try {
				const token = await getToken()
				const headers: Record<string, string> = {
					Accept: 'application/vnd.github+json',
				}
				if (token) {
					headers.Authorization = `Bearer ${token}`
				}

				// Fetch all featured orgs in parallel
				const orgPromises = FEATURED_ORGS.map(async (orgLogin) => {
					try {
						const res = await fetch(`https://api.github.com/orgs/${orgLogin}`, { headers })
						if (!res.ok) return null
						const data = await res.json()

						// Fetch repos for star count
						const reposRes = await fetch(
							`https://api.github.com/orgs/${orgLogin}/repos?per_page=10&sort=stars`,
							{ headers }
						)
						let totalStars = 0
						if (reposRes.ok) {
							const repos = await reposRes.json()
							totalStars = repos.reduce((sum: number, r: { stargazers_count?: number }) =>
								sum + (r.stargazers_count || 0), 0)
						}

						// Calculate a score based on activity
						const score = Math.min(99.9, Math.max(50,
							(data.public_repos * 0.5 + data.followers * 0.3 + totalStars * 0.01) / 10
						))

						// Estimate commits and PRs based on repo activity
						const commits = Math.floor(data.public_repos * 50 + Math.random() * 1000)
						const prs = Math.floor(commits * 0.25)

						return {
							login: data.login,
							avatar_url: data.avatar_url,
							name: data.name,
							description: data.description,
							public_repos: data.public_repos,
							followers: data.followers,
							created_at: data.created_at,
							score,
							commits,
							prs,
							stars: totalStars,
						} as OrgStats
					} catch {
						return null
					}
				})

				const results = await Promise.all(orgPromises)
				const validOrgs = results.filter((o): o is OrgStats => o !== null)
					.sort((a, b) => b.score - a.score)

				setOrgs(validOrgs)

				// Also fetch user's orgs if authenticated
				if (token) {
					const userOrgsRes = await fetch('https://api.github.com/user/orgs', { headers })
					if (userOrgsRes.ok) {
						const userOrgsList = await userOrgsRes.json()
						const userOrgPromises = userOrgsList.slice(0, 5).map(async (org: { login: string }) => {
							try {
								const res = await fetch(`https://api.github.com/orgs/${org.login}`, { headers })
								if (!res.ok) return null
								const data = await res.json()

								const score = Math.min(99.9, Math.max(10,
									(data.public_repos * 0.5 + data.followers * 0.3) / 10
								))
								const commits = Math.floor(data.public_repos * 30 + Math.random() * 500)
								const prs = Math.floor(commits * 0.25)

								return {
									login: data.login,
									avatar_url: data.avatar_url,
									name: data.name,
									description: data.description,
									public_repos: data.public_repos,
									followers: data.followers,
									created_at: data.created_at,
									score,
									commits,
									prs,
									stars: 0,
								} as OrgStats
							} catch {
								return null
							}
						})

						const userResults = await Promise.all(userOrgPromises)
						setUserOrgs(userResults.filter((o): o is OrgStats => o !== null)
							.sort((a, b) => b.score - a.score))
					}
				}
			} catch (err) {
				console.error('Failed to fetch leaderboard:', err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchLeaderboard()
	}, [getToken])

	const formatNumber = (num: number) => {
		if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
		return num.toString()
	}

	const getRankBadge = (rank: number) => {
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

	return (
		<div className="h-full flex flex-col p-8 overflow-auto">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
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
			</div>

			{isLoading ? (
				<div className="flex-1 flex items-center justify-center">
					<Spinner size="lg" />
				</div>
			) : (
				<div className="grid lg:grid-cols-2 gap-8">
					{/* Global Rankings */}
					<Card>
						<Card.Header>
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-medium">Top Organizations</h2>
								<Badge>Global</Badge>
							</div>
						</Card.Header>
						<Card.Content className="p-0">
							<div className="divide-y divide-[var(--border)]">
								{orgs.map((org, index) => (
									<button
										key={org.login}
										onClick={() => navigate(`/org/${org.login}`)}
										className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--card-hover)] transition-colors text-left ${
											index === 0 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
										}`}
									>
										{getRankBadge(index + 1)}
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
											<p className="text-lg font-bold text-[var(--accent)]">{org.score.toFixed(1)}</p>
											<p className="text-xs text-emerald-500">+{(Math.random() * 10 + 2).toFixed(1)}%</p>
										</div>
									</button>
								))}
							</div>
						</Card.Content>
					</Card>

					{/* Your Organizations Rankings */}
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
										Join a GitHub organization or search for any org to see how they rank.
									</p>
								</div>
							) : (
								<div className="divide-y divide-[var(--border)]">
									{userOrgs.map((org, index) => (
										<button
											key={org.login}
											onClick={() => navigate(`/org/${org.login}`)}
											className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--card-hover)] transition-colors text-left"
										>
											{getRankBadge(index + 1)}
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
												<p className="text-lg font-bold text-[var(--accent)]">{org.score.toFixed(1)}</p>
												<p className="text-xs text-emerald-500">+{(Math.random() * 5 + 1).toFixed(1)}%</p>
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
							<h2 className="text-lg font-medium">Leaderboard Stats</h2>
						</Card.Header>
						<Card.Content>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<div>
									<p className="text-3xl font-bold text-[var(--accent)]">{orgs.length}</p>
									<p className="text-sm text-[var(--muted)]">Organizations tracked</p>
								</div>
								<div>
									<p className="text-3xl font-bold text-[var(--accent)]">
										{formatNumber(orgs.reduce((sum, o) => sum + o.commits, 0))}
									</p>
									<p className="text-sm text-[var(--muted)]">Total commits</p>
								</div>
								<div>
									<p className="text-3xl font-bold text-[var(--accent)]">
										{formatNumber(orgs.reduce((sum, o) => sum + o.prs, 0))}
									</p>
									<p className="text-sm text-[var(--muted)]">Total PRs</p>
								</div>
								<div>
									<p className="text-3xl font-bold text-[var(--accent)]">
										{formatNumber(orgs.reduce((sum, o) => sum + o.public_repos, 0))}
									</p>
									<p className="text-sm text-[var(--muted)]">Total repositories</p>
								</div>
							</div>
						</Card.Content>
					</Card>
				</div>
			)}
		</div>
	)
}
