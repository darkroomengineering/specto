// GitHub API functions for fetching org metrics
// Used for leaderboards across web and desktop app

import { LEADERBOARD_FALLBACK, type LeaderboardCategory, type OrgStats } from '@specto/core'
import { unstable_cache } from 'next/cache'

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
	frameworks: [
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
	databases: [
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

function getGitHubHeaders() {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'Specto-Web/1.0',
	}
	if (process.env.GITHUB_TOKEN) {
		headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
	}
	return headers
}

interface GitHubOrg {
	login: string
	avatar_url: string
	description: string | null
	public_repos?: number
	followers?: number
}

interface RepoSearch {
	items?: { stargazers_count?: number }[]
}

async function fetchGitHub<T>(url: string): Promise<T | null> {
	const res = await fetch(url, { headers: getGitHubHeaders(), next: { revalidate: 3600 } })
	if (res.status === 403 || res.status === 429) {
		console.error(`GitHub API rate limited (${url})! Add GITHUB_TOKEN to .env.local`)
		return null
	}
	if (!res.ok) {
		console.warn(`GitHub request failed (${url}): ${res.status}`)
		return null
	}
	return (await res.json()) as T
}

async function fetchOrgDetails(orgLogin: string): Promise<OrgStats | null> {
	try {
		// The repos endpoint cannot sort by stars; search can. Top 100 repos approximate the org total.
		const [org, search] = await Promise.all([
			fetchGitHub<GitHubOrg>(`https://api.github.com/orgs/${orgLogin}`),
			fetchGitHub<RepoSearch>(
				`https://api.github.com/search/repositories?q=org:${orgLogin}&sort=stars&order=desc&per_page=100`
			),
		])
		if (!org) return null

		return {
			name: org.login,
			avatarUrl: org.avatar_url,
			description: org.description,
			repos: org.public_repos || 0,
			followers: org.followers || 0,
			stars: (search?.items ?? []).reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
			activityScore: 0, // Calculated after fetching all
		}
	} catch (error) {
		console.error(`Failed to fetch ${orgLogin}:`, error)
		return null
	}
}

/**
 * Calculate activity scores for orgs
 */
function calculateScores(orgs: OrgStats[]): OrgStats[] {
	const starsPerRepo = orgs.map((o) => (o.repos > 0 ? o.stars / o.repos : 0))
	const maxStarsPerRepo = Math.max(...starsPerRepo, 1)
	const maxFollowers = Math.max(...orgs.map((o) => o.followers), 1)

	return orgs.map((org, i) => ({
		...org,
		activityScore: Math.round(
			((starsPerRepo[i] ?? 0) / maxStarsPerRepo) * 70 + // 70% stars-per-repo
				(org.followers / maxFollowers) * 30 // 30% followers
		),
	}))
}

async function fetchLeaderboardData(category: LeaderboardCategory): Promise<OrgStats[]> {
	const results = await Promise.all(CATEGORY_ORGS[category].map(fetchOrgDetails))
	const validOrgs = results.filter((o): o is OrgStats => o !== null)

	if (validOrgs.length === 0) {
		console.warn(`No valid orgs fetched for ${category}, using fallback data`)
		return LEADERBOARD_FALLBACK[category]
	}

	return calculateScores(validOrgs).sort((a, b) => b.activityScore - a.activityScore)
}

/**
 * Get leaderboard data with Next.js caching (ISR)
 * Caches data for 30 minutes, revalidates in background
 */
export const getLeaderboardData = unstable_cache(fetchLeaderboardData, ['leaderboard'], {
	revalidate: 1800, // 30 minutes
	tags: ['leaderboard'],
})
