import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
	hover?: boolean
}

/**
 * Card container component with optional hover lift effect
 *
 * @example
 * ```tsx
 * <Card hover>
 *   <Card.Header>Title</Card.Header>
 *   <Card.Content>Content here</Card.Content>
 * </Card>
 * ```
 */
export function Card({ className, children, hover = false, ...props }: CardProps) {
	return (
		<div
			className={cn(
				'rounded-lg border border-[var(--border)] bg-[var(--card)]',
				'transition-all duration-[var(--duration-base)]',
				hover && 'hover:bg-[var(--card-hover)] hover:border-[var(--muted)] hover:-translate-y-0.5',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

function CardHeader({ className, children, ...props }: CardHeaderProps) {
	return (
		<div className={cn('px-4 py-3 border-b border-[var(--border)]', className)} {...props}>
			{children}
		</div>
	)
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

function CardContent({ className, children, ...props }: CardContentProps) {
	return (
		<div className={cn('p-4', className)} {...props}>
			{children}
		</div>
	)
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode
}

function CardFooter({ className, children, ...props }: CardFooterProps) {
	return (
		<div className={cn('px-4 py-3 border-t border-[var(--border)]', className)} {...props}>
			{children}
		</div>
	)
}

Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter
