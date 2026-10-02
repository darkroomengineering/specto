import { CustomerPortal } from '@polar-sh/nextjs'

const POLAR_ORG_ID = 'darkroomengineering'

// Validate license key and get associated customer ID
async function validateLicenseAndGetCustomerId(licenseKey: string): Promise<string | null> {
	try {
		const response = await fetch('https://api.polar.sh/v1/customer-portal/license-keys/validate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				key: licenseKey,
				organization_id: POLAR_ORG_ID,
			}),
		})

		if (!response.ok) return null

		const data = await response.json()
		if (!data.valid) return null

		// Extract customer ID from the license key validation response
		return data.customer_id ?? null
	} catch {
		return null
	}
}

export const GET = CustomerPortal({
	accessToken: process.env.POLAR_ACCESS_TOKEN ?? '',
	server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
	getCustomerId: async (req) => {
		const accessToken = process.env.POLAR_ACCESS_TOKEN
		if (!accessToken) {
			throw new Error('Server configuration error')
		}

		const { searchParams } = new URL(req.url)
		const licenseKey = searchParams.get('licenseKey')

		if (!licenseKey) {
			throw new Error('License key required for portal access')
		}

		// Validate license key and get the associated customer ID
		const customerId = await validateLicenseAndGetCustomerId(licenseKey)

		if (!customerId) {
			throw new Error('Invalid or expired license key')
		}

		return customerId
	},
})
