import Link from 'next/link'
import { Logo } from '@/components/logo'
import s from './footer.module.css'

const footerLinks = {
	product: [
		{ href: '/#features', label: 'Features' },
		{ href: '/#leaderboard', label: 'Leaderboard' },
		{ href: '/#pricing', label: 'Pricing' },
	],
	resources: [
		{ href: 'https://github.com/darkroomengineering/specto', label: 'GitHub', external: true },
		{ href: 'https://github.com/darkroomengineering/specto#readme', label: 'Documentation', external: true },
	],
	company: [
		{ href: 'https://darkroom.engineering', label: 'Darkroom', external: true },
	],
}

export function Footer() {
	return (
		<footer className={s.footer}>
			<div className={s.container}>
				<div className={s.grid}>
					<div className={s.brand}>
						<Link href="/" className={s.logo}>
							<Logo size={40} />
						</Link>
						<p className={s.tagline}>GitHub metrics, beautifully tracked.</p>
					</div>
					<div className={s.links}>
						<div className={s.linkGroup}>
							<h4 className={s.linkTitle}>Product</h4>
							<ul className={s.linkList}>
								{footerLinks.product.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className={s.link}>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div className={s.linkGroup}>
							<h4 className={s.linkTitle}>Resources</h4>
							<ul className={s.linkList}>
								{footerLinks.resources.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className={s.link}
											{...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div className={s.linkGroup}>
							<h4 className={s.linkTitle}>Company</h4>
							<ul className={s.linkList}>
								{footerLinks.company.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className={s.link}
											{...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
				<div className={s.bottom}>
					<span className={s.copyright}>
						© {new Date().getFullYear()} <span className={s.accent}>Darkroom Engineering</span>. All rights reserved.
					</span>
					<span className={s.license}>MIT License (CLI)</span>
				</div>
			</div>
		</footer>
	)
}
