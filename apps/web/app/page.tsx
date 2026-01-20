import { Button, Card } from '@specto/ui'
import Link from 'next/link'
import { getLeaderboardData, fallbackLeaderboardData } from '@/lib/github'
import { HeroLeaderboard } from '@/components/hero-leaderboard'

// Format number for display
function formatNumber(num: number): string {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + 'M'
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + 'k'
	}
	return num.toString()
}

export default async function Home() {
	// Fetch live leaderboard data for initial render
	let leaderboardData = fallbackLeaderboardData
	try {
		leaderboardData = await getLeaderboardData()
		if (leaderboardData.length === 0) {
			leaderboardData = fallbackLeaderboardData
		}
	} catch {
		// Use fallback data on error
	}

	return (
		<div className="min-h-screen bg-[var(--background)]">
			{/* Hero section */}
			<section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
				{/* Background effects */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
					<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
				</div>

				<div className="relative max-w-6xl mx-auto">
					{/* Header content */}
					<div className="text-center mb-12 sm:mb-16">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-xs text-[var(--accent)] mb-6">
							<span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
							Live rankings updated every hour
						</div>
						<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-4 sm:mb-6 leading-tight">
							Organization-wide<br />
							<span className="text-[var(--accent)]">GitHub Analytics</span>
						</h1>
						<p className="text-base sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-6 sm:mb-8">
							GitHub only shows per-repository insights. Specto gives you the full picture—aggregate
							commits, contributors, and activity across your entire organization.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
							<Link href="/downloads" className="w-full sm:w-auto">
								<Button size="lg" className="w-full sm:w-auto">
									<span className="flex items-center justify-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
										Download for Mac
									</span>
								</Button>
							</Link>
							<Link href="/downloads" className="w-full sm:w-auto">
								<Button variant="secondary" size="lg" className="w-full sm:w-auto">
									<span className="flex items-center justify-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
										Download for Windows
									</span>
								</Button>
							</Link>
						</div>
						<p className="text-xs text-[var(--muted)] mb-4">
							Also available as <code className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)]">npx specto-cli</code>
						</p>
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-500">
							<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
							100% local — uses your GitHub CLI auth, data never leaves your machine
						</div>
					</div>

					{/* Hero Leaderboard Preview */}
					<HeroLeaderboard initialData={leaderboardData} initialCategory="developer-favorites" />
				</div>
			</section>

			{/* Why Specto */}
			<section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-[var(--border)]">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">GitHub's blind spot</h2>
						<p className="text-[var(--muted)] max-w-2xl mx-auto">
							GitHub Insights only works at the repository level. There's no way to see organization-wide metrics—until now.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 gap-6 mb-12">
						<div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]">
							<div className="flex items-center gap-2 mb-4">
								<svg className="w-5 h-5 text-[var(--muted)]" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
								<h3 className="font-semibold">GitHub Insights</h3>
							</div>
							<ul className="space-y-2 text-sm text-[var(--muted)]">
								<li className="flex items-start gap-2">
									<span className="text-red-500 mt-0.5">✗</span>
									Per-repository only
								</li>
								<li className="flex items-start gap-2">
									<span className="text-red-500 mt-0.5">✗</span>
									No org-wide aggregation
								</li>
								<li className="flex items-start gap-2">
									<span className="text-red-500 mt-0.5">✗</span>
									Can't compare contributors across repos
								</li>
								<li className="flex items-start gap-2">
									<span className="text-red-500 mt-0.5">✗</span>
									Limited to 90 days
								</li>
							</ul>
						</div>

						<div className="p-6 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/5">
							<div className="flex items-center gap-2 mb-4">
								<div className="w-5 h-5 rounded bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">S</div>
								<h3 className="font-semibold">Specto</h3>
							</div>
							<ul className="space-y-2 text-sm text-[var(--muted)]">
								<li className="flex items-start gap-2">
									<span className="text-emerald-500 mt-0.5">✓</span>
									<span><strong className="text-[var(--foreground)]">Organization-wide</strong> analytics</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-emerald-500 mt-0.5">✓</span>
									Aggregate all repos automatically
								</li>
								<li className="flex items-start gap-2">
									<span className="text-emerald-500 mt-0.5">✓</span>
									Cross-repo contributor rankings
								</li>
								<li className="flex items-start gap-2">
									<span className="text-emerald-500 mt-0.5">✓</span>
									Unlimited history with Pro
								</li>
							</ul>
						</div>
					</div>

					{/* Privacy callout */}
					<div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
						<div className="flex flex-col sm:flex-row items-start gap-4">
							<div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
								<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>
							<div>
								<h3 className="font-semibold text-emerald-500 mb-1">Your data stays on your machine</h3>
								<p className="text-sm text-[var(--muted)]">
									Specto uses your local <code className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] text-xs">gh</code> (GitHub CLI) authentication.
									Your private repository data is fetched directly from GitHub to your computer—<strong className="text-[var(--foreground)]">nothing is ever sent to Specto servers</strong>.
									We can't see your code, commits, or organization data.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="py-24 px-6 border-t border-[var(--border)]">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">Three ways to track</h2>
						<p className="text-[var(--muted)]">Choose the interface that fits your workflow</p>
					</div>
					<div className="grid md:grid-cols-3 gap-6">
						<Card hover>
							<Card.Content className="py-8">
								<div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-4">
									<svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold mb-2">CLI</h3>
								<p className="text-sm text-[var(--muted)] mb-4">
									Quick metrics from your terminal. Perfect for scripts, CI/CD pipelines, and automation.
								</p>
								<code className="text-xs px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)]">
									specto vercel --commits
								</code>
							</Card.Content>
						</Card>
						<Card hover className="border-[var(--accent)]">
							<Card.Content className="py-8">
								<div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--accent)] text-white">
									Popular
								</div>
								<div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-4">
									<svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold mb-2">Desktop App</h3>
								<p className="text-sm text-[var(--muted)] mb-4">
									Native macOS and Windows app with a beautiful UI. Track multiple orgs, view history, export reports.
								</p>
								<Link href="/downloads">
									<Button size="sm">Download Now</Button>
								</Link>
							</Card.Content>
						</Card>
						<Card hover>
							<Card.Content className="py-8">
								<div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-4">
									<svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold mb-2">Web Dashboard</h3>
								<p className="text-sm text-[var(--muted)] mb-4">
									Access metrics from anywhere. Share dashboards with your team. Coming soon with team features.
								</p>
								<span className="text-xs text-[var(--muted)]">Coming soon</span>
							</Card.Content>
						</Card>
					</div>
				</div>
			</section>

			{/* Desktop App Preview */}
			<section id="app" className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--card)] border-t border-[var(--border)]">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-8 sm:mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">Org-Wide Analysis</h2>
						<p className="text-[var(--muted)] max-w-xl mx-auto">
							See what GitHub can't show you—aggregated metrics across all repositories, teams, and contributors in your organization.
						</p>
					</div>

					{/* Desktop App Mockup */}
					<div className="relative max-w-5xl mx-auto">
						{/* Glow effect */}
						<div className="absolute -inset-4 bg-gradient-to-r from-[var(--accent)]/10 via-transparent to-[var(--accent)]/10 rounded-3xl blur-2xl opacity-50" />

						<div className="relative rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden">
							{/* Window chrome */}
							<div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
								<div className="flex gap-1.5">
									<div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
									<div className="w-3 h-3 rounded-full bg-[#febc2e]" />
									<div className="w-3 h-3 rounded-full bg-[#28c840]" />
								</div>
								<span className="flex-1 text-center text-xs text-[var(--muted)]">Specto — vercel</span>
							</div>

							{/* App content */}
							<div className="flex min-h-[400px] sm:min-h-[500px]">
								{/* Sidebar */}
								<div className="hidden sm:flex w-48 border-r border-[var(--border)] bg-[var(--card)] flex-col">
									<nav className="p-2 pt-3">
										<div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] transition-colors">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
											</svg>
											<span>Dashboard</span>
										</div>
									</nav>
									<div className="px-2 mt-1 flex-1">
										<p className="px-3 py-1.5 text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">Recents</p>
										<div className="space-y-0.5">
											{leaderboardData.slice(0, 3).map((org) => (
												<div key={org.name} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${org.name === 'vercel' ? 'bg-[var(--card-hover)] text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
													<img src={`${org.avatarUrl}?s=32`} alt="" className="w-4 h-4 rounded" />
													<span className="truncate">{org.name}</span>
												</div>
											))}
										</div>
									</div>
									<div className="p-2 border-t border-[var(--border)]">
										<div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--muted)]">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											<span>Settings</span>
										</div>
									</div>
								</div>

								{/* Main content - Organization view */}
								<div className="flex-1 p-4 sm:p-6 overflow-hidden">
									{/* Header */}
									<div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
										<div>
											<p className="text-xs text-[var(--muted)] mb-1">← back</p>
											<h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
												vercel
												<span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-500">Connected</span>
											</h2>
											<p className="text-xs sm:text-sm text-[var(--muted)] mt-1">Develop. Preview. Ship.</p>
										</div>
										<div className="flex gap-2">
											<select className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs">
												<option>Last 30 days</option>
											</select>
											<select className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs">
												<option>Commits</option>
											</select>
										</div>
									</div>

									{/* Stats grid */}
									<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
										{[
											{ label: 'Repositories', value: formatNumber(leaderboardData[0]?.repos || 156), desc: 'Public repos' },
											{ label: 'Stars', value: formatNumber(leaderboardData[0]?.stars || 450000), desc: 'Across all repos' },
											{ label: 'Followers', value: formatNumber(leaderboardData[0]?.followers || 8900), desc: 'Org followers' },
											{ label: 'Activity Score', value: leaderboardData[0]?.activityScore?.toString() || '95', desc: 'Relative score' },
										].map((stat) => (
											<div key={stat.label} className="p-3 sm:p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
												<p className="text-xl sm:text-2xl font-bold text-[var(--accent)]">{stat.value}</p>
												<p className="text-[10px] sm:text-xs font-medium">{stat.label}</p>
												<p className="text-[9px] sm:text-[10px] text-[var(--muted)]">{stat.desc}</p>
											</div>
										))}
									</div>

									{/* Secondary stats */}
									<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
										{[
											{ label: 'Members', value: '89', desc: 'Organization members' },
											{ label: 'Teams', value: '12', desc: 'Active teams' },
											{ label: 'Contributors', value: '234', desc: 'Active contributors' },
											{ label: 'Open Issues', value: '1.2k', desc: 'Across all repos' },
										].map((stat) => (
											<div key={stat.label} className="p-3 sm:p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
												<p className="text-xl sm:text-2xl font-bold text-[var(--accent)]">{stat.value}</p>
												<p className="text-[10px] sm:text-xs font-medium">{stat.label}</p>
												<p className="text-[9px] sm:text-[10px] text-[var(--muted)]">{stat.desc}</p>
											</div>
										))}
									</div>

									{/* Tables */}
									<div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
										{/* Top Contributors */}
										<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
											<div className="px-4 py-3 border-b border-[var(--border)]">
												<h3 className="text-sm font-medium">Top Contributors (Commits)</h3>
											</div>
											<div className="divide-y divide-[var(--border)]">
												{['rauchg', 'timneutkens', 'shuding', 'sokra', 'Timer'].map((author, i) => (
													<div key={author} className="flex items-center justify-between px-4 py-2 text-sm">
														<span className="font-medium">{author}</span>
														<div className="flex items-center gap-4">
															<span className="text-[var(--accent)]">{Math.floor(1200 / (i + 1))}</span>
															<span className="text-[var(--muted)] text-xs">{(30 - i * 5).toFixed(1)}%</span>
														</div>
													</div>
												))}
											</div>
										</div>

										{/* Teams */}
										<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
											<div className="px-4 py-3 border-b border-[var(--border)]">
												<h3 className="text-sm font-medium">Teams</h3>
											</div>
											<div className="divide-y divide-[var(--border)]">
												{[
													{ name: 'Next.js', privacy: 'visible', members: 23 },
													{ name: 'Turborepo', privacy: 'visible', members: 15 },
													{ name: 'Infrastructure', privacy: 'secret', members: 8 },
													{ name: 'Design', privacy: 'visible', members: 12 },
													{ name: 'Security', privacy: 'secret', members: 5 },
												].map((team) => (
													<div key={team.name} className="flex items-center justify-between px-4 py-2 text-sm">
														<span className="font-medium">{team.name}</span>
														<div className="flex items-center gap-3">
															<span className={`px-1.5 py-0.5 rounded text-[10px] ${team.privacy === 'secret' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
																{team.privacy}
															</span>
															<span className="text-[var(--muted)]">{team.members}</span>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="text-center mt-8">
						<Link href="/downloads">
							<Button>Download Desktop App</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section id="pricing" className="py-24 px-6 border-t border-[var(--border)]">
				<div className="max-w-6xl mx-auto text-center">
					<h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
					<p className="text-[var(--muted)] mb-12">Start free, upgrade when you need more</p>

					<div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
						<Card>
							<Card.Content className="py-8">
								<h3 className="text-lg font-semibold mb-2">Free</h3>
								<p className="text-3xl font-bold mb-4">$0</p>
								<ul className="text-sm text-[var(--muted)] space-y-2 mb-6">
									<li>✓ CLI (open source)</li>
									<li>✓ Basic desktop app</li>
									<li>✓ 30-day history</li>
									<li>✓ 5 organizations</li>
								</ul>
								<Link href="/downloads">
									<Button variant="secondary" className="w-full">Download Free</Button>
								</Link>
							</Card.Content>
						</Card>
						<Card className="border-[var(--accent)]">
							<Card.Content className="py-8">
								<h3 className="text-lg font-semibold mb-2">Pro</h3>
								<p className="text-3xl font-bold mb-4">$8<span className="text-sm font-normal text-[var(--muted)]">/mo</span></p>
								<ul className="text-sm text-[var(--muted)] space-y-2 mb-6">
									<li>✓ Everything in Free</li>
									<li>✓ Unlimited history</li>
									<li>✓ Unlimited organizations</li>
									<li>✓ Export reports (CSV, JSON)</li>
									<li>✓ API access</li>
									<li>✓ Team comparisons</li>
								</ul>
								<Link href="/api/checkout?products=b4ffc79f-8224-40fe-898e-af3e972c7d53">
									<Button className="w-full">Upgrade to Pro</Button>
								</Link>
							</Card.Content>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-24 px-6 border-t border-[var(--border)] bg-[var(--card)]">
				<div className="max-w-6xl mx-auto text-center">
					<h2 className="text-3xl font-bold mb-4">Ready to dive in?</h2>
					<p className="text-[var(--muted)] mb-8">
						Download the app or install the CLI to get started in seconds.
					</p>
					<div className="flex items-center justify-center gap-4 mb-6">
						<Link href="/downloads">
							<Button size="lg">Download for Mac</Button>
						</Link>
						<Link href="/downloads">
							<Button variant="secondary" size="lg">Download for Windows</Button>
						</Link>
					</div>
					<code className="inline-block px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm">
						npm install -g specto-cli
					</code>
				</div>
			</section>
		</div>
	)
}
