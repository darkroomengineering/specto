import { timingSafeEqual } from 'node:crypto'
import { Polar } from '@polar-sh/sdk'
import { ResourceNotFound } from '@polar-sh/sdk/models/errors/resourcenotfound.js'

export const polarServer = process.env.POLAR_SERVER === 'sandbox' ? 'sandbox' : 'production'

export type LicenseResult =
	| { valid: true; expiresAt: string | null; customerId: string | null }
	| { valid: false; error: string }

function isMasterKey(key: string): boolean {
	const master = process.env.MASTER_LICENSE_KEY
	if (!master) return false
	const a = Buffer.from(key)
	const b = Buffer.from(master)
	return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Validates a license key against Polar. The validate endpoint is public:
 * it needs the organization UUID but no access token.
 */
export async function validateLicenseKey(key: string): Promise<LicenseResult> {
	if (isMasterKey(key)) return { valid: true, expiresAt: null, customerId: null }

	const organizationId = process.env.POLAR_ORGANIZATION_ID
	if (!organizationId) {
		console.error('POLAR_ORGANIZATION_ID is not set; cannot validate license keys')
		return { valid: false, error: 'License validation is not configured' }
	}

	try {
		const polar = new Polar({ server: polarServer })
		const license = await polar.customerPortal.licenseKeys.validate({ key, organizationId })

		if (license.status !== 'granted') return { valid: false, error: 'Invalid license key' }
		if (license.expiresAt && license.expiresAt < new Date()) {
			return { valid: false, error: 'License has expired' }
		}
		return {
			valid: true,
			expiresAt: license.expiresAt ? license.expiresAt.toISOString() : null,
			customerId: license.customerId,
		}
	} catch (error) {
		if (error instanceof ResourceNotFound) return { valid: false, error: 'Invalid license key' }
		console.error('Polar license validation failed:', error)
		return { valid: false, error: 'Validation service unavailable' }
	}
}
