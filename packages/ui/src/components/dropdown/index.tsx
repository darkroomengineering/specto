'use client'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { AnimatePresence, motion } from 'motion/react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

// =============================================================================
// Root & Trigger
// =============================================================================

const DropdownRoot = DropdownMenuPrimitive.Root

export interface DropdownTriggerProps
	extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger> {
	children: ReactNode
}

const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
	({ className, children, ...props }, ref) => (
		<DropdownMenuPrimitive.Trigger
			ref={ref}
			className={cn(
				'outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
				className
			)}
			{...props}
		>
			{children}
		</DropdownMenuPrimitive.Trigger>
	)
)
DropdownTrigger.displayName = 'DropdownTrigger'

// =============================================================================
// Content
// =============================================================================

export interface DropdownContentProps
	extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
	children: ReactNode
}

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
	({ className, children, sideOffset = 4, ...props }, ref) => (
		<AnimatePresence>
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content
					ref={ref}
					sideOffset={sideOffset}
					className={cn(
						'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg',
						className
					)}
					asChild
					{...props}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -4 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -4 }}
						transition={{ duration: 0.15, ease: 'easeOut' }}
					>
						{children}
					</motion.div>
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		</AnimatePresence>
	)
)
DropdownContent.displayName = 'DropdownContent'

// =============================================================================
// Item
// =============================================================================

export interface DropdownItemProps
	extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
	children: ReactNode
	destructive?: boolean
}

const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
	({ className, children, destructive = false, ...props }, ref) => (
		<DropdownMenuPrimitive.Item
			ref={ref}
			className={cn(
				'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none',
				'transition-colors duration-[var(--duration-fast)]',
				'focus:bg-[var(--card-hover)] focus:text-[var(--foreground)]',
				'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				destructive &&
					'text-[var(--color-error)] focus:bg-[var(--color-error)]/10 focus:text-[var(--color-error)]',
				!destructive && 'text-[var(--foreground)]',
				className
			)}
			{...props}
		>
			{children}
		</DropdownMenuPrimitive.Item>
	)
)
DropdownItem.displayName = 'DropdownItem'

// =============================================================================
// Label
// =============================================================================

export interface DropdownLabelProps
	extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> {
	children: ReactNode
}

const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(
	({ className, children, ...props }, ref) => (
		<DropdownMenuPrimitive.Label
			ref={ref}
			className={cn('px-2 py-1.5 text-xs font-semibold text-[var(--muted)]', className)}
			{...props}
		>
			{children}
		</DropdownMenuPrimitive.Label>
	)
)
DropdownLabel.displayName = 'DropdownLabel'

// =============================================================================
// Separator
// =============================================================================

const DropdownSeparator = forwardRef<
	HTMLDivElement,
	ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cn('-mx-1 my-1 h-px bg-[var(--border)]', className)}
		{...props}
	/>
))
DropdownSeparator.displayName = 'DropdownSeparator'

// =============================================================================
// Checkbox Item
// =============================================================================

export interface DropdownCheckboxItemProps
	extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> {
	children: ReactNode
}

const DropdownCheckboxItem = forwardRef<HTMLDivElement, DropdownCheckboxItemProps>(
	({ className, children, ...props }, ref) => (
		<DropdownMenuPrimitive.CheckboxItem
			ref={ref}
			className={cn(
				'relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none',
				'transition-colors duration-[var(--duration-fast)]',
				'focus:bg-[var(--card-hover)] focus:text-[var(--foreground)]',
				'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				className
			)}
			{...props}
		>
			<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M10 3L4.5 8.5L2 6"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	)
)
DropdownCheckboxItem.displayName = 'DropdownCheckboxItem'

// =============================================================================
// Sub Menu
// =============================================================================

const DropdownSub = DropdownMenuPrimitive.Sub

const DropdownSubTrigger = forwardRef<
	HTMLDivElement,
	ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
	<DropdownMenuPrimitive.SubTrigger
		ref={ref}
		className={cn(
			'flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none',
			'transition-colors duration-[var(--duration-fast)]',
			'focus:bg-[var(--card-hover)]',
			'data-[state=open]:bg-[var(--card-hover)]',
			className
		)}
		{...props}
	>
		{children}
		<svg
			className="ml-auto h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth={2}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
		</svg>
	</DropdownMenuPrimitive.SubTrigger>
))
DropdownSubTrigger.displayName = 'DropdownSubTrigger'

const DropdownSubContent = forwardRef<
	HTMLDivElement,
	ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.SubContent
		ref={ref}
		className={cn(
			'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
			'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
			'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
			className
		)}
		{...props}
	/>
))
DropdownSubContent.displayName = 'DropdownSubContent'

// =============================================================================
// Compound Component
// =============================================================================

export const Dropdown = Object.assign(DropdownRoot, {
	Trigger: DropdownTrigger,
	Content: DropdownContent,
	Item: DropdownItem,
	Label: DropdownLabel,
	Separator: DropdownSeparator,
	CheckboxItem: DropdownCheckboxItem,
	Sub: DropdownSub,
	SubTrigger: DropdownSubTrigger,
	SubContent: DropdownSubContent,
})

// Named exports for individual components
export {
	DropdownCheckboxItem,
	DropdownContent,
	DropdownItem,
	DropdownLabel,
	DropdownSeparator,
	DropdownSub,
	DropdownSubContent,
	DropdownSubTrigger,
	DropdownTrigger,
}
