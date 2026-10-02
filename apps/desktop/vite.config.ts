import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
		// Tauri uses Chromium on Windows and WebKit on macOS/Linux
		target: process.env['TAURI_PLATFORM'] === 'windows' ? 'chrome105' : 'safari14',
		minify: !process.env['TAURI_DEBUG'] ? 'esbuild' : false,
		sourcemap: !!process.env['TAURI_DEBUG'],
	},
})
