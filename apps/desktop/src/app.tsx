import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from './components/layout'
import { AuthGuard } from './components/auth-guard'
import { Updater } from './components/updater'
import { Dashboard } from './pages/dashboard'
import { Organization } from './pages/organization'
import { Leaderboard } from './pages/leaderboard'
import { Settings } from './pages/settings'

export function App() {
	return (
		<BrowserRouter>
			<Toaster
				position="bottom-right"
				theme="dark"
				toastOptions={{
					style: {
						background: 'var(--card)',
						border: '1px solid var(--border)',
						color: 'var(--foreground)',
					},
					classNames: {
						error: '!bg-[var(--color-error)] !text-white !border-[var(--color-error)]',
						success: '!bg-[var(--color-success)] !text-white !border-[var(--color-success)]',
					},
				}}
			/>
			<Updater />
			<AuthGuard>
				<Routes>
					<Route element={<Layout />}>
						<Route path="/" element={<Navigate to="/dashboard" replace />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/leaderboard" element={<Leaderboard />} />
						<Route path="/org/:orgName" element={<Organization />} />
						<Route path="/settings" element={<Settings />} />
					</Route>
				</Routes>
			</AuthGuard>
		</BrowserRouter>
	)
}
