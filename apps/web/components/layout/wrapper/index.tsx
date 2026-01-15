'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'
import { Header } from '../header'
import { Footer } from '../footer'

interface WrapperProps {
	children: React.ReactNode
	showHeader?: boolean
	showFooter?: boolean
}

export function Wrapper({ children, showHeader = true, showFooter = true }: WrapperProps) {
	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
			if (!href?.startsWith('#') && !href?.includes('/#')) return

			const hash = href.includes('/#') ? href.split('/#')[1] : href.slice(1)
			if (!hash) return
			const element = document.getElementById(hash)
			if (!element) return

			e.preventDefault()
			lenis.scrollTo(element, { offset: -80 })
		}

		document.addEventListener('click', handleAnchorClick)

		return () => {
			document.removeEventListener('click', handleAnchorClick)
			lenis.destroy()
		}
	}, [])

	return (
		<>
			{showHeader && <Header />}
			<main>{children}</main>
			{showFooter && <Footer />}
		</>
	)
}
