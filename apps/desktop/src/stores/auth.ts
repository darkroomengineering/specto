import { Command } from '@tauri-apps/plugin-shell'
import { create } from 'zustand'

// Try multiple paths for gh CLI (macOS GUI apps don't inherit terminal PATH)
const GH_TOKEN_COMMANDS = [
	'gh-auth-token-homebrew', // /opt/homebrew/bin/gh (Apple Silicon)
	'gh-auth-token-local', // /usr/local/bin/gh (Intel Mac)
	'gh-auth-token', // gh in PATH (fallback)
]

const GH_LOGIN_COMMANDS = ['gh-auth-login-homebrew', 'gh-auth-login-local', 'gh-auth-login']

// Try executing gh auth token with multiple paths
async function tryGetToken(): Promise<{ token: string; commandIndex: number } | null> {
	for (let i = 0; i < GH_TOKEN_COMMANDS.length; i++) {
		const cmdName = GH_TOKEN_COMMANDS[i]
		if (!cmdName) continue
		try {
			const cmd = Command.create(cmdName)
			const result = await cmd.execute()
			if (result.code === 0 && result.stdout.trim()) {
				return { token: result.stdout.trim(), commandIndex: i }
			}
		} catch {
			// Try next path
		}
	}
	return null
}

interface AuthState {
	isAuthenticated: boolean
	isLoading: boolean
	username: string | null
	error: string | null
	ghNotInstalled: boolean
	checkAuth: () => Promise<void>
	getToken: () => Promise<string | null>
	login: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: false,
	isLoading: true,
	username: null,
	error: null,
	ghNotInstalled: false,

	checkAuth: async () => {
		set({ isLoading: true, error: null, ghNotInstalled: false })

		try {
			const result = await tryGetToken()

			if (!result) {
				set({
					isAuthenticated: false,
					isLoading: false,
					username: null,
					error: 'GitHub CLI not found or not authenticated',
					ghNotInstalled: true,
				})
				return
			}

			// Validate token and get username
			const response = await fetch('https://api.github.com/user', {
				headers: {
					Authorization: `Bearer ${result.token}`,
					Accept: 'application/vnd.github+json',
				},
			})

			if (!response.ok) {
				set({
					isAuthenticated: false,
					isLoading: false,
					username: null,
					error: 'Invalid or expired token. Please run: gh auth login',
					ghNotInstalled: false,
				})
				return
			}

			const user = (await response.json()) as { login: string }
			set({
				isAuthenticated: true,
				isLoading: false,
				username: user.login,
				error: null,
				ghNotInstalled: false,
			})
		} catch (err) {
			set({
				isAuthenticated: false,
				isLoading: false,
				username: null,
				error: err instanceof Error ? err.message : 'Failed to check authentication',
				ghNotInstalled: false,
			})
		}
	},

	getToken: async () => {
		const result = await tryGetToken()
		return result?.token ?? null
	},

	login: async () => {
		// Try to launch gh auth login --web
		for (const cmdName of GH_LOGIN_COMMANDS) {
			try {
				const cmd = Command.create(cmdName)
				await cmd.spawn()
				return
			} catch {
				// Try next path
			}
		}
	},
}))
