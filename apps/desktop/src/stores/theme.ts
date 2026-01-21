import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'

interface ThemeState {
	theme: Theme
	setTheme: (theme: Theme) => void
}

/**
 * Applies the theme to the document
 */
function applyTheme(theme: Theme) {
	const root = document.documentElement

	if (theme === 'system') {
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light'
		root.setAttribute('data-theme', systemTheme)
	} else {
		root.setAttribute('data-theme', theme)
	}
}

/**
 * Theme store with persistence
 */
export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			theme: 'dark',
			setTheme: (theme: Theme) => {
				applyTheme(theme)
				set({ theme })
			},
		}),
		{
			name: 'specto-theme',
			onRehydrateStorage: () => (state) => {
				// Apply theme on rehydration
				if (state?.theme) {
					applyTheme(state.theme)
				}
			},
		}
	)
)

/**
 * Initialize theme from stored preference
 * Call this on app startup
 */
export function initializeTheme() {
	const state = useThemeStore.getState()
	applyTheme(state.theme)

	// Listen for system theme changes if using system preference
	if (state.theme === 'system') {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		mediaQuery.addEventListener('change', (e) => {
			if (useThemeStore.getState().theme === 'system') {
				document.documentElement.setAttribute(
					'data-theme',
					e.matches ? 'dark' : 'light'
				)
			}
		})
	}
}
