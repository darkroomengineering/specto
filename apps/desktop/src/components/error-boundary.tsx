/**
 * Desktop app error boundary wrapper
 * Re-exports ErrorBoundary from @specto/ui with desktop-specific defaults
 */
import { ErrorBoundary as UIErrorBoundary, type ErrorBoundaryProps } from '@specto/ui'
import type { ReactNode, ErrorInfo } from 'react'

interface DesktopErrorBoundaryProps {
	children: ReactNode
	/** Custom fallback UI */
	fallback?: ReactNode
	/** Show reload button (default: true) */
	showReload?: boolean
}

/**
 * Desktop-specific error boundary with logging
 */
export function ErrorBoundary({
	children,
	fallback,
	showReload = true,
}: DesktopErrorBoundaryProps) {
	const handleError = (error: Error, errorInfo: ErrorInfo) => {
		// Log to console in development
		console.error('Desktop app error caught by ErrorBoundary:', error)
		console.error('Component stack:', errorInfo.componentStack)

		// TODO: In the future, we could send errors to a logging service
	}

	return (
		<UIErrorBoundary
			onError={handleError}
			fallback={fallback}
			errorMessage="Something went wrong in Specto"
			showReload={showReload}
		>
			{children}
		</UIErrorBoundary>
	)
}
