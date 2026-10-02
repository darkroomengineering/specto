# Specto

GitHub organization metrics dashboard.

## Quick Start

### CLI (via npm)

```bash
npx specto-cli your-org
```

### Desktop App

Download from [Releases](https://github.com/darkroomengineering/specto/releases) or visit [specto.darkroom.engineering](https://specto.darkroom.engineering).

## Monorepo Structure

### Apps

| App            | Description                    | Stack                     |
| -------------- | ------------------------------ | ------------------------- |
| `apps/desktop` | Native desktop app             | Tauri 2, React 19, Vite 7 |
| `apps/web`     | Marketing website              | Next.js 16, React 19      |
| `apps/cli`     | CLI tool (`specto-cli` on npm) | Bun, Commander            |

### Packages

| Package        | Description                    |
| -------------- | ------------------------------ |
| `@specto/core` | GitHub client (REST + GraphQL), shared types, leaderboard data |
| `@specto/ui`   | Shared React components        |

## Development

```bash
# Install dependencies
bun install

# Run all apps in development
bun dev

# Build all apps
bun run build

# Lint, typecheck, test
bun run lint
bun run typecheck
bun run test
```

### Web App Environment

Copy `apps/web/.env.example` to `apps/web/.env.local`. License validation needs
`POLAR_ORGANIZATION_ID` (the organization UUID from Polar settings); checkout and
the customer portal need `POLAR_ACCESS_TOKEN` and `NEXT_PUBLIC_APP_URL`. The
leaderboard works without `GITHUB_TOKEN` but hits GitHub's anonymous rate limit
quickly.

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
