import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { cn, fadeIn, fadeInUp, scaleIn } from '@specto/ui'
import { useAuthStore } from '../stores/auth'
import { useProFeature } from '../stores/license'
import { useGitHubStore } from '../stores/github'
import { useNetworkStatus } from '../hooks/use-network-status'
import { OfflineIndicator } from './offline-indicator'

interface RecentOrg {
	login: string
	avatar_url?: string
}

export function Layout() {
	const { username } = useAuthStore()
	const { isPro } = useProFeature()
	const { isOnline, wasOffline } = useNetworkStatus()
	const navigate = useNavigate()
	const location = useLocation()
	const [orgInput, setOrgInput] = useState('')
	const [recentOrgs, setRecentOrgs] = useState<RecentOrg[]>([])
	const [searchFocused, setSearchFocused] = useState(false)
	const [showSearchModal, setShowSearchModal] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const sidebarInputRef = useRef<HTMLInputElement>(null)

	// Load recent orgs from localStorage
	useEffect(() => {
		try {
			const stored = localStorage.getItem('specto:recent-orgs')
			if (stored) {
				const parsed = JSON.parse(stored)
				// Validate the parsed data is an array with expected structure
				if (Array.isArray(parsed) && parsed.every(item => item && typeof item === 'object' && 'login' in item)) {
					setRecentOrgs(parsed as RecentOrg[])
				}
			}
		} catch {
			// Invalid JSON, ignore
		}
	}, [])

	// Track org visits - only add to history if org was found
	const { orgData, notFound } = useGitHubStore()
	useEffect(() => {
		const match = location.pathname.match(/^\/org\/(.+)$/)
		const orgLogin = match?.[1]
		// Only add to history if we have org info (meaning it was found)
		if (orgLogin && orgData.info && !notFound) {
			const newOrg = { login: orgLogin, avatar_url: orgData.info.avatar_url }
			const updated = [newOrg, ...recentOrgs.filter(o => o.login !== orgLogin)].slice(0, 5)
			localStorage.setItem('specto:recent-orgs', JSON.stringify(updated))
			setRecentOrgs(updated)
		}
	}, [location.pathname, orgData.info, notFound])

	// Keyboard shortcut for search (CMD+K)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				setShowSearchModal(true)
				// Focus the sidebar input after modal opens
				setTimeout(() => sidebarInputRef.current?.focus(), 50)
			}
			if (e.key === 'Escape') {
				setShowSearchModal(false)
				setSearchFocused(false)
				setOrgInput('')
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])

	const handleSearch = () => {
		if (orgInput.trim()) {
			navigate(`/org/${orgInput.trim()}`)
			setOrgInput('')
			setSearchFocused(false)
			setShowSearchModal(false)
		}
	}

	const openSearchModal = () => {
		setShowSearchModal(true)
		setTimeout(() => sidebarInputRef.current?.focus(), 50)
	}

	return (
		<div className="flex h-full" role="application" aria-label="Specto desktop application">
			{/* Offline indicator banner */}
			<OfflineIndicator isOnline={isOnline} wasOffline={wasOffline} />

			{/* Sidebar */}
			<aside
				className="w-48 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col rounded-tr-xl"
				aria-label="Main sidebar"
			>
				{/* Search trigger in sidebar */}
				<div className="p-2 pt-3">
					<motion.button
						onClick={openSearchModal}
						className={cn(
							'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
							'text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]',
							'border border-[var(--border)] hover:border-[var(--muted)]'
						)}
						whileHover={{ scale: 1.01 }}
						whileTap={{ scale: 0.99 }}
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<span className="flex-1 text-left">Search...</span>
						<kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium text-[var(--muted)] bg-[var(--background)] rounded border border-[var(--border)]">
							<span className="text-[10px]">⌘</span>K
						</kbd>
					</motion.button>
				</div>

				{/* Main nav */}
				<nav className="p-2 pt-2 space-y-1" aria-label="Main navigation">
					<NavLink
						to="/dashboard"
						className={({ isActive }) =>
							cn(
								'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors',
								isActive
									? 'bg-[var(--accent)] text-white'
									: 'text-[var(--foreground)] hover:bg-[var(--card-hover)]'
							)
						}
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						<span>Dashboard</span>
					</NavLink>
					<NavLink
						to="/leaderboard"
						className={({ isActive }) =>
							cn(
								'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors',
								isActive
									? 'bg-[var(--accent)] text-white'
									: 'text-[var(--foreground)] hover:bg-[var(--card-hover)]'
							)
						}
					>
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
							<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
						</svg>
						<span>Leaderboard</span>
					</NavLink>
				</nav>

				{/* Recent organizations */}
				<div className="px-2 mt-1 flex-1 overflow-auto">
					<p className="px-3 py-1.5 text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">Recents</p>
					{recentOrgs.length > 0 ? (
						<div className="space-y-0.5">
							{recentOrgs.map((org, index) => (
								<motion.div
									key={org.login}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.05, duration: 0.2 }}
								>
									<NavLink
										to={`/org/${org.login}`}
										className={({ isActive }) =>
											cn(
												'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors text-left',
												isActive
													? 'bg-[var(--card-hover)] text-[var(--foreground)]'
													: 'text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]'
											)
										}
									>
										{org.avatar_url ? (
											<img src={org.avatar_url} alt="" loading="lazy" className="w-4 h-4 rounded" />
										) : (
											<div className="w-4 h-4 rounded bg-[var(--border)] flex items-center justify-center text-[10px] text-[var(--muted)]">
												{org.login[0]?.toUpperCase()}
											</div>
										)}
										<span className="truncate">{org.login}</span>
									</NavLink>
								</motion.div>
							))}
						</div>
					) : (
						<p className="px-3 py-2 text-xs text-[var(--muted)]">
							No recent organizations
						</p>
					)}
				</div>

				{/* Settings link */}
				<div className="p-2 pt-3 border-t border-[var(--border)]">
					<NavLink
						to="/settings"
						className={({ isActive }) =>
							cn(
								'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors',
								isActive
									? 'bg-[var(--card-hover)] text-[var(--foreground)]'
									: 'text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]'
							)
						}
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						<span className="flex-1">Settings</span>
						{isPro ? (
							<span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[var(--accent)] text-white rounded">
								PRO
							</span>
						) : (
							<span className="text-[10px] text-[var(--accent)]">
								Upgrade
							</span>
						)}
					</NavLink>
				</div>

				{/* User info */}
				{username && (
					<div className="p-3 border-t border-[var(--border)]">
						<div className="flex items-center gap-2">
							<div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-medium">
								{username[0]?.toUpperCase()}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs font-medium truncate">{username}</p>
							</div>
						</div>
					</div>
				)}
			</aside>

			{/* Main content area */}
			<div className="flex-1 flex flex-col overflow-hidden relative">
				{/* Page content */}
				<main className="flex-1 overflow-auto" aria-live="polite">
					<Outlet />
				</main>
			</div>

			{/* Search modal overlay */}
			<AnimatePresence>
				{showSearchModal && (
					<motion.div
						className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
						onClick={() => {
							setShowSearchModal(false)
							setOrgInput('')
						}}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
					>
						{/* Backdrop */}
						<motion.div
							className="absolute inset-0 bg-black/50 backdrop-blur-sm"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						/>

						{/* Search modal */}
						<motion.div
							className="relative w-full max-w-md mx-4"
							onClick={(e) => e.stopPropagation()}
							initial={{ opacity: 0, scale: 0.95, y: -20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -20 }}
							transition={{ duration: 0.15, ease: 'easeOut' }}
						>
							<div className={cn(
								"flex items-center gap-3 px-4 py-3 rounded-xl border bg-[var(--card)] shadow-2xl transition-all duration-200",
								"border-[var(--accent)] shadow-[0_0_30px_rgba(227,6,19,0.2)]"
							)}>
								<svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
								<input
									ref={sidebarInputRef}
									type="text"
									value={orgInput}
									onChange={(e) => setOrgInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') handleSearch()
										if (e.key === 'Escape') {
											setShowSearchModal(false)
											setOrgInput('')
										}
									}}
									placeholder="Search GitHub organization..."
									aria-label="Search for a GitHub organization"
									className="flex-1 bg-transparent text-base text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
								/>
								{orgInput && (
									<motion.button
										onClick={handleSearch}
										aria-label="Go to organization"
										className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.1 }}
									>
										Go
									</motion.button>
								)}
							</div>

							{/* Recent orgs dropdown */}
							{recentOrgs.length > 0 && (
								<motion.div
									className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden"
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.05, duration: 0.15 }}
								>
									<p className="px-4 py-2 text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">
										Recent Organizations
									</p>
									<div className="max-h-48 overflow-auto">
										{recentOrgs.map((org, index) => (
											<motion.button
												key={org.login}
												onClick={() => {
													navigate(`/org/${org.login}`)
													setShowSearchModal(false)
													setOrgInput('')
												}}
												className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[var(--card-hover)] transition-colors"
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.03, duration: 0.15 }}
											>
												{org.avatar_url ? (
													<img src={org.avatar_url} alt="" loading="lazy" className="w-6 h-6 rounded" />
												) : (
													<div className="w-6 h-6 rounded bg-[var(--border)] flex items-center justify-center text-xs text-[var(--muted)]">
														{org.login[0]?.toUpperCase()}
													</div>
												)}
												<span>{org.login}</span>
											</motion.button>
										))}
									</div>
								</motion.div>
							)}

							<p className="text-center text-xs text-[var(--muted)] mt-3">
								Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[10px]">Esc</kbd> to close
							</p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
