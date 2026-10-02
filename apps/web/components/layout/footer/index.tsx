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
		{
			href: 'https://github.com/darkroomengineering/specto#readme',
			label: 'Documentation',
			external: true,
		},
	],
	social: [
		{
			href: 'https://github.com/darkroomengineering/specto',
			label: 'GitHub',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
				</svg>
			),
		},
		{
			href: 'https://x.com/darkaboratory',
			label: 'X (Twitter)',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
			),
		},
	],
}

export function Footer() {
	return (
		<footer className={s.footer} role="contentinfo">
			<div className={s.container}>
				<div className={s.grid}>
					<div className={s.brand}>
						<Link href="/" className={s.logo} aria-label="Specto home">
							<Logo size={40} />
						</Link>
						<p className={s.tagline}>GitHub metrics, beautifully tracked.</p>
						{/* Social links */}
						<div className="flex items-center gap-3 mt-4">
							{footerLinks.social.map((social) => (
								<a
									key={social.href}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`${social.label} (opens in new tab)`}
									className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
								>
									{social.icon}
								</a>
							))}
						</div>
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
											target="_blank"
											rel="noopener noreferrer"
											aria-label={`${link.label} (opens in new tab)`}
										>
											{link.label}
											<span className="sr-only"> (opens in new tab)</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
				<div className={s.bottom}>
					<span className={s.copyright}>
						© {new Date().getFullYear()} <span className={s.accent}>Specto</span>. All rights
						reserved.
					</span>
					<span className={s.license}>MIT License (CLI)</span>
				</div>
			</div>
		</footer>
	)
}
