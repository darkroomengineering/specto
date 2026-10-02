import { isLeaderboardCategory } from '@specto/core'
import { type NextRequest, NextResponse } from 'next/server'
import { corsHeaders, preflight } from '@/lib/cors'
import { getLeaderboardData } from '@/lib/github'

// Enable ISR with 30 minute revalidation
export const revalidate = 1800

export function OPTIONS(request: NextRequest) {
	return preflight(request, 'GET')
}

export async function GET(request: NextRequest) {
	const headers = corsHeaders(request, 'GET')
	const category = request.nextUrl.searchParams.get('category')
	const validCategory = isLeaderboardCategory(category) ? category : 'developer-favorites'

	try {
		const data = await getLeaderboardData(validCategory)
		return NextResponse.json(
			{ data, category: validCategory },
			{
				headers: {
					...headers,
					// CDN cache for 1 hour, allow stale for 24 hours while revalidating
					'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
				},
			}
		)
	} catch (error) {
		console.error('Leaderboard API error:', error)
		return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500, headers })
	}
}
