export interface Organization {
	login: string
	id: number
	name: string | null
	avatar_url: string
	description: string | null
	company: string | null
	blog: string | null
	location: string | null
	email: string | null
	twitter_username: string | null
	public_repos: number
	public_gists: number
	followers: number
	following: number
	html_url: string
	created_at: string
	updated_at: string
	type: string
	total_private_repos?: number
	owned_private_repos?: number
	private_gists?: number
	disk_usage?: number
	collaborators?: number
	billing_email?: string
	plan?: {
		name: string
		space: number
		private_repos: number
		filled_seats?: number
		seats?: number
	}
	default_repository_permission?: string
	members_can_create_repositories?: boolean
	two_factor_requirement_enabled?: boolean
	members_allowed_repository_creation_type?: string
	members_can_create_public_repositories?: boolean
	members_can_create_private_repositories?: boolean
	members_can_create_internal_repositories?: boolean
	members_can_create_pages?: boolean
	members_can_fork_private_repositories?: boolean
	web_commit_signoff_required?: boolean
	advanced_security_enabled_for_new_repositories?: boolean
	dependabot_alerts_enabled_for_new_repositories?: boolean
	dependabot_security_updates_enabled_for_new_repositories?: boolean
	dependency_graph_enabled_for_new_repositories?: boolean
	secret_scanning_enabled_for_new_repositories?: boolean
	secret_scanning_push_protection_enabled_for_new_repositories?: boolean
}

export interface Member {
	login: string
	id: number
	avatar_url: string
	html_url: string
	type: string
	site_admin: boolean
}

export interface Repository {
	id: number
	name: string
	full_name: string
	private: boolean
	html_url: string
	description: string | null
	fork: boolean
	created_at: string
	updated_at: string
	pushed_at: string
	size: number
	stargazers_count: number
	watchers_count: number
	language: string | null
	forks_count: number
	archived: boolean
	disabled: boolean
	open_issues_count: number
	default_branch: string
	visibility: string
}

export interface Team {
	id: number
	name: string
	slug: string
	description: string | null
	privacy: string
	permission: string
	members_count: number
	repos_count: number
	html_url: string
	parent: Team | null
}

export interface Webhook {
	id: number
	name: string
	active: boolean
	events: string[]
	config: {
		url?: string
		content_type?: string
		insecure_ssl?: string
	}
	updated_at: string
	created_at: string
}

export interface ActionsSettings {
	enabled_repositories: 'all' | 'none' | 'selected'
	allowed_actions?: 'all' | 'local_only' | 'selected'
	selected_actions_url?: string
}

export interface Runner {
	id: number
	name: string
	os: string
	status: string
	busy: boolean
	labels: Array<{ id: number; name: string; type: string }>
}

export interface OrgSecret {
	name: string
	created_at: string
	updated_at: string
	visibility: 'all' | 'private' | 'selected'
	selected_repositories_url?: string
}

export interface AuthorCount {
	author: string
	count: number
}

export interface PullRequestAuthorCount extends AuthorCount {
	merged: number
}

export interface IssueAuthorCount {
	author: string
	opened: number
	closed: number
}

export interface CommitActivity {
	/** Exact number of commits on default branches in the range */
	total: number
	/** Commits counted in byAuthor (after bot/author filters and page caps) */
	attributed: number
	byAuthor: AuthorCount[]
	/** Repos pushed to since the start of the range */
	repositories: number
	/** False when a repo had more commits than the per-repo page cap */
	complete: boolean
}

export interface PullRequestActivity {
	total: number
	/** Items inspected for byAuthor (search caps at 1,000) */
	sampled: number
	byAuthor: PullRequestAuthorCount[]
	complete: boolean
}

export interface IssueActivity {
	total: number
	sampled: number
	byAuthor: IssueAuthorCount[]
	complete: boolean
}

export interface OrgTeam {
	id: string
	slug: string
	name: string
	description: string | null
	privacy: 'SECRET' | 'VISIBLE'
	url: string
	memberCount: number
	repositoryCount: number
	parentName: string | null
}

export interface OrgOverview {
	login: string
	name: string | null
	description: string | null
	avatarUrl: string
	url: string
	websiteUrl: string | null
	location: string | null
	createdAt: string
	repositoryCount: number
	memberCount: number
	teams: OrgTeam[]
}

export interface OrgSuggestion {
	login: string
	avatarUrl: string
}

export type OutputFormat = 'table' | 'json' | 'csv'
