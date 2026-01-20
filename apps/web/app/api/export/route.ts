import { NextRequest, NextResponse } from 'next/server'

const POLAR_ORG_ID = 'darkroomengineering'

// Master license key (set in environment, never expires)
const MASTER_LICENSE_KEY = process.env.MASTER_LICENSE_KEY

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders })
}

interface ExportRequest {
	licenseKey: string
	format: 'csv' | 'json'
	data: {
		organization: string
		metrics: {
			commits: number
			pullRequests: number
			issues: number
			contributors: number
			repositories: number
			stars: number
		}
		period: string
		generatedAt: string
	}
}

// Validate license server-side
async function validateLicense(licenseKey: string): Promise<boolean> {
	// Check master license key first
	if (MASTER_LICENSE_KEY && licenseKey === MASTER_LICENSE_KEY) {
		return true
	}

	try {
		const response = await fetch(
			'https://api.polar.sh/v1/customer-portal/license-keys/validate',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					key: licenseKey,
					organization_id: POLAR_ORG_ID,
				}),
			}
		)

		if (!response.ok) return false

		const data = await response.json()
		const isValid = data.valid === true
		const expiresAt = data.expires_at ? new Date(data.expires_at) : null
		const isExpired = expiresAt ? expiresAt < new Date() : false

		return isValid && !isExpired
	} catch {
		return false
	}
}

function generateCSV(data: ExportRequest['data']): string {
	const lines = [
		'Metric,Value',
		`Organization,${data.organization}`,
		`Period,${data.period}`,
		`Commits,${data.metrics.commits}`,
		`Pull Requests,${data.metrics.pullRequests}`,
		`Issues,${data.metrics.issues}`,
		`Contributors,${data.metrics.contributors}`,
		`Repositories,${data.metrics.repositories}`,
		`Stars,${data.metrics.stars}`,
		`Generated At,${data.generatedAt}`,
	]
	return lines.join('\n')
}

export async function POST(request: NextRequest) {
	try {
		const body: ExportRequest = await request.json()
		const { licenseKey, format, data } = body

		// Validate license server-side (cannot be bypassed)
		if (!licenseKey) {
			return NextResponse.json(
				{ error: 'License key required for export' },
				{ status: 401, headers: corsHeaders }
			)
		}

		const isValid = await validateLicense(licenseKey)
		if (!isValid) {
			return NextResponse.json(
				{ error: 'Valid Pro license required for export' },
				{ status: 403, headers: corsHeaders }
			)
		}

		// Generate export
		if (format === 'csv') {
			const csv = generateCSV(data)
			return new NextResponse(csv, {
				headers: {
					...corsHeaders,
					'Content-Type': 'text/csv',
					'Content-Disposition': `attachment; filename="specto-${data.organization}-${Date.now()}.csv"`,
				},
			})
		}

		// JSON format
		return NextResponse.json(data, {
			headers: {
				...corsHeaders,
				'Content-Disposition': `attachment; filename="specto-${data.organization}-${Date.now()}.json"`,
			},
		})
	} catch (error) {
		console.error('Export error:', error)
		return NextResponse.json(
			{ error: 'Export failed' },
			{ status: 500, headers: corsHeaders }
		)
	}
}
