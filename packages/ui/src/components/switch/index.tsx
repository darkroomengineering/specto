'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import { motion } from 'motion/react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// =============================================================================
// Size Variants
// =============================================================================

const sizeClasses = {
	sm: {
		root: 'h-4 w-7',
		thumb: 'h-3 w-3',
		translate: 'data-[state=checked]:translate-x-3',
	},
	md: {
		root: 'h-5 w-9',
		thumb: 'h-4 w-4',
		translate: 'data-[state=checked]:translate-x-4',
	},
	lg: {
		root: 'h-6 w-11',
		thumb: 'h-5 w-5',
		translate: 'data-[state=checked]:translate-x-5',
	},
}

// =============================================================================
// Switch Component
// =============================================================================

export interface SwitchProps
	extends Omit<ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'children'> {
	size?: 'sm' | 'md' | 'lg'
	label?: ReactNode
	labelPosition?: 'left' | 'right'
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
	({ className, size = 'md', label, labelPosition = 'right', disabled, ...props }, ref) => {
		const sizes = sizeClasses[size]

		const switchElement = (
			<SwitchPrimitive.Root
				ref={ref}
				disabled={disabled}
				className={cn(
					'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
					'transition-colors duration-[var(--duration-fast)]',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
					'disabled:cursor-not-allowed disabled:opacity-50',
					'data-[state=unchecked]:bg-[var(--muted)]/30',
					'data-[state=checked]:bg-[var(--color-primary)]',
					sizes.root,
					className
				)}
				{...props}
			>
				<SwitchPrimitive.Thumb asChild>
					<motion.span
						className={cn('pointer-events-none block rounded-full bg-white shadow-sm', sizes.thumb)}
						layout
						transition={{
							type: 'spring',
							stiffness: 500,
							damping: 30,
						}}
					/>
				</SwitchPrimitive.Thumb>
			</SwitchPrimitive.Root>
		)

		if (!label) {
			return switchElement
		}

		return (
			<label
				className={cn(
					'inline-flex items-center gap-2 cursor-pointer',
					disabled && 'cursor-not-allowed opacity-50'
				)}
			>
				{labelPosition === 'left' && (
					<span className="text-sm text-[var(--foreground)]">{label}</span>
				)}
				{switchElement}
				{labelPosition === 'right' && (
					<span className="text-sm text-[var(--foreground)]">{label}</span>
				)}
			</label>
		)
	}
)
Switch.displayName = 'Switch'
