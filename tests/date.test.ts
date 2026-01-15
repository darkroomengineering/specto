import { describe, expect, test } from 'bun:test'
import {
	getDefaultDateRange,
	parseDate,
	formatDateHuman,
	formatDateRange,
	ensureISOFormat,
	getQuarterDates,
	getMonthDates,
} from '../src/lib/utils/date'

describe('date utilities', () => {
	describe('getDefaultDateRange', () => {
		test('returns current year range', () => {
			const { since, until } = getDefaultDateRange()
			const year = new Date().getFullYear()

			expect(since).toContain(`${year}-01-01`)
			expect(until).toContain(`${year}-12-31`)
		})

		test('returns valid ISO strings', () => {
			const { since, until } = getDefaultDateRange()

			expect(() => new Date(since)).not.toThrow()
			expect(() => new Date(until)).not.toThrow()
		})
	})

	describe('parseDate', () => {
		test('parses ISO format', () => {
			const date = parseDate('2025-06-15T12:00:00Z')
			expect(date.getFullYear()).toBe(2025)
			expect(date.getMonth()).toBe(5) // 0-indexed
			expect(date.getDate()).toBe(15)
		})

		test('parses simple date format', () => {
			const date = parseDate('2025-06-15')
			expect(date.getFullYear()).toBe(2025)
		})

		test('throws on invalid date', () => {
			expect(() => parseDate('not-a-date')).toThrow('Invalid date format')
		})
	})

	describe('formatDateHuman', () => {
		test('formats date string', () => {
			const result = formatDateHuman('2025-06-15T00:00:00Z')
			expect(result).toContain('Jun')
			expect(result).toContain('15')
			expect(result).toContain('2025')
		})

		test('formats Date object', () => {
			const date = new Date('2025-12-25T00:00:00Z')
			const result = formatDateHuman(date)
			expect(result).toContain('Dec')
			expect(result).toContain('25')
		})
	})

	describe('formatDateRange', () => {
		test('formats range with arrow', () => {
			const result = formatDateRange('2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z')
			expect(result).toContain('→')
			expect(result).toContain('Jan')
			expect(result).toContain('Dec')
		})
	})

	describe('ensureISOFormat', () => {
		test('converts simple date to ISO', () => {
			const result = ensureISOFormat('2025-06-15')
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
		})

		test('passes through ISO dates', () => {
			const iso = '2025-06-15T12:00:00.000Z'
			const result = ensureISOFormat(iso)
			expect(result).toBe(iso)
		})
	})

	describe('getQuarterDates', () => {
		test('Q1 starts Jan 1', () => {
			const { since } = getQuarterDates(2025, 1)
			const date = new Date(since)
			expect(date.getMonth()).toBe(0)
			expect(date.getDate()).toBe(1)
		})

		test('Q2 starts Apr 1', () => {
			const { since } = getQuarterDates(2025, 2)
			const date = new Date(since)
			expect(date.getMonth()).toBe(3)
		})

		test('Q3 starts Jul 1', () => {
			const { since } = getQuarterDates(2025, 3)
			const date = new Date(since)
			expect(date.getMonth()).toBe(6)
		})

		test('Q4 starts Oct 1', () => {
			const { since } = getQuarterDates(2025, 4)
			const date = new Date(since)
			expect(date.getMonth()).toBe(9)
		})

		test('throws on invalid quarter', () => {
			expect(() => getQuarterDates(2025, 5 as 1 | 2 | 3 | 4)).toThrow('Invalid quarter')
		})
	})

	describe('getMonthDates', () => {
		test('returns correct month range', () => {
			const { since, until } = getMonthDates(2025, 6)
			const start = new Date(since)
			const end = new Date(until)

			expect(start.getMonth()).toBe(5) // June is 5 (0-indexed)
			expect(start.getDate()).toBe(1)
			expect(end.getMonth()).toBe(5)
			expect(end.getDate()).toBe(30) // June has 30 days
		})

		test('handles February correctly', () => {
			const { until } = getMonthDates(2025, 2)
			const end = new Date(until)
			expect(end.getDate()).toBe(28) // 2025 is not a leap year
		})

		test('handles leap year February', () => {
			const { until } = getMonthDates(2024, 2)
			const end = new Date(until)
			expect(end.getDate()).toBe(29) // 2024 is a leap year
		})

		test('throws on invalid month', () => {
			expect(() => getMonthDates(2025, 0)).toThrow('Invalid month')
			expect(() => getMonthDates(2025, 13)).toThrow('Invalid month')
		})
	})
})
