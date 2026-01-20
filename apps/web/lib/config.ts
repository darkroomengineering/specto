// App configuration

export const GITHUB_REPO = 'darkroomengineering/specto'
export const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`

// Asset filename patterns to match in releases
// Supports both old (Specto_1.2.3_arch.ext) and new (Specto-arch.ext) naming
export const ASSET_PATTERNS = {
	macos: {
		arm64: /Specto[-_].*aarch64\.dmg$/i,
		x64: /Specto[-_].*x64\.dmg$/i,
	},
	windows: {
		exe: /Specto[-_].*x64[-_]setup\.exe$/i,
		msi: /Specto[-_].*x64.*\.msi$/i,
	},
} as const

export interface ReleaseAsset {
	name: string
	url: string
	size: number
}

export interface ReleaseInfo {
	version: string
	publishedAt: string
	assets: {
		macos: { arm64: ReleaseAsset | null; x64: ReleaseAsset | null }
		windows: { exe: ReleaseAsset | null; msi: ReleaseAsset | null }
	}
}

// Fetch latest release from GitHub API
export async function getLatestRelease(): Promise<ReleaseInfo | null> {
	try {
		const headers: HeadersInit = {
			Accept: 'application/vnd.github.v3+json',
		}

		// Use token if available for higher rate limits
		if (process.env.GITHUB_TOKEN) {
			headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
		}

		const response = await fetch(
			`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
			{
				headers,
				next: { revalidate: 3600 }, // Cache for 1 hour
			}
		)

		if (!response.ok) {
			console.error('Failed to fetch release:', response.status)
			return null
		}

		const release = await response.json()

		// Parse assets
		const assets = release.assets as Array<{
			name: string
			browser_download_url: string
			size: number
		}>

		const findAsset = (pattern: RegExp): ReleaseAsset | null => {
			const asset = assets.find((a) => pattern.test(a.name))
			return asset
				? { name: asset.name, url: asset.browser_download_url, size: asset.size }
				: null
		}

		return {
			version: release.tag_name.replace(/^v/, ''),
			publishedAt: release.published_at,
			assets: {
				macos: {
					arm64: findAsset(ASSET_PATTERNS.macos.arm64),
					x64: findAsset(ASSET_PATTERNS.macos.x64),
				},
				windows: {
					exe: findAsset(ASSET_PATTERNS.windows.exe),
					msi: findAsset(ASSET_PATTERNS.windows.msi),
				},
			},
		}
	} catch (error) {
		console.error('Error fetching release:', error)
		return null
	}
}
