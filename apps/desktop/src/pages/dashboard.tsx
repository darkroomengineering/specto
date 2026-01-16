import { Card, Stat } from '@specto/ui'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { Spinner } from '../components/spinner'

interface UserStats {
	publicRepos: number
	followers: number
	following: number
	totalStars: number
	recentCommits: number
	recentPRs: number
	orgs: Array<{ login: string; avatar_url: string }>
}

export function Dashboard() {
	const [userStats, setUserStats] = useState<UserStats | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const navigate = useNavigate()
	const { username, getToken } = useAuthStore()

	useEffect(() => {
		async function fetchUserStats() {
			try {
				const token = await getToken()
				if (!token) return

				const headers = {
					Authorization: `Bearer ${token}`,
					Accept: 'application/vnd.github+json',
				}

				// Fetch user data, repos, and orgs in parallel
				const [userRes, reposRes, orgsRes] = await Promise.all([
					fetch('https://api.github.com/user', { headers }),
					fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', { headers }),
					fetch('https://api.github.com/user/orgs', { headers }),
				])

				const user = await userRes.json()
				const repos = await reposRes.json()
				const orgs = await orgsRes.json()

				// Calculate total stars
				const totalStars = repos.reduce((sum: number, repo: { stargazers_count?: number }) =>
					sum + (repo.stargazers_count || 0), 0)

				// Get recent activity (last 30 days)
				const thirtyDaysAgo = new Date()
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
				const since = thirtyDaysAgo.toISOString()

				// Get recent commits from user's repos
				let recentCommits = 0
				let recentPRs = 0

				// Sample first 5 repos for recent activity
				const recentRepos = repos.slice(0, 5)
				await Promise.all(
					recentRepos.map(async (repo: { full_name: string }) => {
						try {
							const [commitsRes, prsRes] = await Promise.all([
								fetch(
									`https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${since}&per_page=100`,
									{ headers }
								),
								fetch(
									`https://api.github.com/repos/${repo.full_name}/pulls?state=all&per_page=100`,
									{ headers }
								),
							])

							if (commitsRes.ok) {
								const commits = await commitsRes.json()
								recentCommits += commits.length
							}

							if (prsRes.ok) {
								const prs = await prsRes.json()
								// Filter PRs by user and date
								const userPRs = prs.filter((pr: { user?: { login: string }; created_at: string }) =>
									pr.user?.login === username &&
									new Date(pr.created_at) > thirtyDaysAgo
								)
								recentPRs += userPRs.length
							}
						} catch {
							// Skip errors for individual repos
						}
					})
				)

				setUserStats({
					publicRepos: user.public_repos || 0,
					followers: user.followers || 0,
					following: user.following || 0,
					totalStars,
					recentCommits,
					recentPRs,
					orgs: orgs || [],
				})
			} catch (err) {
				console.error('Failed to fetch user stats:', err)
			} finally {
				setIsLoading(false)
			}
		}

		fetchUserStats()
	}, [username, getToken])

	return (
		<div className="h-full flex flex-col p-8 overflow-auto">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-semibold text-[var(--foreground)]">
					Welcome back, <span className="text-[var(--accent)]">{username}</span>
				</h1>
				<p className="text-sm text-[var(--muted)] mt-2">
					Your GitHub activity at a glance
				</p>
			</div>

			{/* User stats */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
				<Stat
					label="Repositories"
					value={isLoading ? <Spinner size="sm" /> : userStats?.publicRepos ?? '—'}
					description="Public repos"
				/>
				<Stat
					label="Total Stars"
					value={isLoading ? <Spinner size="sm" /> : userStats?.totalStars ?? '—'}
					description="Across all repos"
				/>
				<Stat
					label="Commits"
					value={isLoading ? <Spinner size="sm" /> : userStats?.recentCommits ?? '—'}
					description="Last 30 days"
				/>
				<Stat
					label="Pull Requests"
					value={isLoading ? <Spinner size="sm" /> : userStats?.recentPRs ?? '—'}
					description="Last 30 days"
				/>
			</div>

			{/* Organizations */}
			{userStats && userStats.orgs.length > 0 && (
				<Card className="mb-8">
					<Card.Header>
						<h2 className="text-lg font-medium">Your Organizations</h2>
					</Card.Header>
					<Card.Content>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
							{userStats.orgs.map((org) => (
								<button
									key={org.login}
									onClick={() => navigate(`/org/${org.login}`)}
									className="flex flex-col items-center gap-3 p-5 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--card-hover)] transition-all text-center group"
								>
									<img
										src={org.avatar_url}
										alt={org.login}
										className="w-12 h-12 rounded-lg group-hover:scale-105 transition-transform"
									/>
									<span className="text-sm font-medium truncate w-full">{org.login}</span>
								</button>
							))}
						</div>
					</Card.Content>
				</Card>
			)}

			{/* Empty state for users without orgs */}
			{userStats && userStats.orgs.length === 0 && (
				<Card className="flex-1">
					<Card.Content className="flex flex-col items-center justify-center h-full py-12 text-center">
						<div className="w-12 h-12 rounded-full bg-[var(--card-hover)] flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
							</svg>
						</div>
						<h3 className="text-sm font-medium mb-1">No organizations yet</h3>
						<p className="text-xs text-[var(--muted)] max-w-xs">
							Search for any GitHub organization using the search bar above to explore their metrics.
						</p>
					</Card.Content>
				</Card>
			)}

			{/* Loading state */}
			{isLoading && (
				<Card className="flex-1">
					<Card.Content className="flex items-center justify-center h-full">
						<Spinner size="lg" />
					</Card.Content>
				</Card>
			)}
		</div>
	)
}
