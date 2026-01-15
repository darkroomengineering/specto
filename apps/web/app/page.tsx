import { Button, Card } from '@specto/ui'
import Link from 'next/link'

// Mock leaderboard data - in production this would come from an API
const topOrgs = [
	{ rank: 1, name: 'vercel', avatarUrl: 'https://avatars.githubusercontent.com/u/14985020', commits: 12847, prs: 3421, contributors: 89 },
	{ rank: 2, name: 'facebook', avatarUrl: 'https://avatars.githubusercontent.com/u/69631', commits: 11203, prs: 2987, contributors: 156 },
	{ rank: 3, name: 'microsoft', avatarUrl: 'https://avatars.githubusercontent.com/u/6154722', commits: 10892, prs: 2654, contributors: 203 },
	{ rank: 4, name: 'google', avatarUrl: 'https://avatars.githubusercontent.com/u/1342004', commits: 9876, prs: 2341, contributors: 178 },
	{ rank: 5, name: 'apple', avatarUrl: 'https://avatars.githubusercontent.com/u/10639145', commits: 8234, prs: 1987, contributors: 92 },
]

export default function Home() {
	return (
		<div className="min-h-screen bg-[var(--background)]">
			{/* Hero section */}
			<section className="pt-32 pb-16 px-6">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--muted)] mb-6">
							<span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
							Now tracking 10,000+ organizations
						</div>
						<h1 className="text-6xl font-bold text-[var(--foreground)] mb-6 leading-tight">
							GitHub metrics,<br />
							<span className="text-[var(--accent)]">beautifully tracked</span>
						</h1>
						<p className="text-xl text-[var(--muted)] max-w-2xl mx-auto mb-8">
							Track commits, contributors, pull requests, and more across your GitHub organizations.
							See how your team stacks up on the global leaderboard.
						</p>
						<div className="flex items-center justify-center gap-4 mb-4">
							<Link href="/downloads">
								<Button size="lg">
									<span className="flex items-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
										Download for Mac
									</span>
								</Button>
							</Link>
							<Link href="/downloads">
								<Button variant="secondary" size="lg">
									<span className="flex items-center gap-2">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5.557l7.357-1.002v7.082H3V5.557zm0 12.886l7.357 1.002v-7.082H3v6.08zm8.146 1.122L21 21v-8.637h-9.854v7.202zm0-14.13v7.202H21V3l-9.854 1.435z"/></svg>
										Download for Windows
									</span>
								</Button>
							</Link>
						</div>
						<p className="text-xs text-[var(--muted)]">
							Also available as <code className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)]">npm i -g specto-cli</code>
						</p>
					</div>

					{/* App Preview */}
					<div className="relative max-w-4xl mx-auto">
						<div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10 pointer-events-none" />
						<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden">
							{/* Window chrome */}
							<div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
								<div className="flex gap-1.5">
									<div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
									<div className="w-3 h-3 rounded-full bg-[#febc2e]" />
									<div className="w-3 h-3 rounded-full bg-[#28c840]" />
								</div>
								<span className="flex-1 text-center text-xs text-[var(--muted)]">Specto</span>
							</div>
							{/* App content mockup */}
							<div className="flex h-[420px]">
								{/* Sidebar */}
								<div className="w-48 border-r border-[var(--border)] bg-[var(--card)] flex flex-col rounded-tr-xl">
									<nav className="p-2 pt-3">
										<div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--accent)] text-white text-sm">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
											</svg>
											<span>Dashboard</span>
										</div>
									</nav>
									<div className="px-2 mt-1 flex-1">
										<p className="px-3 py-1.5 text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">Recents</p>
										<div className="space-y-0.5">
											{['vercel', 'facebook', 'microsoft'].map((org) => (
												<div key={org} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--muted)]">
													<div className="w-4 h-4 rounded bg-[var(--border)] flex items-center justify-center text-[10px]">
														{org.charAt(0).toUpperCase()}
													</div>
													<span className="truncate">{org}</span>
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
									<div className="p-3 border-t border-[var(--border)]">
										<div className="flex items-center gap-2">
											<div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-medium">
												D
											</div>
											<span className="text-xs font-medium">darkroom</span>
										</div>
									</div>
								</div>
								{/* Main content */}
								<div className="flex-1 p-6 overflow-hidden relative">
									<div className="mb-6">
										<h2 className="text-lg font-semibold">Welcome back, <span className="text-[var(--accent)]">darkroom</span></h2>
										<p className="text-sm text-[var(--muted)]">Your GitHub activity at a glance</p>
									</div>
									<div className="grid grid-cols-4 gap-4 mb-6">
										{[
											{ label: 'Repositories', value: '47', desc: 'Public repos' },
											{ label: 'Total Stars', value: '2.3k', desc: 'Across all repos' },
											{ label: 'Commits', value: '892', desc: 'Last 30 days' },
											{ label: 'Pull Requests', value: '156', desc: 'Last 30 days' },
										].map((stat) => (
											<div key={stat.label} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--background)]">
												<p className="text-2xl font-bold text-[var(--accent)]">{stat.value}</p>
												<p className="text-xs font-medium">{stat.label}</p>
												<p className="text-[10px] text-[var(--muted)]">{stat.desc}</p>
											</div>
										))}
									</div>
									<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
										<p className="text-sm font-medium text-[var(--muted)] mb-3">Your Organizations</p>
										<div className="flex gap-3">
											{[
												{ name: 'vercel', letter: 'V' },
												{ name: 'facebook', letter: 'F' },
												{ name: 'microsoft', letter: 'M' },
												{ name: 'google', letter: 'G' },
											].map((org) => (
												<div key={org.name} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer group">
													<div className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-sm font-medium group-hover:scale-105 transition-transform">
														{org.letter}
													</div>
													<span className="text-[10px] text-[var(--muted)]">{org.name}</span>
												</div>
											))}
										</div>
									</div>
									{/* Floating search bar */}
									<div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64">
										<div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] shadow-lg">
											<svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
											</svg>
											<span className="text-sm text-[var(--muted)]">Search organization...</span>
											<kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)] bg-[var(--background)] rounded border border-[var(--border)]">
												<span className="text-xs">⌘</span>K
											</kbd>
										</div>
									</div>
								</div>
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
