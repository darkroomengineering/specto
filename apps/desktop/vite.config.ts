import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const isDebug = process.env['TAURI_ENV_DEBUG'] === 'true'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	// Tauri expects a fixed port in dev mode
	server: {
		port: 1420,
		strictPort: true,
		watch: {
			ignored: ['**/src-tauri/**'],
		},
	},
	// Prevent vite from obscuring rust errors
	clearScreen: false,
	// Tauri env variables
	envPrefix: ['VITE_', 'TAURI_'],
	build: {
		// Tauri sets TAURI_ENV_DEBUG to the string 'true' or 'false'
		// Tauri uses Chromium on Windows and WebKit on macOS/Linux
		target: process.env['TAURI_ENV_PLATFORM'] === 'windows' ? 'chrome105' : 'safari14',
		minify: !isDebug,
		sourcemap: isDebug,
	},
})
