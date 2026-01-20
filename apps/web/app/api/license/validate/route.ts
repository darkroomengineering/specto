import { NextRequest, NextResponse } from 'next/server'

const POLAR_ORG_ID = 'darkroomengineering'

// Master license key (set in environment, never expires)
const MASTER_LICENSE_KEY = process.env.MASTER_LICENSE_KEY

interface ValidateRequest {
	licenseKey: string
}

interface LicenseResponse {
	valid: boolean
	isPro: boolean
	expiresAt: string | null
	error?: string
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest): Promise<NextResponse<LicenseResponse>> {
	try {
		const body = await request.json().catch(() => null)

		// Validate request body structure
		if (!body || typeof body !== 'object' || typeof body.licenseKey !== 'string') {
			return NextResponse.json(
				{ valid: false, isPro: false, expiresAt: null, error: 'Invalid request body' },
				{ status: 400, headers: corsHeaders }
			)
		}

		const { licenseKey } = body as ValidateRequest

		if (!licenseKey) {
			return NextResponse.json(
				{ valid: false, isPro: false, expiresAt: null, error: 'License key required' },
				{ status: 400, headers: corsHeaders }
			)
		}

		// Check master license key (for team use, never expires)
		if (MASTER_LICENSE_KEY && licenseKey === MASTER_LICENSE_KEY) {
			return NextResponse.json({
				valid: true,
				isPro: true,
				expiresAt: null, // Never expires
			}, { headers: corsHeaders })
		}

		// Validate against Polar API (server-side, can't be bypassed)
		const response = await fetch(
			'https://api.polar.sh/v1/customer-portal/license-keys/validate',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					key: licenseKey,
					organization_id: POLAR_ORG_ID,
				}),
			}
		)

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			return NextResponse.json(
				{ valid: false, isPro: false, expiresAt: null, error: errorData.detail || 'Invalid license key' },
				{ status: 200, headers: corsHeaders } // Return 200 with valid: false, not 4xx
			)
		}

		const data = await response.json()

		const isValid = data.valid === true
		const expiresAt = data.expires_at || null
		const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false

		if (isValid && !isExpired) {
			return NextResponse.json({
				valid: true,
				isPro: true,
				expiresAt,
			}, { headers: corsHeaders })
		}

		return NextResponse.json({
			valid: false,
			isPro: false,
			expiresAt,
			error: isExpired ? 'License has expired' : 'Invalid license key',
		}, { headers: corsHeaders })
	} catch (error) {
		console.error('License validation error:', error)
		return NextResponse.json(
			{ valid: false, isPro: false, expiresAt: null, error: 'Validation service unavailable' },
			{ status: 500, headers: corsHeaders }
		)
	}
}
