import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
	size?: 'sm' | 'md' | 'lg'
	children: ReactNode
}

const variantStyles = {
	primary: 'bg-[var(--accent)] text-white hover:opacity-90',
	secondary: 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--card-hover)]',
	ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--card)]',
	danger: 'bg-[var(--color-error)] text-white hover:opacity-90',
}

const sizeStyles = {
	sm: 'px-2 py-1 text-xs',
	md: 'px-4 py-2 text-base',
	lg: 'px-6 py-3 text-lg',
}

/**
 * Button component
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * ```
 */
export function Button({
	variant = 'primary',
	size = 'md',
	className,
	children,
	disabled,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(
				'inline-flex items-center justify-center font-medium rounded-md transition-all duration-[var(--duration-base)] cursor-pointer',
				'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				'hover:scale-[1.02] active:scale-[0.98]',
				variantStyles[variant],
				sizeStyles[size],
				className
			)}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	)
}
