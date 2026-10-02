const ALLOWED_ORIGINS = new Set([
	'https://specto.darkroom.engineering',
	'http://tauri.localhost', // Tauri 2.x production origin
	'tauri://localhost', // legacy Tauri origin
	...(process.env.NODE_ENV === 'development'
		? ['http://localhost:3000', 'http://localhost:1420']
		: []),
])

/** CORS headers for the desktop app and the site. Disallowed origins get no Allow-Origin. */
export function corsHeaders(request: Request, methods: string): Record<string, string> {
	const origin = request.headers.get('origin')
	const headers: Record<string, string> = {
		'Access-Control-Allow-Methods': `${methods}, OPTIONS`,
		'Access-Control-Allow-Headers': 'Content-Type',
		Vary: 'Origin',
	}
	if (origin && ALLOWED_ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin
	return headers
}

export function preflight(request: Request, methods: string): Response {
	return new Response(null, { status: 204, headers: corsHeaders(request, methods) })
}
