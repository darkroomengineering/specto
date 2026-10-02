// Node-only helpers: discover a GitHub token from the environment or the gh CLI
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { AuthError } from './errors'

const exec = promisify(execFile)

export type AuthMethod = 'gh-cli' | 'token' | 'none'

export interface AuthResult {
	method: AuthMethod
	token: string | null
}

async function gh(...args: string[]): Promise<string | null> {
	try {
		const { stdout } = await exec('gh', args)
		return stdout.trim() || null
	} catch {
		return null
	}
}

export async function isGhCliAvailable(): Promise<boolean> {
	return (await gh('--version')) !== null
}

export async function detectAuth(): Promise<AuthResult> {
	const envToken = process.env['GITHUB_TOKEN'] || process.env['GH_TOKEN']
	if (envToken) return { method: 'token', token: envToken }

	const ghToken = await gh('auth', 'token')
	if (ghToken) return { method: 'gh-cli', token: ghToken }

	return { method: 'none', token: null }
}

export async function getToken(): Promise<string> {
	const { token } = await detectAuth()
	if (!token) {
		throw new AuthError(
			'No GitHub authentication found. Either:\n' +
				'  1. Set GITHUB_TOKEN environment variable\n' +
				'  2. Run `gh auth login` to authenticate with GitHub CLI'
		)
	}
	return token
}

export async function getAuthStatus(): Promise<{
	method: AuthMethod
	valid: boolean
	username?: string
	scopes?: string[]
}> {
	const { method, token } = await detectAuth()
	if (!token) return { method: 'none', valid: false }

	try {
		const response = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
			},
		})
		if (!response.ok) return { method, valid: false }

		const user = (await response.json()) as { login: string }
		const scopes = response.headers.get('x-oauth-scopes')?.split(', ').filter(Boolean) ?? []
		return { method, valid: true, username: user.login, scopes }
	} catch {
		return { method, valid: false }
	}
}
