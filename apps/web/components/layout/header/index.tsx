'use client'

import { Button } from '@specto/ui'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { MobileNav } from './mobile-nav'
import s from './header.module.css'

const navItems = [
	{ href: '/#features', label: 'Features' },
	{ href: '/#leaderboard', label: 'Leaderboard' },
	{ href: 'https://github.com/darkroomengineering/specto', label: 'GitHub', external: true },
]

export function Header() {
	return (
		<header className={s.header}>
			{/* Skip link for keyboard navigation */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-md focus:outline-none"
			>
				Skip to main content
			</a>

			<div className={s.container}>
				<Link href="/" className={s.logo} aria-label="Specto home">
					<Logo size={36} />
				</Link>

				{/* Desktop navigation */}
				<nav className={s.nav} aria-label="Main navigation">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={s.navLink}
							{...(item.external ? {
								target: '_blank',
								rel: 'noopener noreferrer',
								'aria-label': `${item.label} (opens in new tab)`
							} : {})}
						>
							{item.label}
							{item.external && (
								<span className="sr-only"> (opens in new tab)</span>
							)}
						</Link>
					))}
					<Link href="/downloads">
						<Button size="sm">Download</Button>
					</Link>
				</nav>

				{/* Mobile navigation */}
				<div className={s.mobileNavTrigger}>
					<MobileNav items={navItems} />
				</div>
			</div>
		</header>
	)
}
