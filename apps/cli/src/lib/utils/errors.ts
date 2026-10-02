import { AuthError, GitHubError, RateLimitError } from '@specto/core'
import pc from 'picocolors'

export function formatError(error: unknown): string {
	if (error instanceof AuthError) {
		return `${pc.red('Authentication Error')}\n\n${error.message}`
	}

	if (error instanceof RateLimitError) {
		const resetTime = error.resetAt.toLocaleTimeString()
		return `${pc.red('Rate Limit Exceeded')}\n\nGitHub API rate limit reached. Resets at ${pc.yellow(resetTime)}`
	}

	if (error instanceof GitHubError) {
		if (error.status === 404) {
			return `${pc.red('Not Found')}\n\nThe requested resource was not found. Check that the organization name is correct and you have access to it.`
		}
		if (error.status === 403) {
			return `${pc.red('Access Denied')}\n\nYou don't have permission to access this resource. Some features require admin access.`
		}
		if (error.status === 401) {
			return `${pc.red('Unauthorized')}\n\nYour authentication token is invalid or expired. Try re-authenticating.`
		}
		return `${pc.red('GitHub API Error')}\n\n${error.message}`
	}

	if (error instanceof Error) {
		return `${pc.red('Error')}\n\n${error.message}`
	}

	return `${pc.red('Unknown Error')}\n\n${String(error)}`
}

export function handleError(error: unknown): never {
	console.error(formatError(error))
	process.exit(1)
}

// biome-ignore lint/suspicious/noExplicitAny: Commander callback types are complex
export function wrapCommand<T extends (...args: any[]) => Promise<void>>(fn: T): T {
	// biome-ignore lint/suspicious/noExplicitAny: Commander callback types are complex
	return (async (...args: any[]) => {
		try {
			await fn(...args)
		} catch (error) {
			handleError(error)
		}
	}) as T
}
