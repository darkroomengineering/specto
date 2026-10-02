#!/usr/bin/env bun
/**
 * Generate app icons for Specto from the website favicon
 * Crops padding to match macOS dock icon sizes
 * Run: bun run apps/desktop/scripts/generate-icons.ts
 */

import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

async function main() {
	const sourceIcon = join(import.meta.dir, '../../web/app/icon.png')
	const iconsDir = join(import.meta.dir, '../src-tauri/icons')

	const sizes = [
		{ name: '32x32.png', size: 32 },
		{ name: '64x64.png', size: 64 },
		{ name: '128x128.png', size: 128 },
		{ name: '128x128@2x.png', size: 256 },
		{ name: '256x256.png', size: 256 },
		{ name: '512x512.png', size: 512 },
		{ name: 'icon.png', size: 1024 },
		{ name: 'Square30x30Logo.png', size: 30 },
		{ name: 'Square44x44Logo.png', size: 44 },
		{ name: 'Square71x71Logo.png', size: 71 },
		{ name: 'Square89x89Logo.png', size: 89 },
		{ name: 'Square107x107Logo.png', size: 107 },
		{ name: 'Square142x142Logo.png', size: 142 },
		{ name: 'Square150x150Logo.png', size: 150 },
		{ name: 'Square284x284Logo.png', size: 284 },
		{ name: 'Square310x310Logo.png', size: 310 },
		{ name: 'StoreLogo.png', size: 50 },
	]

	try {
		const sharp = await import('sharp')

		// Crop transparent padding from source (80px on each side)
		// Then resize to fill canvas for proper dock icon size
		const padding = 80
		const cropped = await sharp
			.default(sourceIcon)
			.extract({
				left: padding,
				top: padding,
				width: 1024 - padding * 2,
				height: 1024 - padding * 2,
			})
			.resize(1024, 1024)
			.ensureAlpha()
			.png()
			.toBuffer()

		for (const { name, size } of sizes) {
			const buffer = await sharp.default(cropped).resize(size, size).png().toBuffer()
			await writeFile(join(iconsDir, name), buffer)
			console.log(`Created ${name}`)
		}

		console.log('\nThen run:')
		console.log('  cd src-tauri/icons && bun x png-to-ico 256x256.png > icon.ico')
		console.log('  # For macOS: use iconutil to create icon.icns')
	} catch (e) {
		console.error('Error:', e)
	}
}

main()
