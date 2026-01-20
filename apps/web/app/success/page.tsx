import { Button } from '@specto/ui'
import Link from 'next/link'

export default function SuccessPage() {
	return (
		<div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
			<div className="max-w-md text-center">
				{/* Success icon */}
				<div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
					<svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</div>

				<h1 className="text-3xl font-bold mb-4">Thank you!</h1>
				<p className="text-[var(--muted)] mb-8">
					Your purchase was successful. Check your email for download links and license key.
				</p>

				<div className="space-y-4">
					<div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
						<h3 className="font-medium mb-2">What's next?</h3>
						<ul className="text-sm text-[var(--muted)] space-y-2 text-left">
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-0.5">✓</span>
								Download link sent to your email
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-0.5">✓</span>
								License key included in email
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-0.5">✓</span>
								Access to all Pro features
							</li>
						</ul>
					</div>

					<div className="flex flex-col gap-3">
						<Link href="/downloads">
							<Button className="w-full">Download Specto</Button>
						</Link>
						<Link href="/">
							<Button variant="secondary" className="w-full">Back to Home</Button>
						</Link>
					</div>
				</div>

				<p className="text-xs text-[var(--muted)] mt-8">
					Questions? Contact us at{' '}
					<a href="mailto:hello@darkroom.engineering" className="text-[var(--accent)]">
						hello@darkroom.engineering
					</a>
				</p>
			</div>
		</div>
	)
}
