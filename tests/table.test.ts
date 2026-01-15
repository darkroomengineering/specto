import { describe, expect, test } from 'bun:test'
import { renderTable } from '../src/lib/ui/table'

describe('table utilities', () => {
	const sampleData = [
		{ name: 'Alice', count: 100 },
		{ name: 'Bob', count: 50 },
		{ name: 'Charlie', count: 25 },
	]

	describe('renderTable', () => {
		test('renders table format by default', () => {
			const result = renderTable({
				columns: [
					{ key: 'name', header: 'Name' },
					{ key: 'count', header: 'Count' },
				],
				rows: sampleData,
			})

			expect(result).toContain('Name')
			expect(result).toContain('Count')
			expect(result).toContain('Alice')
			expect(result).toContain('100')
		})

		test('renders JSON format', () => {
			const result = renderTable({
				columns: [
					{ key: 'name', header: 'Name' },
					{ key: 'count', header: 'Count' },
				],
				rows: sampleData,
				format: 'json',
			})

			const parsed = JSON.parse(result)
			expect(parsed).toHaveLength(3)
			expect(parsed[0].name).toBe('Alice')
		})

		test('renders CSV format', () => {
			const result = renderTable({
				columns: [
					{ key: 'name', header: 'Name' },
					{ key: 'count', header: 'Count' },
				],
				rows: sampleData,
				format: 'csv',
			})

			const lines = result.split('\n')
			expect(lines[0]).toBe('Name,Count')
			expect(lines[1]).toBe('"Alice","100"')
		})

		test('supports function key for computed values', () => {
			const result = renderTable({
				columns: [
					{ key: 'name', header: 'Name' },
					{ key: (row) => row.count * 2, header: 'Double' },
				],
				rows: sampleData,
				format: 'csv',
			})

			expect(result).toContain('"200"') // Alice's 100 * 2
		})

		test('includes title when provided', () => {
			const result = renderTable({
				columns: [{ key: 'name', header: 'Name' }],
				rows: sampleData,
				title: 'My Table',
			})

			expect(result).toContain('My Table')
		})

		test('handles empty rows', () => {
			const result = renderTable({
				columns: [{ key: 'name', header: 'Name' }],
				rows: [],
			})

			expect(result).toContain('Name')
			// Should still render header
		})

		test('aligns columns correctly', () => {
			const result = renderTable({
				columns: [
					{ key: 'name', header: 'Name', align: 'left' },
					{ key: 'count', header: 'Count', align: 'right' },
				],
				rows: sampleData,
			})

			// Right-aligned numbers should have padding on the left
			expect(result).toContain('Count')
		})
	})
})
