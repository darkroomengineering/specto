import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { corsHeaders, preflight } from '@/lib/cors'
import { validateLicenseKey } from '@/lib/polar'

const bodySchema = z.object({ licenseKey: z.string().min(1) })

export function OPTIONS(request: NextRequest) {
	return preflight(request, 'POST')
}

export async function POST(request: NextRequest) {
	const headers = corsHeaders(request, 'POST')
	const parsed = bodySchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) {
		return NextResponse.json(
			{ valid: false, isPro: false, expiresAt: null, error: 'Invalid request body' },
			{ status: 400, headers }
		)
	}

	const result = await validateLicenseKey(parsed.data.licenseKey)
	// Bad keys are a normal outcome: 200 with valid: false
	if (!result.valid) {
		return NextResponse.json(
			{ valid: false, isPro: false, expiresAt: null, error: result.error },
			{ headers }
		)
	}
	return NextResponse.json({ valid: true, isPro: true, expiresAt: result.expiresAt }, { headers })
}
