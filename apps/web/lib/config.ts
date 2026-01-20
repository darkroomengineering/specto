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

// Parse assets from a release
function parseReleaseAssets(release: {
	tag_name: string
	published_at: string
	assets: Array<{ name: string; browser_download_url: string; size: number }>
}): ReleaseInfo {
	const findAsset = (pattern: RegExp): ReleaseAsset | null => {
		const asset = release.assets.find((a) => pattern.test(a.name))
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
}

// Check if release has at least one downloadable asset
function hasDownloadableAssets(info: ReleaseInfo): boolean {
	return !!(
		info.assets.macos.arm64 ||
		info.assets.macos.x64 ||
		info.assets.windows.exe ||
		info.assets.windows.msi
	)
}

// Fetch latest release from GitHub API
// Falls back to previous releases if latest has no assets (build in progress)
export async function getLatestRelease(): Promise<ReleaseInfo | null> {
	try {
		const headers: HeadersInit = {
			Accept: 'application/vnd.github.v3+json',
		}

		// Use token if available for higher rate limits
		if (process.env.GITHUB_TOKEN) {
			headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
		}

		// Fetch multiple releases to find one with assets
		const response = await fetch(
			`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=5`,
			{
				headers,
				next: { revalidate: 60 }, // Cache for 1 minute to pick up new builds quickly
			}
		)

		if (!response.ok) {
			console.error('Failed to fetch releases:', response.status)
			return null
		}

		const releases = await response.json() as Array<{
			tag_name: string
			published_at: string
			draft: boolean
			prerelease: boolean
			assets: Array<{ name: string; browser_download_url: string; size: number }>
		}>

		// Find first non-draft release with downloadable assets
		for (const release of releases) {
			if (release.draft || release.prerelease) continue

			const info = parseReleaseAssets(release)
			if (hasDownloadableAssets(info)) {
				return info
			}
		}

		// If no release has assets, return the latest version info anyway
		const firstRelease = releases[0]
		if (firstRelease) {
			return parseReleaseAssets(firstRelease)
		}

		return null
	} catch (error) {
		console.error('Error fetching release:', error)
		return null
	}
}
