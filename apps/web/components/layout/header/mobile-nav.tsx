'use client'

import { useState } from 'react'
import { Button } from '@specto/ui'
import Link from 'next/link'
import s from './header.module.css'

interface NavItem {
	href: string
	label: string
	external?: boolean
}

interface MobileNavProps {
	items: NavItem[]
}

export function MobileNav({ items }: MobileNavProps) {
	const [isOpen, setIsOpen] = useState(false)

	const toggleMenu = () => setIsOpen(!isOpen)
	const closeMenu = () => setIsOpen(false)

	return (
		<>
			{/* Hamburger button */}
			<button
				type="button"
				className={s.hamburger}
				onClick={toggleMenu}
				aria-label={isOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={isOpen}
			>
				<span className={`${s.hamburgerLine} ${isOpen ? s.hamburgerLineOpen : ''}`} />
				<span className={`${s.hamburgerLine} ${isOpen ? s.hamburgerLineOpen : ''}`} />
				<span className={`${s.hamburgerLine} ${isOpen ? s.hamburgerLineOpen : ''}`} />
			</button>

			{/* Mobile menu overlay */}
			{isOpen && (
				<div className={s.mobileMenuOverlay} onClick={closeMenu}>
					<nav
						className={s.mobileMenu}
						onClick={(e) => e.stopPropagation()}
					>
						{items.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={s.mobileNavLink}
								onClick={closeMenu}
								{...(item.external
									? { target: '_blank', rel: 'noopener noreferrer' }
									: {})}
							>
								{item.label}
							</Link>
						))}
						<Link href="/downloads" onClick={closeMenu}>
							<Button className="w-full">Download</Button>
						</Link>
					</nav>
				</div>
			)}
		</>
	)
}
