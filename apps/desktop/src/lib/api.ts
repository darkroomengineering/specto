// API client for fetching leaderboard data from the web API
// This ensures consistency between web and desktop apps

import type { LeaderboardCategory, OrgStats } from '@specto/core'

// Production by default: it has CORS headers configured and avoids running the web
// server locally. Set VITE_API_BASE=http://localhost:3000 to develop against a local server.
export const API_BASE: string =
	import.meta.env.VITE_API_BASE || 'https://specto.darkroom.engineering'

export async function fetchLeaderboard(
	category: LeaderboardCategory = 'developer-favorites'
): Promise<OrgStats[]> {
	const res = await fetch(`${API_BASE}/api/leaderboard?category=${category}`, {
		cache: 'no-store',
		headers: {
			'Cache-Control': 'no-cache',
		},
	})

	if (!res.ok) {
		throw new Error(`Failed to fetch leaderboard: ${res.statusText}`)
	}

	const json = await res.json()
	return json.data || []
}
