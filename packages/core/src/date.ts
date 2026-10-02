export function getDefaultDateRange(): { since: string; until: string } {
	const year = new Date().getFullYear()
	return {
		since: `${year}-01-01T00:00:00Z`,
		until: `${year}-12-31T23:59:59Z`,
	}
}

export function formatDateHuman(date: Date | string): string {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

export function formatDateRange(since: string, until: string): string {
	return `${formatDateHuman(since)} → ${formatDateHuman(until)}`
}
