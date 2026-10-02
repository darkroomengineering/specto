'use client'

/**
 * QA Checklist Component (Development Only)
 *
 * This component provides a visual checklist for QA validation
 * of Specto web pages using agent-browser.
 *
 * Usage: Import and render in development mode only
 *
 * ```tsx
 * {process.env.NODE_ENV === 'development' && <QAChecklist />}
 * ```
 */

import { useState } from 'react'

interface QAPage {
	path: string
	name: string
	scenarios: QAScenario[]
}

interface QAScenario {
	name: string
	description: string
	checks: string[]
}

// Web pages requiring QA validation
const webPages: QAPage[] = [
	{
		path: '/',
		name: 'Landing Page',
		scenarios: [
			{
				name: 'Default State',
				description: 'Initial page load with hero section visible',
				checks: [
					'Hero headline visible and readable',
					'CTA buttons visible and clickable (44x44px min)',
					'Navigation accessible via keyboard',
					'Skip link works (Tab to reveal)',
					'Images have alt text',
					'Color contrast passes 4.5:1',
				],
			},
			{
				name: 'Dark Theme',
				description: 'Verify dark theme renders correctly',
				checks: [
					'Background colors applied correctly',
					'Text remains readable',
					'Accent colors visible',
					'No white flashes on load',
				],
			},
			{
				name: 'Mobile Viewport',
				description: 'Test at 375px width',
				checks: [
					'Mobile nav hamburger visible',
					'Hero text stacks properly',
					'CTAs stack vertically',
					'No horizontal scroll',
					'Touch targets 44x44px minimum',
				],
			},
		],
	},
	{
		path: '/downloads',
		name: 'Downloads Page',
		scenarios: [
			{
				name: 'Default State',
				description: 'Download options visible',
				checks: [
					'macOS download card visible',
					'Windows download card visible',
					'Version numbers displayed',
					'Download buttons accessible',
					'Architecture options clear (Intel/Apple Silicon)',
				],
			},
			{
				name: 'Loading State',
				description: 'While fetching release data',
				checks: [
					'Skeleton placeholders shown',
					'No layout shift on data load',
					'Smooth transition to content',
				],
			},
		],
	},
	{
		path: '/leaderboard',
		name: 'Leaderboard Page',
		scenarios: [
			{
				name: 'Default State',
				description: 'Global leaderboard visible',
				checks: [
					'Table renders with data',
					'Rank numbers visible',
					'Organization names readable',
					'Stats columns aligned',
					'Category tabs accessible',
				],
			},
			{
				name: 'Category Switch',
				description: 'Change leaderboard category',
				checks: [
					'Tab focus ring visible',
					'Data updates on selection',
					'No layout shift',
					'Loading indicator if slow',
				],
			},
		],
	},
	{
		path: '/success',
		name: 'Success Page',
		scenarios: [
			{
				name: 'Default State',
				description: 'Post-purchase confirmation',
				checks: [
					'Confetti animation plays',
					'Success icon visible',
					'License key placeholder shown',
					'Quick start guide visible',
					'Download CTA prominent',
				],
			},
		],
	},
]

