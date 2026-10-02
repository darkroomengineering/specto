import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Button } from '../button'

export interface ProGateProps extends HTMLAttributes<HTMLDivElement> {
	/** Whether the user has Pro access */
	isPro: boolean
	/** Feature name for display in upgrade message */
	feature: string
	/** Callback when upgrade button is clicked */
	onUpgrade: () => void
	/** Content to gate */
	children: ReactNode
	/**
	 * Gating mode:
	 * - 'overlay': Shows content with a blur overlay and upgrade prompt
	 * - 'disable': Renders children with reduced opacity, non-interactive
	 * - 'hide': Completely hides children when not Pro
	 */
	mode?: 'overlay' | 'disable' | 'hide'
}

/**
 * ProGate - Consistent Pro feature gating component
 *
 * @example
 * ```tsx
 * // Overlay mode (default) - shows blur with upgrade prompt
 * <ProGate isPro={isPro} feature="data export" onUpgrade={handleUpgrade}>
 *   <ExportButton />
 * </ProGate>
 *
 * // Disable mode - grayed out but visible
 * <ProGate isPro={isPro} feature="90-day history" onUpgrade={handleUpgrade} mode="disable">
 *   <TimeframeSelector />
 * </ProGate>
 *
 * // Hide mode - completely hidden when not Pro
 * <ProGate isPro={isPro} feature="API access" onUpgrade={handleUpgrade} mode="hide">
 *   <ApiKeySection />
 * </ProGate>
 * ```
 */
export function ProGate({
	isPro,
	feature,
	onUpgrade,
	children,
	mode = 'overlay',
	className,
	...props
}: ProGateProps) {
	// If Pro, render children directly
	if (isPro) {
		return <>{children}</>
	}

	// Hide mode - return null when not Pro
	if (mode === 'hide') {
		return null
	}

	// Disable mode - render with reduced opacity and no interaction
	if (mode === 'disable') {
		return (
			<div className={cn('relative', className)} {...props}>
				<div className="opacity-50 pointer-events-none select-none" inert>
					{children}
				</div>
				<button
					type="button"
					aria-label="Upgrade to Pro to use this feature"
					className="absolute inset-0 cursor-not-allowed"
					onClick={onUpgrade}
				/>
			</div>
		)
	}

	// Overlay mode - show with blur and upgrade prompt
	return (
		<div className={cn('relative', className)} {...props}>
			<div className="blur-sm opacity-60 pointer-events-none select-none">{children}</div>
			<div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/60 backdrop-blur-[2px] rounded-lg">
				<div className="text-center p-4">
					<div className="flex items-center justify-center gap-1.5 mb-2">
						<LockIcon className="w-4 h-4 text-[var(--accent)]" />
						<span className="text-sm font-medium">Pro Feature</span>
					</div>
					<p className="text-xs text-[var(--muted)] mb-3">Unlock {feature} with Pro</p>
					<Button size="sm" onClick={onUpgrade}>
						Upgrade to Pro
					</Button>
				</div>
			</div>
		</div>
	)
}

/**
 * ProBadge - Small inline indicator for Pro-only items
 * Use this for options in selects, menu items, etc.
 */
export interface ProBadgeProps extends HTMLAttributes<HTMLSpanElement> {
	/** Show the badge (typically when !isPro) */
	show: boolean
}

export function ProBadge({ show, className, ...props }: ProBadgeProps) {
	if (!show) return null

	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
				'bg-[var(--accent)]/10 text-[var(--accent)]',
				className
			)}
			{...props}
		>
			<LockIcon className="w-2.5 h-2.5" />
			PRO
		</span>
	)
}

function LockIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
			/>
		</svg>
	)
}
