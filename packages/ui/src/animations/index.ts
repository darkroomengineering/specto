import type { Transition, Variants } from 'motion/react'

// =============================================================================
// Fade Variants
// =============================================================================

export const fadeIn: Variants = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 10 },
}

export const fadeInDown: Variants = {
	initial: { opacity: 0, y: -10 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 },
}

// =============================================================================
// Scale Variants
// =============================================================================

export const scaleIn: Variants = {
	initial: { opacity: 0, scale: 0.95 },
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.95 },
}

export const popIn: Variants = {
	initial: { opacity: 0, scale: 0.9 },
	animate: {
		opacity: 1,
		scale: 1,
		transition: { type: 'spring', damping: 15 },
	},
	exit: { opacity: 0, scale: 0.9 },
}

// =============================================================================
// Slide Variants
// =============================================================================

export const slideInRight: Variants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: 20 },
}

export const slideInLeft: Variants = {
	initial: { opacity: 0, x: -20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
}

export const slideInUp: Variants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 20 },
}

export const slideInDown: Variants = {
	initial: { opacity: 0, y: -20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
}

// =============================================================================
// Transition Presets
// =============================================================================

export const transitions = {
	fast: { duration: 0.15 } satisfies Transition,
	base: { duration: 0.2 } satisfies Transition,
	slow: { duration: 0.3 } satisfies Transition,
	spring: { type: 'spring', damping: 20, stiffness: 300 } satisfies Transition,
	springBouncy: { type: 'spring', damping: 10, stiffness: 400 } satisfies Transition,
	springGentle: { type: 'spring', damping: 25, stiffness: 200 } satisfies Transition,
} as const

// =============================================================================
// Stagger Helpers
// =============================================================================

export const staggerContainer: Variants = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.05,
		},
	},
	exit: {},
}

export const staggerContainerSlow: Variants = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.1,
		},
	},
	exit: {},
}

export const staggerItem = fadeInUp

// =============================================================================
// Hover Animations (for whileHover)
// =============================================================================

export const hoverLift = {
	y: -2,
	transition: { duration: 0.15 },
}

export const hoverScale = {
	scale: 1.02,
	transition: { duration: 0.15 },
}

export const hoverGlow = {
	boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
	transition: { duration: 0.2 },
}

// =============================================================================
// Tap Animations (for whileTap)
// =============================================================================

export const tapScale = {
	scale: 0.98,
}

export const tapPush = {
	scale: 0.95,
	y: 1,
}

// =============================================================================
// Number Animation Helpers
// =============================================================================

export const numberSpring = {
	type: 'spring',
	damping: 30,
	stiffness: 200,
} satisfies Transition