// Desktop app pages requiring QA validation
const desktopPages: QAPage[] = [
	{
		path: '/dashboard',
		name: 'Dashboard',
		scenarios: [
			{
				name: 'Authenticated State',
				description: 'User logged in with GitHub',
				checks: [
					'Welcome message shows username',
					'Recent orgs list visible',
					'Search trigger in sidebar',
					'Navigation items accessible',
				],
			},
			{
				name: 'Search Modal',
				description: 'CMD+K search functionality',
				checks: [
					'Modal opens on CMD+K',
					'Input auto-focused',
					'Recent orgs shown',
					'Escape closes modal',
					'Enter submits search',
				],
			},
		],
	},
	{
		path: '/org/:name',
		name: 'Organization Page',
		scenarios: [
			{
				name: 'Loading State',
				description: 'Organization data loading',
				checks: ['Skeleton shows full layout', 'No jarring transitions', 'Smooth fade to content'],
			},
			{
				name: 'Loaded State',
				description: 'Data fully loaded',
				checks: [
					'Org name in header',
					'Stats grid populated',
					'Contributors table rendered',
					'Teams table rendered',
				],
			},
			{
				name: 'Pro Feature Gating',
				description: 'Non-Pro user interactions',
				checks: [
					'Timeframe selector shows Pro badge',
					'Disabled options non-interactive',
					'Export wrapped in ProGate',
					'Upgrade prompts consistent',
				],
			},
			{
				name: 'Error State',
				description: 'Organization not found',
				checks: ['Error message clear', 'Suggestions offered', 'Retry button works'],
			},
		],
	},
	{
		path: '/settings',
		name: 'Settings Page',
		scenarios: [
			{
				name: 'Free User',
				description: 'Non-Pro settings view',
				checks: ['License key input visible', 'Upgrade prompt shown', 'GitHub connection status'],
			},
			{
				name: 'Pro User',
				description: 'Pro settings view',
				checks: ['PRO badge visible', 'License key masked', 'All features unlocked'],
			},
		],
	},
	{
		path: '/leaderboard',
		name: 'Desktop Leaderboard',
		scenarios: [
			{
				name: 'Default State',
				description: 'Global rankings view',
				checks: ['Table renders correctly', 'Category tabs work', 'Search accessible from sidebar'],
			},
		],
	},
]

export function QAChecklist() {
	const [isOpen, setIsOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<'web' | 'desktop'>('web')

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-[var(--accent)] text-white text-xs font-medium rounded-lg shadow-lg hover:opacity-90 transition-opacity"
			>
				QA Checklist
			</button>
		)
	}

	const pages = activeTab === 'web' ? webPages : desktopPages

	return (
		<div className="fixed inset-y-4 right-4 w-96 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
				<h2 className="font-semibold">QA Checklist</h2>
				<button
					onClick={() => setIsOpen(false)}
					className="p-1 hover:bg-[var(--card-hover)] rounded transition-colors"
					aria-label="Close checklist"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-[var(--border)]">
				<button
					onClick={() => setActiveTab('web')}
					className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === 'web'
							? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
							: 'text-[var(--muted)] hover:text-[var(--foreground)]'
					}`}
				>
					Web Pages
				</button>
				<button
					onClick={() => setActiveTab('desktop')}
					className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === 'desktop'
							? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
							: 'text-[var(--muted)] hover:text-[var(--foreground)]'
					}`}
				>
					Desktop Pages
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-4 space-y-6">
				{pages.map((page) => (
					<div key={page.path} className="space-y-3">
						<div className="flex items-center gap-2">
							<code className="text-xs px-2 py-0.5 bg-[var(--background)] rounded border border-[var(--border)]">
								{page.path}
							</code>
							<span className="font-medium text-sm">{page.name}</span>
						</div>

						{page.scenarios.map((scenario) => (
							<div
								key={scenario.name}
								className="ml-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]"
							>
								<p className="text-sm font-medium mb-1">{scenario.name}</p>
								<p className="text-xs text-[var(--muted)] mb-2">{scenario.description}</p>
								<ul className="space-y-1">
									{scenario.checks.map((check, i) => (
										<li key={i} className="flex items-start gap-2 text-xs">
											<input
												type="checkbox"
												className="mt-0.5 rounded border-[var(--border)]"
												id={`${page.path}-${scenario.name}-${i}`}
											/>
											<label htmlFor={`${page.path}-${scenario.name}-${i}`}>{check}</label>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				))}
			</div>

			{/* Footer */}
			<div className="p-4 border-t border-[var(--border)]">
				<p className="text-xs text-[var(--muted)]">
					Use <code className="px-1 py-0.5 bg-[var(--background)] rounded">agent-browser</code> for
					automated visual QA
				</p>
			</div>
		</div>
	)
}

export type { QAPage, QAScenario }
// Export page configs for programmatic access
export { desktopPages, webPages }
