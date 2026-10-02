'use client'

import { motion } from 'motion/react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
	children: ReactNode
	animated?: boolean
}

const variantStyles = {
	default: 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]',
	success:
		'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
	warning:
		'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
	error: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
	info: 'bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20',
}

/**
 * Badge component for status indicators with optional enter animation
 *
 * @example
 * ```tsx
 * <Badge variant="success" animated>Active</Badge>
 * ```
 */
export function Badge({
	variant = 'default',
	className,
	children,
	animated = false,
	...props
}: BadgeProps) {
	const baseClassName = cn(
		'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
		variantStyles[variant],
		className
	)

	if (animated) {
		return (
			<motion.span
				className={baseClassName}
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				transition={{ type: 'spring', damping: 15, stiffness: 300 }}
			>
				{children}
			</motion.span>
		)
	}

	return (
		<span className={baseClassName} {...props}>
			{children}
		</span>
	)
}
