import { useState, useEffect } from 'react'

interface NetworkStatus {
	isOnline: boolean
	wasOffline: boolean
}

/**
 * Hook to track network connectivity status
 * Returns isOnline (current status) and wasOffline (for showing reconnection notifications)
 */
export function useNetworkStatus(): NetworkStatus {
	const [isOnline, setIsOnline] = useState(() =>
		typeof navigator !== 'undefined' ? navigator.onLine : true
	)
	const [wasOffline, setWasOffline] = useState(false)

	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true)
			// Track that we came back online (for showing "reconnected" notifications)
			setWasOffline(true)
			// Reset wasOffline after a brief delay
			setTimeout(() => setWasOffline(false), 3000)
		}

		const handleOffline = () => {
			setIsOnline(false)
		}

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [])

	return { isOnline, wasOffline }
}
