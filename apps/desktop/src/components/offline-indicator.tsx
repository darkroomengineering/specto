import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@specto/ui'

interface OfflineIndicatorProps {
	isOnline: boolean
	wasOffline: boolean
}

/**
 * Displays a banner when the user is offline or has just reconnected
 */
export function OfflineIndicator({ isOnline, wasOffline }: OfflineIndicatorProps) {
	const showBanner = !isOnline || wasOffline

	return (
		<AnimatePresence>
			{showBanner && (
				<motion.div
					initial={{ y: -100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: -100, opacity: 0 }}
					transition={{ type: 'spring', damping: 25, stiffness: 300 }}
					className={cn(
						'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium',
						!isOnline
							? 'bg-[var(--color-warning)] text-[var(--color-warning-foreground,#000)]'
							: 'bg-emerald-500 text-white'
					)}
					role="alert"
					aria-live="polite"
				>
					{!isOnline ? (
						<>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
								/>
							</svg>
							<span>You're offline - some features may be unavailable</span>
						</>
					) : (
						<>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span>Back online</span>
						</>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	)
}
