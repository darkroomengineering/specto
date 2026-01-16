// App configuration - single source of truth for version info
// Update this when releasing new versions

export const APP_VERSION = '1.1.1'
export const RELEASE_DATE = 'January 2026'

export const GITHUB_REPO = 'darkroomengineering/specto'
export const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`

export function getDownloadUrl(filename: string, version = APP_VERSION) {
	return `${GITHUB_RELEASES_URL}/download/v${version}/${filename}`
}

// Available downloads - set file to null for coming soon
// Update these when you create GitHub releases
export const downloads = {
	macos: {
		arm64: `Specto_${APP_VERSION}_aarch64.dmg`,
		x64: `Specto_${APP_VERSION}_x64.dmg`,
	},
	windows: {
		exe: `Specto_${APP_VERSION}_x64-setup.exe`,
		msi: `Specto_${APP_VERSION}_x64_en-US.msi`,
	},
}
