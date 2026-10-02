import { Button, Card } from '@specto/ui'
import { relaunch } from '@tauri-apps/plugin-process'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { useEffect, useState } from 'react'

export function Updater() {
	const [update, setUpdate] = useState<Update | null>(null)
	const [downloading, setDownloading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function checkForUpdate() {
			try {
				const available = await check()
				if (available) {
					setUpdate(available)
				}
			} catch (err) {
				// Silently fail - update server might not be configured yet
				console.log('Update check failed:', err)
			}
		}
		checkForUpdate()
	}, [])

	async function installUpdate() {
		if (!update) return

		setDownloading(true)
		setError(null)

		try {
			let downloaded = 0
			let total = 0
			await update.downloadAndInstall((event) => {
				switch (event.event) {
					case 'Started':
						total = (event.data as { contentLength?: number }).contentLength ?? 0
						setProgress(0)
						break
					case 'Progress':
						downloaded += (event.data as { chunkLength: number }).chunkLength
						if (total > 0) {
							setProgress(Math.round((downloaded / total) * 100))
						}
						break
					case 'Finished':
						setProgress(100)
						break
				}
			})

			// Relaunch the app to apply update
			await relaunch()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to install update')
			setDownloading(false)
		}
	}

	function dismiss() {
		setUpdate(null)
	}

	if (!update) return null

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-sm">
			<Card className="border-[var(--accent)]">
				<Card.Content className="py-4">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h3 className="font-semibold">Update Available</h3>
							<p className="text-sm text-[var(--muted)]">
								Version {update.version} is ready to install
							</p>
						</div>
						<button
							type="button"
							onClick={dismiss}
							className="text-[var(--muted)] hover:text-[var(--foreground)] p-1"
							aria-label="Dismiss"
						>
							<svg
								aria-hidden="true"
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{error && <p className="text-sm text-[var(--color-error)] mt-2">{error}</p>}

					{downloading ? (
						<div className="mt-3">
							<div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
								<span>Downloading...</span>
								<span>{progress}%</span>
							</div>
							<div className="h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
								<div
									className="h-full bg-[var(--accent)] transition-all duration-300"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					) : (
						<div className="flex gap-2 mt-3">
							<Button size="sm" onClick={installUpdate} className="flex-1">
								Install & Restart
							</Button>
							<Button size="sm" variant="secondary" onClick={dismiss}>
								Later
							</Button>
						</div>
					)}
				</Card.Content>
			</Card>
		</div>
	)
}
