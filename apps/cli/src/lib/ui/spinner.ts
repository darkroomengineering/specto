import ora, { type Ora } from 'ora'
import pc from 'picocolors'

let activeSpinner: Ora | null = null

export function createSpinner(text: string): Ora {
	if (activeSpinner) {
		activeSpinner.stop()
	}
	activeSpinner = ora({ text, color: 'cyan' })
	return activeSpinner
}

export function startSpinner(text: string): Ora {
	const spinner = createSpinner(text)
	return spinner.start()
}

export function stopSpinner(): void {
	if (activeSpinner) {
		activeSpinner.stop()
		activeSpinner = null
	}
}

export function succeedSpinner(text?: string): void {
	if (activeSpinner) {
		activeSpinner.succeed(text)
		activeSpinner = null
	}
}

export function failSpinner(text?: string): void {
	if (activeSpinner) {
		activeSpinner.fail(text)
		activeSpinner = null
	}
}

export function updateSpinner(text: string): void {
	if (activeSpinner) {
		activeSpinner.text = text
	}
}

export async function withSpinner<T>(
	text: string,
	fn: () => Promise<T>,
	options?: { successText?: string; failText?: string }
): Promise<T> {
	const spinner = startSpinner(text)
	try {
		const result = await fn()
		spinner.succeed(options?.successText ?? pc.green('Done'))
		return result
	} catch (error) {
		spinner.fail(options?.failText ?? pc.red('Failed'))
		throw error
	}
}

export function createProgressSpinner(
	total: number,
	prefix: string
): {
	update: (current: number, item?: string) => void
	succeed: (text?: string) => void
	fail: (text?: string) => void
} {
	const spinner = startSpinner(`${prefix} (0/${total})`)

	return {
		update: (current: number, item?: string) => {
			const percent = Math.round((current / total) * 100)
			const itemText = item ? ` - ${pc.dim(item)}` : ''
			spinner.text = `${prefix} (${current}/${total}) ${pc.dim(`${percent}%`)}${itemText}`
		},
		succeed: (text?: string) => {
			spinner.succeed(text ?? `${prefix} (${total}/${total})`)
		},
		fail: (text?: string) => {
			spinner.fail(text)
		},
	}
}
