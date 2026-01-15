'use client'

import { Button } from '@specto/ui'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import s from './header.module.css'

const navItems = [
	{ href: '/#features', label: 'Features' },
	{ href: '/#leaderboard', label: 'Leaderboard' },
	{ href: 'https://github.com/darkroomengineering/specto', label: 'GitHub', external: true },
]

export function Header() {
	return (
		<header className={s.header}>
			<div className={s.container}>
				<Link href="/" className={s.logo}>
					<Logo size={36} />
				</Link>
				<nav className={s.nav}>
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={s.navLink}
							{...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
						>
							{item.label}
						</Link>
					))}
					<Link href="/downloads">
						<Button size="sm">Download</Button>
					</Link>
				</nav>
			</div>
		</header>
	)
}
