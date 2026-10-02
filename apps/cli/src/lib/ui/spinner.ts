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
