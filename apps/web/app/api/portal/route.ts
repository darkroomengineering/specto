import { CustomerPortal } from '@polar-sh/nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { polarServer, validateLicenseKey } from '@/lib/polar'

let handler: ReturnType<typeof CustomerPortal> | undefined

export async function GET(request: NextRequest) {
	const accessToken = process.env.POLAR_ACCESS_TOKEN
	if (!accessToken) {
		console.error('Portal requires POLAR_ACCESS_TOKEN')
		return NextResponse.json({ error: 'Portal is not configured' }, { status: 503 })
	}

	handler ??= CustomerPortal({
		accessToken,
		server: polarServer,
		getCustomerId: async (req) => {
			const licenseKey = new URL(req.url).searchParams.get('licenseKey')
			if (!licenseKey) throw new Error('License key required for portal access')

			const license = await validateLicenseKey(licenseKey)
			if (!license.valid || !license.customerId) throw new Error('Invalid or expired license key')
			return license.customerId
		},
	})
	return handler(request)
}
