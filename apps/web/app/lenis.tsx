'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

export function LenisProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
			orientation: 'vertical',
			smoothWheel: true,
		})

		function raf(time: number) {
			lenis.raf(time)
			requestAnimationFrame(raf)
		}

		requestAnimationFrame(raf)

		// Handle anchor link clicks for smooth scrolling
		function handleAnchorClick(e: MouseEvent) {
			const target = e.target as HTMLElement
			const anchor = target.closest('a')
			if (!anchor) return

			const href = anchor.getAttribute('href')
			if (!href?.startsWith('#')) return

			const element = document.querySelector(href)
			if (!element) return

			e.preventDefault()
			lenis.scrollTo(element as HTMLElement, { offset: -80 })
		}

		document.addEventListener('click', handleAnchorClick)

		return () => {
			document.removeEventListener('click', handleAnchorClick)
			lenis.destroy()
		}
	}, [])

	return <>{children}</>
}
