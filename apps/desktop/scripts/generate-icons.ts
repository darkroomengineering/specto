#!/usr/bin/env bun
/**
 * Generate app icons for Specto
 * Following Apple HIG - fills entire canvas, macOS applies squircle mask
 *
 * Run: bun run apps/desktop/scripts/generate-icons.ts
 * Requires: sharp (bun add -d sharp)
 */

import { writeFile } from 'fs/promises'
import { join } from 'path'

// Create SVG icon - fills entire canvas per Apple guidelines
// macOS automatically applies the rounded squircle mask
function createIconSvg(size: number): string {
	const center = size / 2
	const scale = size / 1024 // Scale factor from base 1024 design

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a"/>
      <stop offset="100%" style="stop-color:#0d0d0d"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff4444"/>
      <stop offset="100%" style="stop-color:#e30613"/>
    </linearGradient>
  </defs>

  <!-- Background fills entire canvas - macOS applies the squircle mask automatically -->
  <rect width="${size}" height="${size}" fill="url(#bg)"/>

  <!-- Sparkle/star icon centered -->
  <g transform="translate(${center}, ${center})">
    <!-- Main 4-point star -->
    <path d="M0 ${-280 * scale} L${40 * scale} ${-40 * scale} L${280 * scale} 0 L${40 * scale} ${40 * scale} L0 ${280 * scale} L${-40 * scale} ${40 * scale} L${-280 * scale} 0 L${-40 * scale} ${-40 * scale} Z" fill="url(#accent)"/>
    <!-- Small sparkles -->
    <path d="M${180 * scale} ${-180 * scale} L${195 * scale} ${-140 * scale} L${235 * scale} ${-125 * scale} L${195 * scale} ${-110 * scale} L${180 * scale} ${-70 * scale} L${165 * scale} ${-110 * scale} L${125 * scale} ${-125 * scale} L${165 * scale} ${-140 * scale} Z" fill="url(#accent)" opacity="0.8"/>
    <path d="M${-180 * scale} ${180 * scale} L${-165 * scale} ${220 * scale} L${-125 * scale} ${235 * scale} L${-165 * scale} ${250 * scale} L${-180 * scale} ${290 * scale} L${-195 * scale} ${250 * scale} L${-235 * scale} ${235 * scale} L${-195 * scale} ${220 * scale} Z" fill="url(#accent)" opacity="0.8"/>
  </g>
</svg>`
}

async function main() {
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

	// Write SVG files for manual conversion if sharp isn't available
	const svg1024 = createIconSvg(1024)
	await writeFile(join(iconsDir, 'icon.svg'), svg1024)
	console.log('Created icon.svg (1024x1024)')

	// Try to use sharp for PNG conversion
	try {
		const sharp = await import('sharp')

		for (const { name, size } of sizes) {
			const svg = createIconSvg(size)
			const buffer = await sharp.default(Buffer.from(svg)).png().toBuffer()
			await writeFile(join(iconsDir, name), buffer)
			console.log(`Created ${name}`)
		}

		// Create ICO for Windows
		console.log('\nNote: For icon.ico, use an online converter or icotool')

		// Create ICNS for macOS
		console.log('Note: For icon.icns, use iconutil on macOS:')
		console.log('  mkdir icon.iconset')
		console.log('  # Copy PNGs to iconset with proper names')
		console.log('  iconutil -c icns icon.iconset')

	} catch (e) {
		console.log('\nSharp not installed. To generate PNG icons:')
		console.log('1. Run: bun add -d sharp')
		console.log('2. Re-run this script')
		console.log('\nOr convert icon.svg manually using:')
		console.log('- Figma / Sketch')
		console.log('- Online SVG to PNG converter')
		console.log('- ImageMagick: convert -background none icon.svg -resize 128x128 128x128.png')
	}
}

main()
