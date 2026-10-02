import { createGitHubClient, type GitHubClient } from '@specto/core'
import { getToken } from '@specto/core/node'

let client: Promise<GitHubClient> | undefined

/** Shared client, created on first use so commands that don't hit GitHub skip token lookup */
export function github(): Promise<GitHubClient> {
	client ??= getToken().then((token) => createGitHubClient({ token, userAgent: 'specto-cli' }))
	return client
}
