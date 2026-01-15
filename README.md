# Specto

GitHub organization metrics dashboard by [Darkroom Engineering](https://darkroom.engineering).

## Quick Start

### CLI (via npm)

```bash
npx specto-cli darkroomengineering
```

### Desktop App

Download from [Releases](https://github.com/darkroomengineering/specto/releases) or visit [specto.darkroom.engineering](https://specto.darkroom.engineering).

## Monorepo Structure

### Apps

| App | Description | Stack |
|-----|-------------|-------|
| `apps/desktop` | Native desktop app | Tauri 2, React 19, Vite 7 |
| `apps/web` | Marketing website | Next.js 16, React 19 |
| `apps/cli` | CLI tool (`specto-cli` on npm) | Bun, Commander |

### Packages

| Package | Description |
|---------|-------------|
| `@specto/core` | Shared types and GitHub client |
| `@specto/ui` | Darkroom-themed React components |

## Development

```bash
# Install dependencies
bun install

# Run all apps in development
bun dev

# Build all apps
bun build
```

### Desktop App Development

Requires [GitHub CLI](https://cli.github.com) for authentication:

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Run desktop app
cd apps/desktop && bun run dev
```

## Requirements

- [Bun](https://bun.sh) >= 1.2
- [Rust](https://rustup.rs) (for Tauri desktop app)
- [GitHub CLI](https://cli.github.com) (for authentication)

## License

MIT
