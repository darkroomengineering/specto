export function getDefaultDateRange(): { since: string; until: string } {
	const now = new Date()
	const year = now.getFullYear()

	return {
		since: `${year}-01-01T00:00:00Z`,
		until: `${year}-12-31T23:59:59Z`,
	}
}

export function parseDate(input: string): Date {
	const date = new Date(input)
	if (Number.isNaN(date.getTime())) {
		throw new Error(`Invalid date format: ${input}`)
	}
	return date
}

export function formatDateISO(date: Date): string {
	return date.toISOString()
}

export function formatDateHuman(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

export function formatDateRange(since: string, until: string): string {
	return `${formatDateHuman(since)} → ${formatDateHuman(until)}`
}

export function ensureISOFormat(date: string): string {
	const d = parseDate(date)
	return formatDateISO(d)
}

export function getQuarterDates(
	year: number,
	quarter: 1 | 2 | 3 | 4
): { since: string; until: string } {
	const quarterStarts = [
		{ month: 0, day: 1 },
		{ month: 3, day: 1 },
		{ month: 6, day: 1 },
		{ month: 9, day: 1 },
	]
	const quarterEnds = [
		{ month: 2, day: 31 },
		{ month: 5, day: 30 },
		{ month: 8, day: 30 },
		{ month: 11, day: 31 },
	]

	const start = quarterStarts[quarter - 1]
	const end = quarterEnds[quarter - 1]

	if (!start || !end) {
		throw new Error(`Invalid quarter: ${quarter}`)
	}

	return {
		since: new Date(year, start.month, start.day).toISOString(),
		until: new Date(year, end.month, end.day, 23, 59, 59).toISOString(),
	}
}

export function getMonthDates(year: number, month: number): { since: string; until: string } {
	if (month < 1 || month > 12) {
		throw new Error(`Invalid month: ${month}`)
	}

	const lastDay = new Date(year, month, 0).getDate()

	return {
		since: new Date(year, month - 1, 1).toISOString(),
		until: new Date(year, month - 1, lastDay, 23, 59, 59).toISOString(),
	}
}
