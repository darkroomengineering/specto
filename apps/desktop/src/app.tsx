import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import { AuthGuard } from './components/auth-guard'
import { Dashboard } from './pages/dashboard'
import { Organization } from './pages/organization'
import { Leaderboard } from './pages/leaderboard'
import { Settings } from './pages/settings'

export function App() {
	return (
		<BrowserRouter>
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
