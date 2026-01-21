import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboardData, LEADERBOARD_CATEGORIES, type LeaderboardCategory } from '@/lib/github'

// Enable ISR with 30 minute revalidation
export const revalidate = 1800

// Allowed origins for CORS
const ALLOWED_ORIGINS: string[] = [
	'https://specto.darkroom.engineering',
	'tauri://localhost',
	...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:1420'] : []),
]

function getCorsHeaders(request: NextRequest): Record<string, string> {
	const origin = request.headers.get('origin')
	const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] ?? 'https://specto.darkroom.engineering'
	return {
		'Access-Control-Allow-Origin': allowedOrigin,
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	}
}

export async function OPTIONS(request: NextRequest) {
	return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

export async function GET(request: NextRequest) {
	const corsHeaders = getCorsHeaders(request)
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
					...corsHeaders,
					// CDN cache for 1 hour, allow stale for 24 hours while revalidating
					'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
				},
			}
		)
	} catch (error) {
		console.error('Leaderboard API error:', error)
		return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500, headers: corsHeaders })
	}
}
