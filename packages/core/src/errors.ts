export class GitHubError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public body?: string
	) {
		super(`GitHub API error: ${status} ${statusText}${body ? ` - ${body}` : ''}`)
		this.name = 'GitHubError'
	}
}

export class RateLimitError extends GitHubError {
	constructor(
		public resetAt: Date,
		body?: string
	) {
		super(403, 'Rate Limit Exceeded', body)
		this.name = 'RateLimitError'
	}
}

export class AuthError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'AuthError'
	}
}
