'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface ErrorBoundaryProps {
	children: ReactNode
	/** Custom fallback UI */
	fallback?: ReactNode
	/** Callback when error is caught */
	onError?: (error: Error, errorInfo: ErrorInfo) => void
	/** Custom error message */
	errorMessage?: string
	/** Show reload button */
	showReload?: boolean
}

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

/**
 * ErrorBoundary component to catch and handle React errors gracefully
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error) => console.error(error)}
 *   errorMessage="Something went wrong"
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		this.props.onError?.(error, errorInfo)
	}

	handleReload = (): void => {
		window.location.reload()
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null })
	}

	override render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<ErrorFallback
					error={this.state.error}
					errorMessage={this.props.errorMessage}
					showReload={this.props.showReload}
					onReload={this.handleReload}
					onReset={this.handleReset}
				/>
			)
		}

		return this.props.children
	}
}

interface ErrorFallbackProps {
	error: Error | null
	errorMessage?: string
	showReload?: boolean
	onReload: () => void
	onReset: () => void
}

function ErrorFallback({
	error,
	errorMessage = 'Something went wrong',
	showReload = true,
	onReload,
	onReset,
}: ErrorFallbackProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center min-h-[200px] p-6',
				'rounded-lg border border-[var(--border)] bg-[var(--card)]'
			)}
			role="alert"
		>
			{/* Error Icon */}
			<div className="w-12 h-12 mb-4 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center">
				<svg
					className="w-6 h-6 text-[var(--color-error)]"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			{/* Error Message */}
			<h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
				{errorMessage}
			</h3>

			{/* Error Details (shown only if error available) */}
			{error && (
				<p className="text-sm text-[var(--muted)] mb-4 max-w-md text-center font-mono">
					{error.message}
				</p>
			)}

			{/* Actions */}
			<div className="flex gap-3">
				<button
					type="button"
					onClick={onReset}
					className={cn(
						'px-4 py-2 text-sm font-medium rounded-md',
						'bg-[var(--card)] text-[var(--foreground)]',
						'border border-[var(--border)]',
						'hover:bg-[var(--card-hover)]',
						'transition-all duration-[var(--duration-base,200ms)]',
						'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]'
					)}
				>
					Try Again
				</button>
				{showReload && (
					<button
						type="button"
						onClick={onReload}
						className={cn(
							'px-4 py-2 text-sm font-medium rounded-md',
							'bg-[var(--accent)] text-white',
							'hover:opacity-90',
							'transition-all duration-[var(--duration-base,200ms)]',
							'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]'
						)}
					>
						Reload Page
					</button>
				)}
			</div>
		</div>
	)
}
