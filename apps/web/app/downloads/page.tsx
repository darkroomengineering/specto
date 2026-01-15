import { Button, Card } from '@specto/ui'
import Link from 'next/link'
import { APP_VERSION, RELEASE_DATE, getDownloadUrl, downloads as downloadConfig } from '@/lib/config'

// Platform download options
const platformDownloads = [
	{
		platform: 'macOS',
		icon: (
			<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
				<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
			</svg>
		),
		variants: [
			{ name: 'Apple Silicon', file: downloadConfig.macos.arm64, arch: 'arm64' },
			{ name: 'Intel', file: downloadConfig.macos.x64, arch: 'x64' },
		],
	},
	{
		platform: 'Windows',
		icon: (
			<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
				<path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
			</svg>
		),
		variants: [
			{ name: 'Installer (exe)', file: downloadConfig.windows.exe, arch: 'x64' },
			{ name: 'MSI', file: downloadConfig.windows.msi, arch: 'x64' },
		],
	},
]

export default function DownloadsPage() {

	return (
		<div className="min-h-screen bg-[var(--background)]">
			{/* Hero */}
			<section className="pt-32 pb-12 px-6 text-center">
				<h1 className="text-5xl font-bold mb-4">Download Specto</h1>
				<p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
					Get the desktop app for macOS or Windows. Free to use with optional Pro upgrade.
				</p>
				<div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm">
					<span className="w-2 h-2 rounded-full bg-green-500" />
					Version {APP_VERSION} • Released {RELEASE_DATE}
				</div>
			</section>

			{/* Downloads */}
			<section className="px-6 pb-16">
				<div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
					{platformDownloads.map((platform) => (
						<Card key={platform.platform}>
							<Card.Content className="py-8">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-14 h-14 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
										{platform.icon}
									</div>
									<div>
										<h2 className="text-xl font-semibold">{platform.platform}</h2>
										<p className="text-sm text-[var(--muted)]">v{APP_VERSION}</p>
									</div>
								</div>

								<div className="space-y-3">
									{platform.variants.map((variant, idx) => {
										const isAvailable = variant.file !== null
										const content = (
											<>
												<div>
													<p className="font-medium flex items-center gap-2">
														{variant.name}
														{!isAvailable && (
															<span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--card)] text-[var(--muted)]">Coming soon</span>
														)}
													</p>
													{isAvailable && variant.file && (
														<p className="text-xs text-[var(--muted)]">{variant.file}</p>
													)}
												</div>
												{isAvailable ? (
													<svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
													</svg>
												) : (
													<svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
												)}
											</>
										)

										const className = `flex items-center justify-between p-3 rounded-lg border bg-[var(--background)] transition-colors group ${
											isAvailable
												? 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--card)] cursor-pointer'
												: 'border-dashed border-[var(--border)] opacity-60 cursor-not-allowed'
										}`

										return isAvailable && variant.file ? (
											<a key={variant.file} href={getDownloadUrl(variant.file)} className={className}>
												{content}
											</a>
										) : (
											<div key={`${variant.name}-${idx}`} className={className}>
												{content}
											</div>
										)
									})}
								</div>
							</Card.Content>
						</Card>
					))}
				</div>
			</section>

			{/* CLI */}
			<section className="px-6 pb-16">
				<div className="max-w-3xl mx-auto">
					<Card>
						<Card.Content className="py-8">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-14 h-14 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
									<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
								<div>
									<h2 className="text-xl font-semibold">Command Line</h2>
									<p className="text-sm text-[var(--muted)]">Open source • MIT License</p>
								</div>
							</div>

							<p className="text-[var(--muted)] mb-4">
								Install the CLI globally with npm, yarn, or bun:
							</p>

							<div className="space-y-2">
								<code className="block px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm font-mono">
									npm install -g specto-cli
								</code>
								<code className="block px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm font-mono">
									bun add -g specto-cli
								</code>
							</div>

							<div className="mt-6 pt-6 border-t border-[var(--border)]">
								<p className="text-sm text-[var(--muted)] mb-3">Quick start:</p>
								<code className="block px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm font-mono">
									specto vercel --commits --timeframe 30d
								</code>
							</div>
						</Card.Content>
					</Card>
				</div>
			</section>

			{/* Pro Upgrade */}
			<section className="px-6 pb-24">
				<div className="max-w-3xl mx-auto">
					<Card className="border-[var(--accent)]">
						<Card.Content className="py-8">
							<div className="flex items-start justify-between mb-6">
								<div>
									<h2 className="text-xl font-semibold mb-1">Upgrade to Pro</h2>
									<p className="text-[var(--muted)]">
										Unlock unlimited history, exports, and more
									</p>
								</div>
								<div className="text-right">
									<p className="text-2xl font-bold">$8</p>
									<p className="text-sm text-[var(--muted)]">per month</p>
								</div>
							</div>

							<ul className="grid md:grid-cols-2 gap-2 text-sm mb-6">
								{[
									'Unlimited organizations',
									'Unlimited history',
									'Export to CSV/JSON',
									'API access',
									'Team comparisons',
									'Priority support',
								].map((feature) => (
									<li key={feature} className="flex items-center gap-2">
										<span className="text-[var(--accent)]">✓</span>
										{feature}
									</li>
								))}
							</ul>

							<Link href="/api/checkout?products=b4ffc79f-8224-40fe-898e-af3e972c7d53">
								<Button className="w-full">Upgrade to Pro</Button>
							</Link>
						</Card.Content>
					</Card>
				</div>
			</section>

		</div>
	)
}
