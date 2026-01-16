// GitHub API functions for fetching org metrics
// Used for leaderboards across web and desktop app

export interface OrgStats {
	name: string
	avatarUrl: string
	description: string | null
	repos: number
	followers: number
	stars: number
	// Activity score: stars-per-repo weighted metric (0-100)
	activityScore: number
}

export type LeaderboardCategory =
	| 'developer-favorites'
	| 'frameworks'
	| 'databases'
	| 'rising-stars'

export const LEADERBOARD_CATEGORIES: { value: LeaderboardCategory; label: string; description: string }[] = [
	{ value: 'developer-favorites', label: 'Developer Favorites', description: 'Tools developers love and use daily' },
	{ value: 'frameworks', label: 'Frameworks', description: 'Web frameworks and meta-frameworks' },
	{ value: 'databases', label: 'Databases & Infra', description: 'Database tools and infrastructure' },
	{ value: 'rising-stars', label: 'Rising Stars', description: 'Fast-growing projects to watch' },
]

// Curated org lists by category
const CATEGORY_ORGS: Record<LeaderboardCategory, string[]> = {
	'developer-favorites': [
		'vercel',
		'supabase',
		'tailwindlabs',
		'prisma',
		'trpc',
		'oven-sh',
		'denoland',
		'biomejs',
		'withastro',
		'sveltejs',
	],
	'frameworks': [
		'vercel', // Next.js
		'remix-run',
		'withastro',
		'sveltejs',
		'nuxt',
		'solidjs',
		'honojs',
		'elysiajs',
		'angular',
		'vuejs',
	],
	'databases': [
		'supabase',
		'planetscale',
		'drizzle-team',
		'prisma',
		'neondatabase',
		'turso-tech',
		'edgedb',
		'surrealdb',
		'cockroachdb',
		'timescale',
	],
	'rising-stars': [
		'oven-sh', // Bun
		'biomejs',
		'drizzle-team',
		'honojs',
		'elysiajs',
		'lucia-auth',
		'unjs',
		'effect-ts',
		'tinylibs',
		'millionjs',
	],
}

interface CacheEntry {
	data: OrgStats[]
	timestamp: number
}

// Per-category cache
const cache: Record<string, CacheEntry> = {}
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

// GitHub token for higher rate limits (optional)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

function getGitHubHeaders() {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'Specto-Web/1.0',
	}
	if (GITHUB_TOKEN) {
		headers.Authorization = `Bearer ${GITHUB_TOKEN}`
	}
	return headers
}

// Track rate limit status
let rateLimitHit = false
let rateLimitResetTime = 0

async function fetchOrgDetails(orgLogin: string): Promise<OrgStats | null> {
	// Skip API calls if we're rate limited
	if (rateLimitHit && Date.now() < rateLimitResetTime) {
		console.warn(`Skipping ${orgLogin} - rate limited until ${new Date(rateLimitResetTime).toISOString()}`)
		return null
	}

	try {
		const headers = getGitHubHeaders()

		const orgRes = await fetch(`https://api.github.com/orgs/${orgLogin}`, {
			headers,
			next: { revalidate: 1800 },
		})

		// Check for rate limiting
		if (orgRes.status === 403 || orgRes.status === 429) {
			const resetHeader = orgRes.headers.get('x-ratelimit-reset')
			rateLimitHit = true
			rateLimitResetTime = resetHeader ? parseInt(resetHeader) * 1000 : Date.now() + 60000
			console.error(`GitHub API rate limited! Resets at ${new Date(rateLimitResetTime).toISOString()}`)
			console.error('Add GITHUB_TOKEN to .env.local for 5000 req/hour (vs 60 without)')
			return null
		}

		if (!orgRes.ok) {
			console.warn(`Failed to fetch org ${orgLogin}: ${orgRes.status}`)
			return null
		}
		const orgData = await orgRes.json()

		// Fetch top repos to count stars (get more repos for accuracy)
		const reposRes = await fetch(
			`https://api.github.com/orgs/${orgLogin}/repos?sort=stars&direction=desc&per_page=100`,
			{
				headers,
				next: { revalidate: 1800 },
			}
		)

		let totalStars = 0
		if (reposRes.status === 403 || reposRes.status === 429) {
			const resetHeader = reposRes.headers.get('x-ratelimit-reset')
			rateLimitHit = true
			rateLimitResetTime = resetHeader ? parseInt(resetHeader) * 1000 : Date.now() + 60000
			console.error(`GitHub API rate limited on repos! Add GITHUB_TOKEN to .env.local`)
		} else if (reposRes.ok) {
			const repos = await reposRes.json()
			if (Array.isArray(repos)) {
				totalStars = repos.reduce((sum: number, r: { stargazers_count?: number }) =>
					sum + (r.stargazers_count || 0), 0)
			}
		} else {
			console.warn(`Failed to fetch repos for ${orgLogin}: ${reposRes.status}`)
		}

		return {
			name: orgData.login,
			avatarUrl: orgData.avatar_url,
			description: orgData.description,
			repos: orgData.public_repos || 0,
			followers: orgData.followers || 0,
			stars: totalStars,
			activityScore: 0, // Calculated after fetching all
		}
	} catch (error) {
		console.error(`Failed to fetch ${orgLogin}:`, error)
		return null
	}
}

export async function getLeaderboardData(category: LeaderboardCategory = 'developer-favorites'): Promise<OrgStats[]> {
	const cacheKey = category

	// Check cache first
	if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
		return cache[cacheKey].data
	}

	// If we're rate limited, return fallback immediately
	if (rateLimitHit && Date.now() < rateLimitResetTime) {
		console.warn(`Using fallback data for ${category} - rate limited`)
		return getFallbackData(category)
	}

	try {
		const orgLogins = CATEGORY_ORGS[category]
		const results = await Promise.all(orgLogins.map(fetchOrgDetails))
		const validOrgs = results.filter((o): o is OrgStats => o !== null)

		if (validOrgs.length === 0) {
			console.warn(`No valid orgs fetched for ${category}, using fallback data`)
			return getFallbackData(category)
		}

		// If we got partial data (some orgs failed), log it
		if (validOrgs.length < orgLogins.length) {
			console.warn(`Only fetched ${validOrgs.length}/${orgLogins.length} orgs for ${category}`)
		}

		// Calculate activity scores
		// Using stars-per-repo as main metric (rewards quality over quantity)
		const starsPerRepo = validOrgs.map(o => o.repos > 0 ? o.stars / o.repos : 0)
		const maxStarsPerRepo = Math.max(...starsPerRepo)
		const maxFollowers = Math.max(...validOrgs.map(o => o.followers))

		const scoredOrgs = validOrgs.map((org, i) => ({
			...org,
			activityScore: Math.round(
				(((starsPerRepo[i] ?? 0) / maxStarsPerRepo) * 70) + // 70% stars-per-repo
				((org.followers / maxFollowers) * 30) // 30% followers
			)
		}))

		// Sort by score
		const sorted = scoredOrgs.sort((a, b) => b.activityScore - a.activityScore)

		// Update cache
		cache[cacheKey] = { data: sorted, timestamp: Date.now() }

		return sorted
	} catch (error) {
		console.error('Failed to fetch leaderboard:', error)
		return getFallbackData(category)
	}
}

// Fallback data per category
function getFallbackData(category: LeaderboardCategory): OrgStats[] {
	const fallbacks: Record<LeaderboardCategory, OrgStats[]> = {
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
	return fallbacks[category]
}

// For backwards compatibility
export const fallbackLeaderboardData = getFallbackData('developer-favorites')
