'use client'

import type { ComponentProps } from 'react'
import { type ExternalToast, Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'

// =============================================================================
// Toaster Component
// =============================================================================

export interface ToasterProps extends ComponentProps<typeof SonnerToaster> {}

/**
 * Specto-styled toast container
 *
 * @example
 * ```tsx
 * // In your root layout
 * <SpectoToaster />
 * ```
 */
export function SpectoToaster(props: ToasterProps) {
	return (
		<SonnerToaster
			position="bottom-right"
			expand={false}
			richColors
			closeButton
			toastOptions={{
				style: {
					background: 'var(--card)',
					border: '1px solid var(--border)',
					color: 'var(--foreground)',
				},
				classNames: {
					toast: 'group',
					title: 'text-sm font-medium',
					description: 'text-xs text-[var(--muted)]',
					actionButton: 'bg-[var(--color-primary)] text-white text-xs px-2 py-1 rounded',
					cancelButton: 'bg-[var(--card-hover)] text-[var(--foreground)] text-xs px-2 py-1 rounded',
					closeButton:
						'bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:bg-[var(--card-hover)]',
					success: 'border-[var(--color-success)]/30 [&_[data-icon]]:text-[var(--color-success)]',
					error: 'border-[var(--color-error)]/30 [&_[data-icon]]:text-[var(--color-error)]',
					warning: 'border-[var(--color-warning)]/30 [&_[data-icon]]:text-[var(--color-warning)]',
					info: 'border-[var(--color-info)]/30 [&_[data-icon]]:text-[var(--color-info)]',
				},
			}}
			{...props}
		/>
	)
}

// =============================================================================
// Toast Functions
// =============================================================================

type ToastMessage = string | React.ReactNode
type ToastOptions = ExternalToast

/**
 * Specto toast notification functions
 *
 * @example
 * ```tsx
 * import { toast } from '@specto/ui'
 *
 * toast.success('Changes saved!')
 * toast.error('Something went wrong')
 * toast.warning('This action cannot be undone')
 * toast.info('New update available')
 * toast.promise(saveData(), {
 *   loading: 'Saving...',
 *   success: 'Saved!',
 *   error: 'Failed to save',
 * })
 * ```
 */
export const toast = {
	/**
	 * Show a default toast
	 */
	default: (message: ToastMessage, options?: ToastOptions) => {
		return sonnerToast(message, options)
	},

	/**
	 * Show a success toast
	 */
	success: (message: ToastMessage, options?: ToastOptions) => {
		return sonnerToast.success(message, options)
	},

	/**
	 * Show an error toast
	 */
	error: (message: ToastMessage, options?: ToastOptions) => {
		return sonnerToast.error(message, options)
	},

	/**
	 * Show a warning toast
	 */
	warning: (message: ToastMessage, options?: ToastOptions) => {
		return sonnerToast.warning(message, options)
	},

	/**
	 * Show an info toast
	 */
	info: (message: ToastMessage, options?: ToastOptions) => {
		return sonnerToast.info(message, options)
	},

	/**
	 * Show a loading toast
	 */
	loading: (message: ToastMessage, options?: ToastOptions) => {
		return sonnerToast.loading(message, options)
	},

	/**
	 * Show a promise-based toast that updates based on promise state
	 */
	promise: <T,>(
		promise: Promise<T> | (() => Promise<T>),
		options: {
			loading: ToastMessage
			success: ToastMessage | ((data: T) => ToastMessage)
			error: ToastMessage | ((error: unknown) => ToastMessage)
			description?: ToastMessage
			finally?: () => void
		}
	) => {
		return sonnerToast.promise(promise, options)
	},

	/**
	 * Show a custom toast with action buttons
	 */
	action: (
		message: ToastMessage,
		options: ToastOptions & {
			action: {
				label: string
				onClick: () => void
			}
		}
	) => {
		return sonnerToast(message, options)
	},

	/**
	 * Dismiss a specific toast or all toasts
	 */
	dismiss: (toastId?: string | number) => {
		return sonnerToast.dismiss(toastId)
	},

	/**
	 * Show a message toast (alias for default)
	 */
	message: (message: ToastMessage, options?: ToastOptions) => {
		return sonnerToast.message(message, options)
	},
}

// Re-export the raw sonner toast for advanced usage
export { sonnerToast }
