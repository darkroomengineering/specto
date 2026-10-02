import { describe, expect, test } from 'bun:test'
import { formatDateHuman, formatDateRange, getDefaultDateRange } from '../src/date'

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
})
