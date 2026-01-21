import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	/** Skeleton shape variant */
	variant?: 'text' | 'circular' | 'rectangular'
	/** Width of the skeleton (CSS value) */
	width?: string | number
	/** Height of the skeleton (CSS value) */
	height?: string | number
}

/**
 * Skeleton loading placeholder component
 *
 * @example
 * ```tsx
 * // Text skeleton (single line)
 * <Skeleton variant="text" width="60%" />
 *
 * // Circular skeleton (avatar)
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Rectangular skeleton (card/image)
 * <Skeleton variant="rectangular" width="100%" height={200} />
 * ```
 */
export function Skeleton({
	variant = 'rectangular',
	width,
	height,
	className,
	style,
	...props
}: SkeletonProps) {
	const variantStyles = {
		text: 'rounded h-4',
		circular: 'rounded-full',
		rectangular: 'rounded-md',
	}

	const computedStyle = {
		...style,
		width: typeof width === 'number' ? `${width}px` : width,
		height: typeof height === 'number' ? `${height}px` : height,
	}

	return (
		<div
			className={cn(
				'animate-pulse',
				'bg-[var(--skeleton-base,var(--card))]',
				variantStyles[variant],
				className
			)}
			style={computedStyle}
			aria-hidden="true"
			{...props}
		/>
	)
}

/**
 * Skeleton.Text - Pre-configured text line skeleton
 */
function SkeletonText({
	width = '100%',
	className,
	...props
}: Omit<SkeletonProps, 'variant'>) {
	return (
		<Skeleton variant="text" width={width} className={className} {...props} />
	)
}

/**
 * Skeleton.Circle - Pre-configured circular skeleton (avatars)
 */
function SkeletonCircle({
	size = 40,
	className,
	...props
}: Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { size?: number }) {
	return (
		<Skeleton
			variant="circular"
			width={size}
			height={size}
			className={className}
			{...props}
		/>
	)
}

/**
 * Skeleton.Card - Pre-configured card skeleton
 */
function SkeletonCard({
	width = '100%',
	height = 120,
	className,
	...props
}: Omit<SkeletonProps, 'variant'>) {
	return (
		<Skeleton
			variant="rectangular"
			width={width}
			height={height}
			className={className}
			{...props}
		/>
	)
}

Skeleton.Text = SkeletonText
Skeleton.Circle = SkeletonCircle
Skeleton.Card = SkeletonCard
