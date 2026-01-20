// API client for fetching leaderboard data from the web API
// This ensures consistency between web and desktop apps

const API_BASE = import.meta.env.PROD
	? 'https://specto.darkroom.engineering'
	: 'http://localhost:3000'

export type LeaderboardCategory =
	| 'developer-favorites'
	| 'frameworks'
	| 'databases'
	| 'rising-stars'

export interface OrgStats {
	name: string
	avatarUrl: string
	description: string | null
	repos: number
	followers: number
	stars: number
	activityScore: number
}

export const LEADERBOARD_CATEGORIES = [
	{ value: 'developer-favorites' as const, label: 'Developer Favorites', description: 'Tools developers love and use daily' },
	{ value: 'frameworks' as const, label: 'Frameworks', description: 'Web frameworks and meta-frameworks' },
	{ value: 'databases' as const, label: 'Databases & Infra', description: 'Database tools and infrastructure' },
	{ value: 'rising-stars' as const, label: 'Rising Stars', description: 'Fast-growing projects to watch' },
]

export async function fetchLeaderboard(category: LeaderboardCategory = 'developer-favorites'): Promise<OrgStats[]> {
	console.log(`[API] Fetching leaderboard for category: ${category}`)

	try {
		const res = await fetch(`${API_BASE}/api/leaderboard?category=${category}`, {
			cache: 'no-store',
			headers: {
				'Cache-Control': 'no-cache',
			},
		})

		if (!res.ok) {
			console.error(`[API] Failed to fetch: ${res.status} ${res.statusText}`)
			throw new Error(`Failed to fetch leaderboard: ${res.statusText}`)
		}

		const json = await res.json()
		console.log(`[API] Received ${json.data?.length || 0} orgs for ${category}`)
		return json.data || []
	} catch (error) {
		console.error('[API] Fetch error:', error)
		throw error
	}
}

// Fallback data per category
export const FALLBACK_DATA: Record<LeaderboardCategory, OrgStats[]> = {
	'developer-favorites': [
		{ name: 'tailwindlabs', avatarUrl: 'https://avatars.githubusercontent.com/u/67109815', description: 'Creators of Tailwind CSS', repos: 35, followers: 12400, stars: 180000, activityScore: 100 },
		{ name: 'vercel', avatarUrl: 'https://avatars.githubusercontent.com/u/14985020', description: 'Develop. Preview. Ship.', repos: 156, followers: 8900, stars: 150000, activityScore: 92 },
		{ name: 'supabase', avatarUrl: 'https://avatars.githubusercontent.com/u/54469796', description: 'The open source Firebase alternative', repos: 89, followers: 5600, stars: 85000, activityScore: 85 },
		{ name: 'oven-sh', avatarUrl: 'https://avatars.githubusercontent.com/u/108928776', description: 'Bun — a fast all-in-one JavaScript runtime', repos: 12, followers: 3200, stars: 72000, activityScore: 78 },
		{ name: 'prisma', avatarUrl: 'https://avatars.githubusercontent.com/u/17219288', description: 'Next-generation ORM for Node.js and TypeScript', repos: 78, followers: 4100, stars: 45000, activityScore: 71 },
	],
	'frameworks': [
		{ name: 'sveltejs', avatarUrl: 'https://avatars.githubusercontent.com/u/23617963', description: 'Cybernetically enhanced web apps', repos: 45, followers: 7200, stars: 95000, activityScore: 100 },
		{ name: 'vercel', avatarUrl: 'https://avatars.githubusercontent.com/u/14985020', description: 'Develop. Preview. Ship.', repos: 156, followers: 8900, stars: 150000, activityScore: 95 },
		{ name: 'withastro', avatarUrl: 'https://avatars.githubusercontent.com/u/44914786', description: 'The web framework for content-driven websites', repos: 52, followers: 2800, stars: 48000, activityScore: 88 },
		{ name: 'remix-run', avatarUrl: 'https://avatars.githubusercontent.com/u/64235328', description: 'Build Better Websites', repos: 34, followers: 2100, stars: 32000, activityScore: 82 },
		{ name: 'solidjs', avatarUrl: 'https://avatars.githubusercontent.com/u/79226042', description: 'A declarative, efficient, and flexible JavaScript library', repos: 28, followers: 1500, stars: 35000, activityScore: 76 },
	],
	'databases': [
		{ name: 'supabase', avatarUrl: 'https://avatars.githubusercontent.com/u/54469796', description: 'The open source Firebase alternative', repos: 89, followers: 5600, stars: 85000, activityScore: 100 },
		{ name: 'drizzle-team', avatarUrl: 'https://avatars.githubusercontent.com/u/108468352', description: 'TypeScript ORM that feels like writing SQL', repos: 15, followers: 1800, stars: 28000, activityScore: 92 },
		{ name: 'prisma', avatarUrl: 'https://avatars.githubusercontent.com/u/17219288', description: 'Next-generation ORM for Node.js and TypeScript', repos: 78, followers: 4100, stars: 45000, activityScore: 85 },
		{ name: 'neondatabase', avatarUrl: 'https://avatars.githubusercontent.com/u/77690634', description: 'Serverless Postgres', repos: 42, followers: 1200, stars: 18000, activityScore: 78 },
		{ name: 'turso-tech', avatarUrl: 'https://avatars.githubusercontent.com/u/139192399', description: 'SQLite for Production', repos: 28, followers: 800, stars: 12000, activityScore: 71 },
	],
	'rising-stars': [
		{ name: 'oven-sh', avatarUrl: 'https://avatars.githubusercontent.com/u/108928776', description: 'Bun — a fast all-in-one JavaScript runtime', repos: 12, followers: 3200, stars: 72000, activityScore: 100 },
		{ name: 'biomejs', avatarUrl: 'https://avatars.githubusercontent.com/u/140182857', description: 'One toolchain for your web project', repos: 8, followers: 1500, stars: 16000, activityScore: 95 },
		{ name: 'drizzle-team', avatarUrl: 'https://avatars.githubusercontent.com/u/108468352', description: 'TypeScript ORM that feels like writing SQL', repos: 15, followers: 1800, stars: 28000, activityScore: 88 },
		{ name: 'honojs', avatarUrl: 'https://avatars.githubusercontent.com/u/98495527', description: 'Ultrafast web framework for the Edges', repos: 24, followers: 1100, stars: 22000, activityScore: 82 },
		{ name: 'effect-ts', avatarUrl: 'https://avatars.githubusercontent.com/u/132182030', description: 'A powerful TypeScript framework', repos: 18, followers: 600, stars: 8500, activityScore: 75 },
	],
}
