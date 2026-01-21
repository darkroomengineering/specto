'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface ModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	children: ReactNode
}

/**
 * Modal component using Radix Dialog with motion animations
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onOpenChange={setIsOpen}>
 *   <Modal.Trigger asChild>
 *     <Button>Open Modal</Button>
 *   </Modal.Trigger>
 *   <Modal.Content>
 *     <Modal.Header>
 *       <Modal.Title>Modal Title</Modal.Title>
 *       <Modal.Description>Modal description</Modal.Description>
 *     </Modal.Header>
 *     <div>Modal content here</div>
 *     <Modal.Footer>
 *       <Button>Action</Button>
 *     </Modal.Footer>
 *   </Modal.Content>
 * </Modal>
 * ```
 */
export function Modal({ open, onOpenChange, children }: ModalProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			{children}
		</Dialog.Root>
	)
}

export interface ModalTriggerProps {
	children: ReactNode
	asChild?: boolean
}

function ModalTrigger({ children, asChild = false }: ModalTriggerProps) {
	return <Dialog.Trigger asChild={asChild}>{children}</Dialog.Trigger>
}

export interface ModalContentProps {
	children: ReactNode
	className?: string
}

function ModalContent({ children, className }: ModalContentProps) {
	return (
		<AnimatePresence>
			<Dialog.Portal>
				<Dialog.Overlay asChild>
					<motion.div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal,200)]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
					/>
				</Dialog.Overlay>
				<Dialog.Content asChild>
					<motion.div
						className={cn(
							'fixed left-1/2 top-1/2 z-[var(--z-modal,200)]',
							'w-full max-w-lg max-h-[85vh] overflow-auto',
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
				</Dialog.Content>
			</Dialog.Portal>
		</AnimatePresence>
	)
}

export interface ModalHeaderProps {
	children: ReactNode
	className?: string
}

function ModalHeader({ children, className }: ModalHeaderProps) {
	return (
		<div
			className={cn('px-6 py-4 border-b border-[var(--border)]', className)}
		>
			{children}
		</div>
	)
}

export interface ModalTitleProps {
	children: ReactNode
	className?: string
}

function ModalTitle({ children, className }: ModalTitleProps) {
	return (
		<Dialog.Title
			className={cn(
				'text-lg font-semibold text-[var(--foreground)]',
				className
			)}
		>
			{children}
		</Dialog.Title>
	)
}

export interface ModalDescriptionProps {
	children: ReactNode
	className?: string
}

function ModalDescription({ children, className }: ModalDescriptionProps) {
	return (
		<Dialog.Description
			className={cn('text-sm text-[var(--muted)] mt-1', className)}
		>
			{children}
		</Dialog.Description>
	)
}

export interface ModalFooterProps {
	children: ReactNode
	className?: string
}

function ModalFooter({ children, className }: ModalFooterProps) {
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

export interface ModalCloseProps {
	children: ReactNode
	asChild?: boolean
}

function ModalClose({ children, asChild = false }: ModalCloseProps) {
	return <Dialog.Close asChild={asChild}>{children}</Dialog.Close>
}

Modal.Trigger = ModalTrigger
Modal.Content = ModalContent
Modal.Header = ModalHeader
Modal.Title = ModalTitle
Modal.Description = ModalDescription
Modal.Footer = ModalFooter
Modal.Close = ModalClose
