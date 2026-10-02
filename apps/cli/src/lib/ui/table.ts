import { stripVTControlCharacters } from 'node:util'
import type { OutputFormat } from '@specto/core'
import pc from 'picocolors'

interface TableColumn<T> {
	key: keyof T | ((row: T) => string | number)
	header: string
	align?: 'left' | 'right' | 'center'
	width?: number
	color?: (value: string | number) => string
}

interface TableOptions<T> {
	columns: TableColumn<T>[]
	rows: T[]
	format?: OutputFormat
	title?: string
}

function getValue<T>(row: T, column: TableColumn<T>): string {
	const value = typeof column.key === 'function' ? column.key(row) : row[column.key]
	return String(value ?? '')
}

function padString(
	str: string,
	width: number,
	align: 'left' | 'right' | 'center' = 'left'
): string {
	const stripped = stripVTControlCharacters(str)
	const padding = Math.max(0, width - stripped.length)

	if (align === 'right') {
		return ' '.repeat(padding) + str
	}
	if (align === 'center') {
		const leftPad = Math.floor(padding / 2)
		const rightPad = padding - leftPad
		return ' '.repeat(leftPad) + str + ' '.repeat(rightPad)
	}
	return str + ' '.repeat(padding)
}

export function renderTable<T>(options: TableOptions<T>): string {
	const { columns, rows, format = 'table', title } = options

	if (format === 'json') {
		return JSON.stringify(rows, null, 2)
	}

	if (format === 'csv') {
		const headers = columns.map((c) => c.header).join(',')
		const csvRows = rows.map((row) => columns.map((c) => `"${getValue(row, c)}"`).join(','))
		return [headers, ...csvRows].join('\n')
	}

	// Calculate column widths
	const widths = columns.map((col) => {
		const headerWidth = col.header.length
		const maxValueWidth = Math.max(
			...rows.map((row) => stripVTControlCharacters(getValue(row, col)).length),
			0
		)
		return col.width ?? Math.max(headerWidth, maxValueWidth)
	})

	const lines: string[] = []

	// Title
	if (title) {
		lines.push('')
		lines.push(pc.bold(title))
		lines.push('')
	}

	// Header
	const headerRow = columns
		.map((col, i) =>
			pc.bold(pc.cyan(padString(col.header, widths[i] ?? col.header.length, col.align)))
		)
		.join('  ')
	lines.push(headerRow)

	// Separator
	const separator = widths.map((w) => pc.dim('─'.repeat(w))).join('  ')
	lines.push(separator)

	// Rows
	for (const row of rows) {
		const rowValues = columns.map((col, i) => {
			const value = getValue(row, col)
			const colored = col.color ? col.color(value) : value
			return padString(colored, widths[i] ?? value.length, col.align)
		})
		lines.push(rowValues.join('  '))
	}

	lines.push('')
	return lines.join('\n')
}

export function printTable<T>(options: TableOptions<T>): void {
	console.log(renderTable(options))
}

export function printKeyValue(
	items: Array<{ key: string; value: string | number | boolean | null }>
): void {
	const maxKeyLength = Math.max(...items.map((item) => item.key.length))

	for (const { key, value } of items) {
		const paddedKey = key.padEnd(maxKeyLength)
		const formattedValue = value === null ? pc.dim('N/A') : String(value)
		console.log(`${pc.cyan(paddedKey)}  ${formattedValue}`)
	}
}

export function printSection(title: string, content?: string): void {
	console.log('')
	console.log(pc.bold(pc.underline(title)))
	if (content) {
		console.log(content)
	}
}

export function printSuccess(message: string): void {
	console.log(pc.green(`✓ ${message}`))
}

export function printError(message: string): void {
	console.log(pc.red(`✗ ${message}`))
}

export function printWarning(message: string): void {
	console.log(pc.yellow(`⚠ ${message}`))
}

export function printInfo(message: string): void {
	console.log(pc.blue(`ℹ ${message}`))
}
