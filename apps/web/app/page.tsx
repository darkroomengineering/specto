import { Button, Card } from '@specto/ui'
import Link from 'next/link'

// Hero leaderboard data
const heroOrgs = [
	{ rank: 1, name: 'vercel', avatarUrl: 'https://avatars.githubusercontent.com/u/14985020', score: 98.7, commits: '12.8k', trend: '+12%' },
	{ rank: 2, name: 'facebook', avatarUrl: 'https://avatars.githubusercontent.com/u/69631', score: 95.2, commits: '11.2k', trend: '+8%' },
	{ rank: 3, name: 'microsoft', avatarUrl: 'https://avatars.githubusercontent.com/u/6154722', score: 93.8, commits: '10.9k', trend: '+15%' },
]

// Leaderboard section data
const topOrgs = [
	{ rank: 1, name: 'vercel', avatarUrl: 'https://avatars.githubusercontent.com/u/14985020', commits: 12847, prs: 3421, contributors: 89 },
	{ rank: 2, name: 'facebook', avatarUrl: 'https://avatars.githubusercontent.com/u/69631', commits: 11203, prs: 2987, contributors: 156 },
	{ rank: 3, name: 'microsoft', avatarUrl: 'https://avatars.githubusercontent.com/u/6154722', commits: 10892, prs: 2654, contributors: 203 },
	{ rank: 4, name: 'google', avatarUrl: 'https://avatars.githubusercontent.com/u/1342004', commits: 9876, prs: 2341, contributors: 178 },
	{ rank: 5, name: 'apple', avatarUrl: 'https://avatars.githubusercontent.com/u/10639145', commits: 8234, prs: 1987, contributors: 92 },
]

// Rank badge component
function RankBadge({ rank }: { rank: number }) {
	if (rank === 1) {
		return (
			<div className="relative">
				<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
					<svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
						<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
					</svg>
				</div>
				<div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-bold text-yellow-900">1</div>
			</div>
		)
	}
	if (rank === 2) {
		return (
			<div className="relative">
				<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30">
					<svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
						<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
					</svg>
				</div>
				<div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700">2</div>
			</div>
		)
	}
	return (
		<div className="relative">
			<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
				<svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
				</svg>
			</div>
			<div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-amber-900">3</div>
		</div>
	)
}

export default function Home() {
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
							Where does your org<br />
							<span className="text-[var(--accent)]">rank globally?</span>
						</h1>
						<p className="text-base sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-6 sm:mb-8">
							Track commits, contributors, and PRs. Compete on the global leaderboard.
							See how your engineering team stacks up against the best.
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
						<p className="text-xs text-[var(--muted)]">
							Also available as <code className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)]">npx specto-cli</code>
						</p>
					</div>

					{/* Hero Leaderboard Preview */}
					<div className="relative max-w-2xl mx-auto">
						{/* Glow effect behind */}
						<div className="absolute -inset-4 bg-gradient-to-r from-[var(--accent)]/20 via-transparent to-[var(--accent)]/20 rounded-3xl blur-2xl opacity-50" />

						<div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm shadow-2xl overflow-hidden">
							{/* Header */}
							<div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] to-[var(--background)]">
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
										<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
									</svg>
									<span className="font-semibold text-sm sm:text-base">Global Leaderboard</span>
								</div>
								<span className="text-xs text-[var(--muted)] hidden sm:inline">Updated 5 min ago</span>
							</div>

							{/* Leaderboard entries */}
							<div className="divide-y divide-[var(--border)]">
								{heroOrgs.map((org, index) => (
									<div
										key={org.name}
										className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 transition-colors hover:bg-[var(--card-hover)] ${
											index === 0 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
										}`}
									>
										<RankBadge rank={org.rank} />
										<img
											src={`${org.avatarUrl}?s=80`}
											alt={org.name}
											className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-[var(--border)]"
										/>
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-sm sm:text-base truncate">{org.name}</p>
											<p className="text-xs text-[var(--muted)]">{org.commits} commits</p>
										</div>
										<div className="text-right">
											<p className="text-lg sm:text-xl font-bold text-[var(--accent)]">{org.score}</p>
											<p className="text-xs text-emerald-500 font-medium">{org.trend}</p>
										</div>
									</div>
								))}
							</div>

							{/* Footer CTA */}
							<div className="px-4 sm:px-6 py-4 bg-[var(--background)] border-t border-[var(--border)]">
								<Link href="/leaderboard" className="flex items-center justify-center gap-2 text-sm text-[var(--accent)] hover:underline">
									View full rankings
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</Link>
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

			{/* Leaderboard */}
			<section id="leaderboard" className="py-24 px-6 bg-[var(--card)] border-t border-[var(--border)]">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">Global Leaderboard</h2>
						<p className="text-[var(--muted)]">See how organizations stack up worldwide</p>
					</div>

					<div className="max-w-3xl mx-auto">
						<div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
							<div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
								<div className="col-span-1">Rank</div>
								<div className="col-span-5">Organization</div>
								<div className="col-span-2 text-right">Commits</div>
								<div className="col-span-2 text-right">PRs</div>
								<div className="col-span-2 text-right">Contributors</div>
							</div>
							{topOrgs.map((org) => (
								<div
									key={org.name}
									className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--card)] transition-colors"
								>
									<div className="col-span-1">
										{org.rank <= 3 ? (
											<span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
												org.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
												org.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
												'bg-amber-600/20 text-amber-600'
											}`}>
												{org.rank}
											</span>
										) : (
											<span className="text-[var(--muted)]">{org.rank}</span>
										)}
									</div>
									<div className="col-span-5 flex items-center gap-3">
										<img
											src={`${org.avatarUrl}?s=64`}
											alt={org.name}
											className="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)]"
										/>
										<span className="font-medium">{org.name}</span>
									</div>
									<div className="col-span-2 text-right font-mono text-sm">
										{org.commits.toLocaleString()}
									</div>
									<div className="col-span-2 text-right font-mono text-sm">
										{org.prs.toLocaleString()}
									</div>
									<div className="col-span-2 text-right font-mono text-sm">
										{org.contributors}
									</div>
								</div>
							))}
						</div>

						<div className="text-center mt-8">
							<Link href="/leaderboard">
								<Button variant="secondary">View Full Leaderboard</Button>
							</Link>
						</div>
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
