import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@specto/ui'
import { useAuthStore } from '../stores/auth'
import { useProFeature } from '../stores/license'

interface RecentOrg {
	login: string
	avatar_url?: string
}

export function Layout() {
	const { username } = useAuthStore()
	const { isPro } = useProFeature()
	const navigate = useNavigate()
	const location = useLocation()
	const [orgInput, setOrgInput] = useState('')
	const [recentOrgs, setRecentOrgs] = useState<RecentOrg[]>([])
	const [searchFocused, setSearchFocused] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	// Load recent orgs from localStorage
	useEffect(() => {
		const stored = localStorage.getItem('specto:recent-orgs')
		if (stored) {
			setRecentOrgs(JSON.parse(stored))
		}
	}, [])

	// Track org visits
	useEffect(() => {
		const match = location.pathname.match(/^\/org\/(.+)$/)
		const orgLogin = match?.[1]
		if (orgLogin) {
			const newOrg = { login: orgLogin }
			const updated = [newOrg, ...recentOrgs.filter(o => o.login !== orgLogin)].slice(0, 5)
			localStorage.setItem('specto:recent-orgs', JSON.stringify(updated))
			setRecentOrgs(updated)
		}
	}, [location.pathname])

	// Keyboard shortcut for search (CMD+K)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				inputRef.current?.focus()
			}
			if (e.key === 'Escape') {
				inputRef.current?.blur()
				setSearchFocused(false)
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
			inputRef.current?.blur()
		}
	}

	return (
		<div className="flex h-full">
			{/* Sidebar */}
			<aside className="w-48 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col rounded-tr-xl">
				{/* Main nav */}
				<nav className="p-2 pt-4 space-y-1">
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
							{recentOrgs.map((org) => (
								<NavLink
									key={org.login}
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
										<img src={org.avatar_url} alt="" className="w-4 h-4 rounded" />
									) : (
										<div className="w-4 h-4 rounded bg-[var(--border)] flex items-center justify-center text-[10px] text-[var(--muted)]">
											{org.login[0]?.toUpperCase()}
										</div>
									)}
									<span className="truncate">{org.login}</span>
								</NavLink>
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
				<main className="flex-1 overflow-auto">
					<Outlet />
				</main>

				{/* Floating search bar - hidden on settings and leaderboard pages */}
				{location.pathname !== '/settings' && location.pathname !== '/leaderboard' && (
					<div className={cn(
						"absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-200",
						searchFocused ? "w-96" : "w-72"
					)}>
						<div className={cn(
							"flex items-center gap-2 px-4 py-2.5 rounded-full border bg-[var(--card)] shadow-lg backdrop-blur-sm transition-all duration-200",
							searchFocused
								? "border-[var(--accent)] shadow-[0_0_20px_rgba(227,6,19,0.15)]"
								: "border-[var(--border)] hover:border-[var(--muted)]"
						)}>
							<svg className="w-4 h-4 text-[var(--muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<input
								ref={inputRef}
								type="text"
								value={orgInput}
								onChange={(e) => setOrgInput(e.target.value)}
								onFocus={() => setSearchFocused(true)}
								onBlur={() => !orgInput && setSearchFocused(false)}
								onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
								placeholder="Search organization..."
								aria-label="Search for a GitHub organization"
								className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
							/>
							{!searchFocused && !orgInput && (
								<kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)] bg-[var(--background)] rounded border border-[var(--border)]">
									<span className="text-xs">⌘</span>K
								</kbd>
							)}
							{orgInput && (
								<button
									onClick={handleSearch}
									aria-label="Go to organization"
									className="flex-shrink-0 p-1 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
								>
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
									</svg>
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
