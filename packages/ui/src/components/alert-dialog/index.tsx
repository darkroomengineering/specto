'use client'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface AlertDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	children: ReactNode
}

/**
 * AlertDialog component for destructive/irreversible actions
 *
 * @example
 * ```tsx
 * <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
 *   <AlertDialog.Trigger asChild>
 *     <Button variant="danger">Delete</Button>
 *   </AlertDialog.Trigger>
 *   <AlertDialog.Content>
 *     <AlertDialog.Header>
 *       <AlertDialog.Title>Are you sure?</AlertDialog.Title>
 *       <AlertDialog.Description>
 *         This action cannot be undone.
 *       </AlertDialog.Description>
 *     </AlertDialog.Header>
 *     <AlertDialog.Footer>
 *       <AlertDialog.Cancel asChild>
 *         <Button variant="secondary">Cancel</Button>
 *       </AlertDialog.Cancel>
 *       <AlertDialog.Action asChild>
 *         <Button variant="danger">Delete</Button>
 *       </AlertDialog.Action>
 *     </AlertDialog.Footer>
 *   </AlertDialog.Content>
 * </AlertDialog>
 * ```
 */
export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
	return (
		<AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			{children}
		</AlertDialogPrimitive.Root>
	)
}

export interface AlertDialogTriggerProps {
	children: ReactNode
	asChild?: boolean
}

function AlertDialogTrigger({
	children,
	asChild = false,
}: AlertDialogTriggerProps) {
	return (
		<AlertDialogPrimitive.Trigger asChild={asChild}>
			{children}
		</AlertDialogPrimitive.Trigger>
	)
}

export interface AlertDialogContentProps {
	children: ReactNode
	className?: string
}

function AlertDialogContent({ children, className }: AlertDialogContentProps) {
	return (
		<AnimatePresence>
			<AlertDialogPrimitive.Portal>
				<AlertDialogPrimitive.Overlay asChild>
					<motion.div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal,200)]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
					/>
				</AlertDialogPrimitive.Overlay>
				<AlertDialogPrimitive.Content asChild>
					<motion.div
						className={cn(
							'fixed left-1/2 top-1/2 z-[var(--z-modal,200)]',
							'w-full max-w-md',
							'rounded-lg border border-[var(--border)] bg-[var(--card)]',
							'shadow-xl',
							'focus:outline-none',
							className
						)}
						initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-48%' }}
						animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
						exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-48%' }}
						transition={{
							duration: 0.2,
							ease: [0.175, 0.885, 0.32, 1.275],
						}}
					>
						{children}
					</motion.div>
				</AlertDialogPrimitive.Content>
			</AlertDialogPrimitive.Portal>
		</AnimatePresence>
	)
}

export interface AlertDialogHeaderProps {
	children: ReactNode
	className?: string
}

function AlertDialogHeader({ children, className }: AlertDialogHeaderProps) {
	return (
		<div className={cn('px-6 py-4', className)}>
			{children}
		</div>
	)
}

export interface AlertDialogTitleProps {
	children: ReactNode
	className?: string
}

function AlertDialogTitle({ children, className }: AlertDialogTitleProps) {
	return (
		<AlertDialogPrimitive.Title
			className={cn(
				'text-lg font-semibold text-[var(--foreground)]',
				className
			)}
		>
			{children}
		</AlertDialogPrimitive.Title>
	)
}

export interface AlertDialogDescriptionProps {
	children: ReactNode
	className?: string
}

function AlertDialogDescription({
	children,
	className,
}: AlertDialogDescriptionProps) {
	return (
		<AlertDialogPrimitive.Description
			className={cn('text-sm text-[var(--muted)] mt-2', className)}
		>
			{children}
		</AlertDialogPrimitive.Description>
	)
}

export interface AlertDialogFooterProps {
	children: ReactNode
	className?: string
}

function AlertDialogFooter({ children, className }: AlertDialogFooterProps) {
	return (
		<div
			className={cn(
				'px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3',
				className
			)}
		>
			{children}
		</div>
	)
}

export interface AlertDialogCancelProps {
	children: ReactNode
	asChild?: boolean
}

function AlertDialogCancel({ children, asChild = false }: AlertDialogCancelProps) {
	return (
		<AlertDialogPrimitive.Cancel asChild={asChild}>
			{children}
		</AlertDialogPrimitive.Cancel>
	)
}

export interface AlertDialogActionProps {
	children: ReactNode
	asChild?: boolean
}

function AlertDialogAction({ children, asChild = false }: AlertDialogActionProps) {
	return (
		<AlertDialogPrimitive.Action asChild={asChild}>
			{children}
		</AlertDialogPrimitive.Action>
	)
}

AlertDialog.Trigger = AlertDialogTrigger
AlertDialog.Content = AlertDialogContent
AlertDialog.Header = AlertDialogHeader
AlertDialog.Title = AlertDialogTitle
AlertDialog.Description = AlertDialogDescription
AlertDialog.Footer = AlertDialogFooter
AlertDialog.Cancel = AlertDialogCancel
AlertDialog.Action = AlertDialogAction
