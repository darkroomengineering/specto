import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboardData, LEADERBOARD_CATEGORIES, type LeaderboardCategory } from '@/lib/github'

// Disable Next.js route caching - we handle caching in getLeaderboardData
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const category = searchParams.get('category') as LeaderboardCategory | null

	// Validate category
	const validCategory = LEADERBOARD_CATEGORIES.find(c => c.value === category)?.value || 'developer-favorites'

	try {
		const data = await getLeaderboardData(validCategory)
		return NextResponse.json(
			{ data, category: validCategory },
			{
				headers: {
					'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
				},
			}
		)
	} catch (error) {
		console.error('Leaderboard API error:', error)
		return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
	}
}
