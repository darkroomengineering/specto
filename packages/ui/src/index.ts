// Utilities
export { cn } from './utils/cn'

// Design Tokens
export * from './styles/tokens'

// Animation Variants
export {
	// Fade variants
	fadeIn,
	fadeInUp,
	fadeInDown,
	// Scale variants
	scaleIn,
	popIn,
	// Slide variants
	slideInRight,
	slideInLeft,
	slideInUp,
	slideInDown,
	// Transitions
	transitions,
	// Stagger helpers
	staggerContainer,
	staggerContainerSlow,
	staggerItem,
	// Hover animations
	hoverLift,
	hoverScale,
	hoverGlow,
	// Tap animations
	tapScale,
	tapPush,
	// Number animation
	numberSpring,
} from './animations'

// Components
export { Button, type ButtonProps } from './components/button'
export { Card, type CardProps, type CardHeaderProps, type CardContentProps, type CardFooterProps } from './components/card'
export { Stat, type StatProps } from './components/stat'
export { Badge, type BadgeProps } from './components/badge'
export { Table, type TableProps } from './components/table'
export { Select, type SelectProps, type SelectOption } from './components/select'

// Modal
export {
	Modal,
	type ModalProps,
	type ModalTriggerProps,
	type ModalContentProps,
	type ModalHeaderProps,
	type ModalTitleProps,
	type ModalDescriptionProps,
	type ModalFooterProps,
	type ModalCloseProps,
} from './components/modal'

// Alert Dialog
export {
	AlertDialog,
	type AlertDialogProps,
	type AlertDialogTriggerProps,
	type AlertDialogContentProps,
	type AlertDialogHeaderProps,
	type AlertDialogTitleProps,
	type AlertDialogDescriptionProps,
	type AlertDialogFooterProps,
	type AlertDialogCancelProps,
	type AlertDialogActionProps,
} from './components/alert-dialog'

// Dropdown Menu
export {
	Dropdown,
	DropdownTrigger,
	DropdownContent,
	DropdownItem,
	DropdownLabel,
	DropdownSeparator,
	DropdownCheckboxItem,
	DropdownSub,
	DropdownSubTrigger,
	DropdownSubContent,
	type DropdownTriggerProps,
	type DropdownContentProps,
	type DropdownItemProps,
	type DropdownLabelProps,
	type DropdownCheckboxItemProps,
} from './components/dropdown'

// Switch
export { Switch, type SwitchProps } from './components/switch'

// Toast
export { SpectoToaster, toast, sonnerToast, type ToasterProps } from './components/toast'

// Skeleton
export { Skeleton, type SkeletonProps } from './components/skeleton'

// Error Boundary
export { ErrorBoundary, type ErrorBoundaryProps } from './components/error-boundary'

// Pro Gate
export { ProGate, ProBadge, type ProGateProps, type ProBadgeProps } from './components/pro-gate'
