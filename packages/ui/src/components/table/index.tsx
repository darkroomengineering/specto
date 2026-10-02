'use client'

import { AnimatePresence, motion } from 'motion/react'
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
	children: ReactNode
}

/**
 * Table component for data display with optional row animations
 *
 * @example
 * ```tsx
 * <Table>
 *   <Table.Header>
 *     <Table.Row>
 *       <Table.Head>Name</Table.Head>
 *       <Table.Head>Count</Table.Head>
 *     </Table.Row>
 *   </Table.Header>
 *   <Table.Body animated>
 *     <Table.Row animated>
 *       <Table.Cell>Item</Table.Cell>
 *       <Table.Cell>123</Table.Cell>
 *     </Table.Row>
 *   </Table.Body>
 * </Table>
 * ```
 */
export function Table({ className, children, ...props }: TableProps) {
	return (
		<div className="w-full overflow-auto">
			<table className={cn('w-full text-sm', className)} {...props}>
				{children}
			</table>
		</div>
	)
}

function TableHeader({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return (
		<thead className={cn('border-b border-[var(--border)]', className)} {...props}>
			{children}
		</thead>
	)
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
	animated?: boolean
}

function TableBody({ className, children, animated = false, ...props }: TableBodyProps) {
	if (animated) {
		return (
			<tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
				<AnimatePresence mode="popLayout">{children}</AnimatePresence>
			</tbody>
		)
	}

	return (
		<tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
			{children}
		</tbody>
	)
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	children: ReactNode
	animated?: boolean
	isLoading?: boolean
}

function TableRow({
	className,
	children,
	animated = false,
	isLoading = false,
	...props
}: TableRowProps) {
	const baseClassName = cn(
		'border-b border-[var(--border)]',
		'transition-all duration-[var(--duration-fast)]',
		'hover:bg-[var(--card-hover)]',
		isLoading && 'opacity-50',
		className
	)

	if (animated) {
		return (
			<motion.tr
				className={baseClassName}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.15 }}
				layout
			>
				{children}
			</motion.tr>
		)
	}

	return (
		<tr className={baseClassName} {...props}>
			{children}
		</tr>
	)
}

function TableHead({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
	return (
		<th
			className={cn('h-10 px-4 text-left align-middle font-medium text-[var(--muted)]', className)}
			{...props}
		>
			{children}
		</th>
	)
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
	isLoading?: boolean
}

function TableCell({ className, children, isLoading = false, ...props }: TableCellProps) {
	return (
		<td
			className={cn(
				'px-4 py-3 align-middle text-[var(--foreground)]',
				'transition-opacity duration-[var(--duration-fast)]',
				isLoading && 'opacity-50',
				className
			)}
			{...props}
		>
			{children}
		</td>
	)
}

Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell
