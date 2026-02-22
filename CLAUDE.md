# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Frontend**: SvelteKit with Svelte 5, Tailwind CSS, bits-ui components
- **Backend**: Convex (serverless backend with real-time database)
- **Auth**: Clerk (managed authentication service)
- **AI**: Multi-provider router supporting OpenAI and Anthropic Claude with circuit breaker failover
- **Payments**: DodoPayments integration
- **Email**: Resend
- **Tooling**: Biome (linting/formatting), Vitest (unit tests), Playwright (e2e tests)

## Development Commands

```bash
# Development - runs both Convex and Vite dev servers
npm run dev

# Development (separate processes if needed)
npm run dev:frontend  # Vite only
npm run dev:convex    # Convex only

# Build for production (deploys Convex first, then builds frontend)
npm run build

# Testing
npm test              # Run unit tests with Vitest
npm run test:e2e      # Run Playwright e2e tests

# Code Quality
npm run lint          # Check code with Biome
npm run lint:fix      # Fix auto-fixable issues
npm run format        # Format code with Biome
npm run check         # Type-check Svelte components
npm run check:watch   # Type-check in watch mode
```

## Architecture Overview

### Frontend Structure (`src/`)
- **Routes**: File-based routing via SvelteKit
  - `/src/routes/+page.svelte` - Landing page
  - `/src/routes/app/*` - Authenticated app routes (dashboard, projects, billing)
  - `/src/routes/login/*` - Auth pages
  - `/src/routes/api/webhooks/*` - API endpoints (e.g., DodoPayments webhooks)
- **Components**: Organized by domain
  - `src/lib/components/dashboard/` - Dashboard-specific components
  - `src/lib/components/project/` - Project management components
  - `src/lib/components/ui/` - Reusable UI components (based on bits-ui)
  - `src/lib/components/layout/` - Layout components (Navbar, Sidebar, Footer)
- **Stores**: Svelte stores for client state (`auth.ts`, `toast.ts`)
- **Convex client**: Initialized in `src/lib/convex.ts`

### Backend Structure (`convex/`)
Convex functions are organized by domain:
- **Schema**: `schema.ts` defines database tables (users, projects, competitors, results, etc.)
- **Domain functions**: Each file exports queries, mutations, and actions
  - `projects.ts` - Project CRUD operations
  - `scans.ts` - AI visibility scanning logic (uses `'use node'` directive)
  - `results.ts` - Scan results management
  - `users.ts` - User management
  - `payments.ts` - Payment/subscription handling
  - `weeklyReports.ts` - Weekly report generation
  - `crons.ts` - Scheduled jobs (auto-scans for paid users)
- **Lib**: Shared utilities
  - `lib/llm/` - Multi-provider AI router with circuit breaker, failover, and retry logic
  - `lib/auth.ts` - Auth helpers for Convex functions
  - `lib/prompts.ts` - AI prompt templates
  - `lib/utils.ts` - General utilities
  - `lib/dodo.ts` - Payment integration
  - `lib/resend.ts` - Email sending

### Convex Function Types
- **Queries**: Read-only, real-time subscriptions, client-cached
- **Mutations**: Write operations, transactional
- **Actions**: Can call external APIs (use `'use node'` directive), non-transactional
- **HTTP actions**: Expose HTTP endpoints (`http.ts`)

### Key Patterns

#### LLM Multi-Provider Router
Located in `convex/lib/llm/router.ts`:
- Circuit breaker pattern to handle provider failures
- Automatic failover between OpenAI and Claude
- Exponential backoff retry logic
- Health checks before requests

#### Authentication Flow
- Clerk handles auth on frontend via `svelte-clerk`
- Convex validates Clerk JWTs via `auth.config.ts`
- Use `requireUserForAction()` in Convex actions to enforce auth
- `VITE_BYPASS_AUTH` env var for local development (never use in production)

#### Scan Processing
Scans use multi-run consensus with confidence scoring:
1. Multiple LLM calls per query (configured in `lib/prompts.ts`)
2. Aggregate results to derive confidence (high/medium/low)
3. Store raw responses for debugging/transcripts
4. Calculate visibility scores using `calculateVisibilityScore()` utility

## Database Schema

Key tables (see `convex/schema.ts` for full schema):
- `users` - User accounts with plan tier (free/indie/startup) and scan limits
- `projects` - User projects with industry and visibility score
- `competitors` - Competitors per project
- `intentQueries` - Fixed set of 30 queries per project (e.g., "best tools", "alternatives")
- `results` - Scan results with position, confidence, and recommendations
- `subscriptions` - DodoPayments subscription tracking
- `weeklyReports` - Generated weekly reports for email delivery

**Important indexes**:
- All foreign keys have indexes (e.g., `by_user`, `by_project`)
- `results` has composite index `by_project_and_scan` for efficient scan queries

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:
- `PUBLIC_CONVEX_URL` - From `npx convex dev`
- `PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_JWT_ISSUER_DOMAIN` - From Clerk dashboard
- `OPENAI_API_KEY` - OpenAI API key (primary provider)
- `ANTHROPIC_API_KEY` - Claude API key (fallback provider)
- `DODO_API_KEY` - DodoPayments API key
- `RESEND_API_KEY` - Resend API key for emails
- `VITE_BYPASS_AUTH` - Set to `false` in production

## Code Style

Enforced by Biome (`biome.json`):
- **Indentation**: Tabs
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Line width**: 100 characters
- Svelte files have relaxed linting (unused variables allowed)

## Testing

- **Unit tests**: `vitest.config.ts` - Run with `npm test`
- **E2E tests**: `playwright.config.ts` - Tests in `tests/e2e/`
  - Uses Chromium only
  - Starts dev server automatically
  - Base URL: `http://localhost:5173`

## Alias Configuration

- `$convex` → `convex/` (configured in `svelte.config.js`)
- Standard SvelteKit aliases: `$lib`, `$app`, etc.

## Common Workflows

### Adding a Convex Function
1. Add function to appropriate domain file (e.g., `projects.ts`)
2. Use validators from `convex/values` for args
3. For external API calls, use `action` with `'use node'` directive
4. Import and use in frontend via `api.*` from `convex/_generated/api`

### Adding a Svelte Route
1. Create `+page.svelte` in `src/routes/[path]/`
2. Add `+page.ts` for data loading (uses Convex queries)
3. Use layout files (`+layout.svelte`) for shared UI

### Modifying LLM Prompts
1. Edit `convex/lib/prompts.ts`
2. Test with different providers (OpenAI/Claude)
3. Adjust `LLM_CONFIG` for temperature/runs/consensus threshold

### Adding a Database Table
1. Update `convex/schema.ts` with `defineTable()`
2. Add indexes for foreign keys and common queries
3. Run `npx convex dev` to regenerate types
4. Create domain functions for CRUD operations
