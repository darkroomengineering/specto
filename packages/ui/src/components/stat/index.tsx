'use client'

import { motion, useSpring, useTransform } from 'motion/react'
import type { HTMLAttributes, ReactNode } from 'react'
import { useEffect } from 'react'
import { cn } from '../../utils/cn'

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
	label: string
	value: string | number | ReactNode
	description?: string
	trend?: {
		value: number
		isPositive?: boolean
	}
	icon?: ReactNode
	animated?: boolean
	animateValue?: boolean
}

/**
 * Animated number component for smooth value transitions
 */
function AnimatedNumber({ value }: { value: number }) {
	const spring = useSpring(0, { damping: 30, stiffness: 200 })
	const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

	useEffect(() => {
		spring.set(value)
	}, [spring, value])

	return <motion.span>{display}</motion.span>
}

/**
 * Stat display component for metrics with optional animations
 *
 * @example
 * ```tsx
 * <Stat
 *   label="Total Commits"
 *   value={1234}
 *   trend={{ value: 12, isPositive: true }}
 *   description="This month"
 *   animated
 *   animateValue
 * />
 * ```
 */
export function Stat({
	label,
	value,
	description,
	trend,
	icon,
	className,
	animated = false,
	animateValue = false,
	...props
}: StatProps) {
	const baseClassName = cn(
		'flex flex-col gap-1 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]',
		'transition-colors duration-[var(--duration-base)]',
		'hover:bg-[var(--card-hover)]',
		className
	)

	const renderValue = () => {
		if (typeof value === 'number') {
			if (animateValue) {
				return <AnimatedNumber value={value} />
			}
			return value.toLocaleString()
		}
		return value
	}

	const content = (
		<>
			<div className="flex items-center justify-between">
				<span className="text-sm text-[var(--muted)]">{label}</span>
				{icon && <span className="text-[var(--muted)]">{icon}</span>}
			</div>
			<div className="flex items-baseline gap-2">
				<span className="text-2xl font-semibold text-[var(--foreground)]">{renderValue()}</span>
				{trend && (
					<span
						className={cn(
							'text-sm font-medium',
							trend.isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
						)}
					>
						{trend.isPositive ? '+' : ''}
						{trend.value}%
					</span>
				)}
			</div>
			{description && <span className="text-xs text-[var(--muted)]">{description}</span>}
		</>
	)

	if (animated) {
		return (
			<motion.div
				className={baseClassName}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 10 }}
				transition={{ duration: 0.2 }}
				whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
			>
				{content}
			</motion.div>
		)
	}

	return (
		<div className={baseClassName} {...props}>
			{content}
		</div>
	)
}
