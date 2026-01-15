import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout'
import './globals.css'

export const metadata: Metadata = {
	title: 'Specto - GitHub Organization Metrics',
	description: 'Track commits, members, teams, and more across your GitHub organizations.',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" data-theme="dark">
			<body>
				<Wrapper>{children}</Wrapper>
			</body>
		</html>
	)
}
