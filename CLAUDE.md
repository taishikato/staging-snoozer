# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Staging Snoozer is a monorepo-based web application for managing Railway staging environments. It automatically spins up ephemeral staging services for PR review and spins them down on merge or after a TTL.

**Note**: This is a single-user application that uses a Railway API token from environment variables (`RAILWAY_API_TOKEN`). Multi-tenant token management is deferred to future iterations.

## Commands

### Development
```bash
# Start all development servers
pnpm dev

# Start only the web app dev server
cd apps/web && pnpm dev
```

### Building
```bash
# Build all packages
pnpm build

# Build only the web app
pnpm build:web
```

### Code Quality
```bash
# Lint all packages
pnpm lint

# Format all code (TypeScript, TSX, Markdown)
pnpm format
```

### GraphQL
```bash
# Generate GraphQL types from Railway API (requires RAILWAY_API_TOKEN)
cd apps/web && pnpm codegen
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.4 with App Router
- **UI**: Shadcn UI (New York style) + Tailwind CSS v4
- **Language**: TypeScript with strict mode
- **Package Manager**: pnpm with workspaces
- **Build System**: Turbo for monorepo orchestration

### Project Structure
- `apps/web/` - Main Next.js application
  - `app/` - App Router pages and layouts
  - `lib/` - Shared utilities and core logic
  - `components/` - React components (when added)
- `packages/` - Shared packages across apps
- `turbo.json` - Turbo pipeline configuration

### Key Integrations
1. **Railway GraphQL API** - For managing staging environments ✅
   - Service listing with deployment status ✅
   - Service creation (`serviceCreate` + `serviceInstanceDeployV2`) ✅
   - Service lifecycle management (`deploymentStop` + `serviceDelete`) ✅
   - Deployment status polling (10s intervals, up to 5 min) ✅
   - GraphQL code generation with introspection ✅
   - Project/environment selector with localStorage persistence ✅
2. **GitHub Webhooks** - For PR-driven automation (planned)
3. **Drizzle ORM** - Database access layer (planned)
4. **Scheduler Service** - Cron-based service lifecycle management (planned)

## Development Guidelines

### Component Development
- Use Shadcn UI components from `@/components/ui`
- Follow the New York style configuration
- Icons: Use Lucide React icons
- Available UI components: badge, button, card, dialog, form, input, label, select, skeleton, table, dropdown-menu, alert-dialog
- Use confirmation dialogs (`AlertDialog`) for destructive operations
- Implement proper loading states with `Skeleton` components

### TypeScript
- Path alias `@/*` maps to `apps/web/*`
- Strict mode is enabled
- Follow existing type patterns in the codebase

### API Development
- Railway GraphQL endpoints are integrated in `/api` routes ✅
- Uses `RAILWAY_API_TOKEN` environment variable for authentication ✅
- All Railway API calls happen server-side only ✅
- GraphQL types are auto-generated from introspection ✅
- Implement proper error handling for external API calls
- Available API routes:
  - `/api/services` - Service listing and management (GET, DELETE, POST)
  - GraphQL queries use generated types from `@/lib/gql/generated.ts`

### State Management
- Use React Server Components where possible
- Client components only when necessary for interactivity
- Consider using React Context or Zustand for complex client state