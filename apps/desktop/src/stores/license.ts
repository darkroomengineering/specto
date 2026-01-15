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

// Server-side validation endpoint (cannot be bypassed)
const API_BASE = import.meta.env.PROD
	? 'https://specto.darkroom.engineering'
	: 'http://localhost:3000'

// Dev mode bypass requires a special env var (not just running in dev)
// This prevents cloning the repo and getting Pro features for free
const IS_DEV = !import.meta.env.PROD && import.meta.env.VITE_DEV_UNLOCK === 'true'

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
					// Validate via server-side API (cannot be bypassed by patching client)
					const response = await fetch(`${API_BASE}/api/license/validate`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ licenseKey }),
					})

					const data = await response.json()

					if (data.valid && data.isPro) {
						set({
							isPro: true,
							activatedAt: new Date().toISOString(),
							expiresAt: data.expiresAt || null,
							error: null,
						})
						return true
					} else {
						set({
							isPro: false,
							error: data.error || 'Invalid license key',
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

// Server-side export (requires valid license, cannot be bypassed)
export async function exportData(
	format: 'csv' | 'json',
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
	}
): Promise<{ success: boolean; error?: string; blob?: Blob; filename?: string }> {
	const { licenseKey } = useLicenseStore.getState()

	if (!licenseKey) {
		return { success: false, error: 'Pro license required for export' }
	}

	try {
		const response = await fetch(`${API_BASE}/api/export`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				licenseKey,
				format,
				data: {
					...data,
					generatedAt: new Date().toISOString(),
				},
			}),
		})

		if (!response.ok) {
			const err = await response.json().catch(() => ({}))
			return { success: false, error: err.error || 'Export failed' }
		}

		const blob = await response.blob()
		const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1]
			|| `specto-export.${format}`

		return { success: true, blob, filename }
	} catch (err) {
		return { success: false, error: 'Export service unavailable' }
	}
}
