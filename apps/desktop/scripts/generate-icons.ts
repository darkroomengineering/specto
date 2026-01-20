#!/usr/bin/env bun
/**
 * Generate app icons for Specto from the website favicon
 * Following Apple HIG - fills entire canvas, macOS applies squircle mask
 *
 * Run: bun run apps/desktop/scripts/generate-icons.ts
 * Requires: sharp (bun add -d sharp)
 */

import { writeFile } from 'fs/promises'
import { join } from 'path'

async function main() {
	const sourceIcon = join(import.meta.dir, '../../web/app/icon.png')
	const iconsDir = join(import.meta.dir, '../src-tauri/icons')

	// Icon sizes needed for Tauri
	const sizes = [
		{ name: '32x32.png', size: 32 },
		{ name: '64x64.png', size: 64 },
		{ name: '128x128.png', size: 128 },
		{ name: '128x128@2x.png', size: 256 },
		{ name: '256x256.png', size: 256 },
		{ name: '512x512.png', size: 512 },
		{ name: 'icon.png', size: 1024 },
		// Windows
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

		// Read source and flatten with dark background to fill transparent areas
		const source = await sharp
			.default(sourceIcon)
			.flatten({ background: { r: 20, g: 20, b: 20 } })
			.toBuffer()

		// Crop to remove existing padding from the web icon
		const padding = 100
		const cropped = await sharp
			.default(source)
			.extract({
				left: padding,
				top: padding,
				width: 1024 - padding * 2,
				height: 1024 - padding * 2,
			})
			.toBuffer()

		// Resize to fill full canvas
		const fullSize = await sharp.default(cropped).resize(1024, 1024).png().toBuffer()

		for (const { name, size } of sizes) {
			const buffer = await sharp.default(fullSize).resize(size, size).png().toBuffer()
			await writeFile(join(iconsDir, name), buffer)
			console.log(`Created ${name}`)
		}

		console.log('\nNote: For icon.ico and icon.icns, run:')
		console.log('  cd src-tauri/icons')
		console.log('  bun x png-to-ico 256x256.png > icon.ico')
		console.log('  # For icns, use iconutil with an iconset folder')
	} catch (e) {
		console.log('\nSharp not installed. To generate PNG icons:')
		console.log('1. Run: bun add -d sharp')
		console.log('2. Re-run this script')
	}
}

main()
