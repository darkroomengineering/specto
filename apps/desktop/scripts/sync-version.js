#!/usr/bin/env node
/**
 * Syncs version from package.json to tauri.conf.json and Cargo.toml
 * Run this before building to ensure all version numbers match
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

// Read version from package.json (source of truth)
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
const version = packageJson.version

console.log(`Syncing version: ${version}`)

// Update tauri.conf.json
const tauriConfPath = join(rootDir, 'src-tauri', 'tauri.conf.json')
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf-8'))
if (tauriConf.version !== version) {
	tauriConf.version = version
	writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, '  ') + '\n')
	console.log(`  ✓ Updated tauri.conf.json`)
} else {
	console.log(`  ✓ tauri.conf.json already up to date`)
}

// Update Cargo.toml
const cargoPath = join(rootDir, 'src-tauri', 'Cargo.toml')
let cargoToml = readFileSync(cargoPath, 'utf-8')
const versionRegex = /^version\s*=\s*"[^"]+"/m
const newVersionLine = `version = "${version}"`
if (!cargoToml.match(new RegExp(`^version\\s*=\\s*"${version}"`, 'm'))) {
	cargoToml = cargoToml.replace(versionRegex, newVersionLine)
	writeFileSync(cargoPath, cargoToml)
	console.log(`  ✓ Updated Cargo.toml`)
} else {
	console.log(`  ✓ Cargo.toml already up to date`)
}

console.log(`\nVersion sync complete: ${version}`)
