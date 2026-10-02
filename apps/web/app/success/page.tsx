'use client'

import { Button, Card } from '@specto/ui'
import confetti from 'canvas-confetti'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export default function SuccessPage() {
	const [copied, setCopied] = useState(false)
	const maskedLicenseKey = 'XXXX-XXXX-XXXX-XXXX'

	// Fire confetti on mount
	useEffect(() => {
		const duration = 2000
		const end = Date.now() + duration

		const colors = ['#e30613', '#ff4d5a', '#ffffff']

		const frame = () => {
			confetti({
				particleCount: 3,
				angle: 60,
				spread: 55,
				origin: { x: 0, y: 0.7 },
				colors,
			})
			confetti({
				particleCount: 3,
				angle: 120,
				spread: 55,
				origin: { x: 1, y: 0.7 },
				colors,
			})

			if (Date.now() < end) {
				requestAnimationFrame(frame)
			}
		}

		// Initial burst
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors,
		})

		frame()
	}, [])

	const handleCopyPlaceholder = useCallback(() => {
		// In a real implementation, the actual license key would come from the URL params or API
		// For now, we show a helpful message
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}, [])

	return (
		<div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6 py-12">
			<motion.div
				className="max-w-lg w-full"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				{/* Success icon with animation */}
				<motion.div
					className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8"
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: 'spring', damping: 12, stiffness: 200 }}
				>
					<svg
						className="w-10 h-10 text-green-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</motion.div>

				<motion.h1
					className="text-4xl font-bold mb-4 text-center"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.3 }}
				>
					Thank you!
				</motion.h1>
				<motion.p
					className="text-[var(--muted)] mb-8 text-center text-lg"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15, duration: 0.3 }}
				>
					Your purchase was successful. You are now a Specto Pro user.
				</motion.p>

				{/* License key card */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.3 }}
				>
					<Card className="mb-6">
						<Card.Content className="py-6">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-[var(--muted)]">Your License Key</span>
								<button
									onClick={handleCopyPlaceholder}
									className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
								>
									{copied ? (
										<>
											<svg
												className="w-3 h-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											Check your email
										</>
									) : (
										<>
											<svg
												className="w-3 h-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
												/>
											</svg>
											Copy from email
										</>
									)}
								</button>
							</div>
							<div className="font-mono text-2xl tracking-wider text-center py-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
								{maskedLicenseKey}
							</div>
							<p className="text-xs text-[var(--muted)] mt-3 text-center">
								Your actual license key has been sent to your email
							</p>
						</Card.Content>
					</Card>
				</motion.div>

				{/* Quick start guide */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.25, duration: 0.3 }}
				>
					<Card className="mb-6">
						<Card.Header>
							<h2 className="text-lg font-semibold flex items-center gap-2">
								<svg
									className="w-5 h-5 text-[var(--accent)]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
								Quick Start Guide
							</h2>
						</Card.Header>
						<Card.Content className="py-5">
							<ol className="space-y-4">
								<li className="flex gap-4">
									<span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold">
										1
									</span>
									<div className="flex-1 pt-1">
										<p className="font-medium mb-1">Download Specto</p>
										<p className="text-sm text-[var(--muted)]">
											Download the app from the link in your email or from our{' '}
											<Link href="/downloads" className="text-[var(--accent)] hover:underline">
												downloads page
											</Link>
										</p>
									</div>
								</li>
								<li className="flex gap-4">
									<span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold">
										2
									</span>
									<div className="flex-1 pt-1">
										<p className="font-medium mb-1">Enter your license key</p>
										<p className="text-sm text-[var(--muted)]">
											Open Specto, go to Settings, and paste your license key to unlock Pro features
										</p>
									</div>
								</li>
								<li className="flex gap-4">
									<span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold">
										3
									</span>
									<div className="flex-1 pt-1">
										<p className="font-medium mb-1">Connect to GitHub</p>
										<p className="text-sm text-[var(--muted)]">
											Specto uses your local GitHub CLI auth. Run{' '}
											<code className="px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-xs">
												gh auth login
											</code>{' '}
											if needed
										</p>
									</div>
								</li>
							</ol>
						</Card.Content>
					</Card>
				</motion.div>

				{/* Pro features unlocked */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.3 }}
				>
					<Card className="mb-8 border-[var(--accent)]">
						<Card.Content className="py-5">
							<h3 className="font-medium mb-3 flex items-center gap-2">
								<span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--accent)] text-white">
									PRO
								</span>
								Features Unlocked
							</h3>
							<ul className="grid grid-cols-2 gap-2 text-sm text-[var(--muted)]">
								{['Unlimited history', 'Unlimited orgs', 'Export reports', 'API access'].map(
									(feature) => (
										<li key={feature} className="flex items-center gap-2">
											<svg
												className="w-4 h-4 text-green-500"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											{feature}
										</li>
									)
								)}
							</ul>
						</Card.Content>
					</Card>
				</motion.div>

				{/* Actions */}
				<motion.div
					className="flex flex-col gap-3"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.35, duration: 0.3 }}
				>
					<Link href="/downloads">
						<Button className="w-full" size="lg">
							<span className="flex items-center justify-center gap-2">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
								</svg>
								Download Specto
							</span>
						</Button>
					</Link>
					<Link href="/">
						<Button variant="secondary" className="w-full">
							Back to Home
						</Button>
					</Link>
				</motion.div>

				<p className="text-xs text-[var(--muted)] mt-8 text-center">
					Questions? Contact us at{' '}
					<a
						href="mailto:hello@darkroom.engineering"
						className="text-[var(--accent)] hover:underline"
					>
						hello@darkroom.engineering
					</a>
				</p>
			</motion.div>
		</div>
	)
}
