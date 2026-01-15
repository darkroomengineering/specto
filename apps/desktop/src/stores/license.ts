import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LicenseState {
	licenseKey: string | null
	isPro: boolean
	isValidating: boolean
	error: string | null
	activatedAt: string | null
	expiresAt: string | null

	setLicenseKey: (key: string) => Promise<void>
	validateLicense: () => Promise<boolean>
	clearLicense: () => void
}

// Polar organization ID - get this from your Polar dashboard
// This is public and identifies your org for license validation
const POLAR_ORG_ID = 'darkroomengineering'

// In development, always unlock Pro features
const IS_DEV = !import.meta.env.PROD

export const useLicenseStore = create<LicenseState>()(
	persist(
		(set, get) => ({
			licenseKey: IS_DEV ? 'dev-mode' : null,
			isPro: IS_DEV,
			isValidating: false,
			error: null,
			activatedAt: null,
			expiresAt: null,

			setLicenseKey: async (key: string) => {
				set({ licenseKey: key, isValidating: true, error: null })

				try {
					const isValid = await get().validateLicense()
					if (!isValid) {
						set({ licenseKey: null, isPro: false })
					}
				} catch (err) {
					set({
						error: err instanceof Error ? err.message : 'Validation failed',
						isPro: false,
					})
				} finally {
					set({ isValidating: false })
				}
			},

			validateLicense: async () => {
				const { licenseKey } = get()
				if (!licenseKey) {
					set({ isPro: false })
					return false
				}

				set({ isValidating: true, error: null })

				try {
					// Validate against Polar API
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
						throw new Error(errorData.detail || 'Invalid license key')
					}

					const data = await response.json()

					// Check if license is valid and not expired
					const isValid = data.valid === true
					const expiresAt = data.expires_at ? new Date(data.expires_at) : null
					const isExpired = expiresAt ? expiresAt < new Date() : false

					if (isValid && !isExpired) {
						set({
							isPro: true,
							activatedAt: data.activated_at || new Date().toISOString(),
							expiresAt: data.expires_at || null,
							error: null,
						})
						return true
					} else {
						set({
							isPro: false,
							error: isExpired ? 'License has expired' : 'Invalid license key',
						})
						return false
					}
				} catch (err) {
					set({
						isPro: false,
						error: err instanceof Error ? err.message : 'Failed to validate license',
					})
					return false
				} finally {
					set({ isValidating: false })
				}
			},

			clearLicense: () => {
				set({
					licenseKey: null,
					isPro: false,
					error: null,
					activatedAt: null,
					expiresAt: null,
				})
			},
		}),
		{
			name: 'specto:license',
			partialize: (state) => ({
				licenseKey: state.licenseKey,
				isPro: state.isPro,
				activatedAt: state.activatedAt,
				expiresAt: state.expiresAt,
			}),
		}
	)
)

// Pro feature limits
export const FREE_LIMITS = {
	maxOrganizations: 5,
	historyDays: 30,
	canExport: false,
} as const

export const PRO_LIMITS = {
	maxOrganizations: Infinity,
	historyDays: Infinity,
	canExport: true,
} as const

// Helper hook for checking feature access
export function useProFeature() {
	const { isPro } = useLicenseStore()
	// In dev mode, always Pro
	const effectiveIsPro = IS_DEV || isPro
	const limits = effectiveIsPro ? PRO_LIMITS : FREE_LIMITS

	return {
		isPro: effectiveIsPro,
		isDev: IS_DEV,
		limits,
		canAddOrg: (currentCount: number) => currentCount < limits.maxOrganizations,
		canAccessHistory: (days: number) => days <= limits.historyDays,
		canExport: limits.canExport,
	}
}
