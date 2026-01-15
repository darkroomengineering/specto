// App configuration - single source of truth for version info
// Update this when releasing new versions

export const APP_VERSION = '1.1.0'
export const RELEASE_DATE = 'January 2025'

export const GITHUB_REPO = 'darkroomengineering/specto'
export const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`

export function getDownloadUrl(filename: string, version = APP_VERSION) {
	return `${GITHUB_RELEASES_URL}/download/v${version}/${filename}`
}

// Available downloads - set file to null for coming soon
// Update these when you create GitHub releases
export const downloads = {
	macos: {
		arm64: null as string | null, // `Specto_${APP_VERSION}_aarch64.dmg` when released
		x64: null as string | null, // Intel - coming soon
	},
	windows: {
		exe: null as string | null, // Installer - coming soon
		msi: null as string | null, // MSI - coming soon
	},
}
