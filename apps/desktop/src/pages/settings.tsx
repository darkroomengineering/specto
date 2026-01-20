import { useState } from 'react'
import { Card, Button, Badge } from '@specto/ui'
import { useAuthStore } from '../stores/auth'
import { useLicenseStore, useProFeature, FREE_LIMITS } from '../stores/license'
import { Spinner } from '../components/spinner'
import { open } from '@tauri-apps/plugin-shell'

const PRO_FEATURES = [
	{
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
			</svg>
		),
		title: 'Unlimited Organizations',
		description: 'Track as many GitHub organizations as you need without restrictions.',
	},
	{
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
		title: 'Unlimited History',
		description: 'Access your full commit history and analytics without time limits.',
	},
	{
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
			</svg>
		),
		title: 'Export Reports',
		description: 'Export your metrics to CSV, JSON, or PDF for reporting and analysis.',
	},
	{
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
		),
		title: 'Advanced Analytics',
		description: 'Deep insights into contributor activity, team performance, and trends.',
	},
	{
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
		),
		title: 'Team Comparisons',
		description: 'Compare metrics across teams and organizations side-by-side.',
	},
	{
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
		),
		title: 'API Access',
		description: 'Integrate Specto data into your own tools and workflows via API.',
	},
]

export function Settings() {
	const { isAuthenticated, isLoading, username, error, checkAuth } = useAuthStore()
	const {
		licenseKey,
		isPro: licenseIsPro,
		isValidating,
		error: licenseError,
		activatedAt,
		setLicenseKey,
		clearLicense,
	} = useLicenseStore()
	const { isPro, isDev } = useProFeature()
	const [keyInput, setKeyInput] = useState('')

	return (
		<div className="h-full flex flex-col p-6 overflow-auto">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-semibold text-[var(--foreground)]">Settings</h1>
				<p className="text-sm text-[var(--muted)] mt-1">
					Configure your Specto preferences and manage your subscription
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Left column */}
				<div className="space-y-6">
					{/* Authentication */}
					<Card>
						<Card.Header>
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-medium">GitHub Authentication</h2>
								{isLoading ? (
									<Spinner size="sm" />
								) : isAuthenticated ? (
									<Badge variant="success">Connected</Badge>
								) : (
									<Badge variant="error">Not Connected</Badge>
								)}
							</div>
						</Card.Header>
						<Card.Content>
							<div className="space-y-4">
								<div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
									<div>
										<p className="text-sm font-medium">Status</p>
										<p className="text-xs text-[var(--muted)]">
											GitHub CLI authentication
										</p>
									</div>
									<span className="text-sm">
										{isLoading ? (
											<Spinner size="sm" />
										) : isAuthenticated ? (
											<span className="text-[var(--color-success)]">Authenticated</span>
										) : (
											<span className="text-[var(--color-error)]">Not authenticated</span>
										)}
									</span>
								</div>

								{username && (
									<div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
										<div>
											<p className="text-sm font-medium">Username</p>
											<p className="text-xs text-[var(--muted)]">
												Logged in as
											</p>
										</div>
										<span className="text-sm text-[var(--accent)]">{username}</span>
									</div>
								)}

								{error && (
									<div className="py-2 px-3 rounded-md bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
										<p className="text-sm text-[var(--color-error)]">{error}</p>
									</div>
								)}

								<div className="flex gap-2 pt-2">
									<Button variant="secondary" onClick={checkAuth}>
										{isLoading ? <Spinner size="sm" /> : 'Refresh Status'}
									</Button>
									{!isAuthenticated && (
										<Button onClick={() => open('https://cli.github.com')}>
											Install GitHub CLI
										</Button>
									)}
								</div>
							</div>
						</Card.Content>
						<Card.Footer>
							<p className="text-xs text-[var(--muted)]">
								Run <code className="px-1.5 py-0.5 rounded bg-[var(--card-hover)]">gh auth login</code> in your terminal to authenticate.
							</p>
						</Card.Footer>
					</Card>

					{/* Appearance */}
					<Card>
						<Card.Header>
							<h2 className="text-lg font-medium">Appearance</h2>
						</Card.Header>
						<Card.Content>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">Theme</p>
									<p className="text-xs text-[var(--muted)]">
										Choose your preferred color scheme
									</p>
								</div>
								<div className="flex gap-2">
									<Button
										variant="secondary"
										size="sm"
										onClick={() => document.documentElement.setAttribute('data-theme', 'dark')}
									>
										Dark
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => document.documentElement.setAttribute('data-theme', 'light')}
									>
										Light
									</Button>
								</div>
							</div>
						</Card.Content>
					</Card>

					{/* About */}
					<Card>
						<Card.Header>
							<h2 className="text-lg font-medium">About Specto</h2>
						</Card.Header>
						<Card.Content>
							<div className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-[var(--muted)]">Version</span>
									<span>1.1.1</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[var(--muted)]">Plan</span>
									<span className={isPro ? 'text-[var(--accent)]' : ''}>
										{isPro ? 'Pro' : 'Free'}
									</span>
								</div>
									<div className="flex justify-between">
									<span className="text-[var(--muted)]">Framework</span>
									<span>Tauri + React</span>
								</div>
							</div>
						</Card.Content>
						<Card.Footer>
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => open('https://specto.dev')}
								>
									Website
								</Button>
							</div>
						</Card.Footer>
					</Card>
				</div>

				{/* Right column - Pro section */}
				<div className="space-y-6">
					{/* Pro Plan Card */}
					<Card className={isPro ? 'border-[var(--accent)]' : 'border-[var(--accent)]/50'}>
						<Card.Header>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center">
										<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
										</svg>
									</div>
									<div>
										<h2 className="text-lg font-medium">Specto Pro</h2>
										<p className="text-xs text-[var(--muted)]">Unlock all features</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{isDev && <Badge>Dev Mode</Badge>}
									{isPro ? (
										<Badge variant="success">Active</Badge>
									) : (
										<Badge>Free Plan</Badge>
									)}
								</div>
							</div>
						</Card.Header>
						<Card.Content>
							{isPro ? (
								<div className="space-y-4">
									<div className="p-4 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
										<div className="flex items-center gap-2 mb-3">
											<svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span className="font-medium text-[var(--accent)]">All Pro features unlocked!</span>
										</div>
										<p className="text-sm text-[var(--muted)]">
											Thank you for supporting Specto. You have access to all premium features.
										</p>
									</div>
									{activatedAt && (
										<p className="text-xs text-[var(--muted)]">
											Activated on {new Date(activatedAt).toLocaleDateString()}
										</p>
									)}
									<Button variant="ghost" size="sm" onClick={clearLicense}>
										Deactivate License
									</Button>
								</div>
							) : (
								<div className="space-y-6">
									{/* Pricing */}
									<div className="flex items-baseline gap-1">
										<span className="text-3xl font-bold">$8</span>
										<span className="text-[var(--muted)]">/month</span>
									</div>

									{/* License key input */}
									<div className="space-y-3">
										<label className="block text-sm font-medium">
											Enter license key
										</label>
										<div className="flex gap-2">
											<input
												type="text"
												value={keyInput}
												onChange={(e) => setKeyInput(e.target.value)}
												placeholder="XXXX-XXXX-XXXX-XXXX"
												className="flex-1 px-3 py-2.5 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
											/>
											<Button
												onClick={() => {
													if (keyInput.trim()) {
														setLicenseKey(keyInput.trim())
														setKeyInput('')
													}
												}}
												disabled={!keyInput.trim() || isValidating}
											>
												{isValidating ? <Spinner size="sm" /> : 'Activate'}
											</Button>
										</div>
										{licenseError && (
											<div className="py-2.5 px-3 rounded-md bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
												<p className="text-sm text-[var(--color-error)]">{licenseError}</p>
											</div>
										)}
									</div>

									<Button
										className="w-full"
										onClick={() => open('https://specto.dev/downloads')}
									>
										Get Specto Pro
									</Button>
								</div>
							)}
						</Card.Content>
					</Card>

					{/* Features Grid */}
					<Card>
						<Card.Header>
							<h2 className="text-lg font-medium">
								{isPro ? 'Your Pro Features' : 'Pro Features'}
							</h2>
						</Card.Header>
						<Card.Content>
							<div className="grid grid-cols-1 gap-4">
								{PRO_FEATURES.map((feature, index) => (
									<div
										key={index}
										className={`flex gap-3 p-3 rounded-lg border transition-colors ${
											isPro
												? 'border-[var(--accent)]/20 bg-[var(--accent)]/5'
												: 'border-[var(--border)] bg-[var(--card-hover)]'
										}`}
									>
										<div className={`flex-shrink-0 ${isPro ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
											{feature.icon}
										</div>
										<div>
											<p className="text-sm font-medium">{feature.title}</p>
											<p className="text-xs text-[var(--muted)]">{feature.description}</p>
										</div>
										{isPro && (
											<svg className="w-4 h-4 text-[var(--accent)] ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
										)}
									</div>
								))}
							</div>
						</Card.Content>
						{!isPro && (
							<Card.Footer>
								<div className="p-3 rounded-lg bg-[var(--card-hover)] border border-[var(--border)]">
									<p className="text-sm font-medium mb-1">Free plan includes:</p>
									<ul className="text-xs text-[var(--muted)] space-y-0.5">
										<li>• Up to {FREE_LIMITS.maxOrganizations} organizations</li>
										<li>• {FREE_LIMITS.historyDays}-day history retention</li>
										<li>• Basic metrics and insights</li>
									</ul>
								</div>
							</Card.Footer>
						)}
					</Card>
				</div>
			</div>
		</div>
	)
}
