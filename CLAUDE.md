# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product & Roadmap Status

The product is **PromptLens** — an AI recommendation diagnostics platform that shows B2B teams
why AI assistants recommend competitors instead of them, then gives the exact content/positioning
fixes. (Older names "AI Visibility Intelligence" / "RivalEye" / "AVI" are fully retired.)

Work is tracked against `plans/promptlens-roadmap.md` (10 phases + status tracker), derived from
`docs/product_strategy_master_plan.md`. Marketing context: `.agents/product-marketing-context.md`.

### Execution workflow — one phase per session

We deliver **one roadmap phase per branch, then start a fresh session** for the next. For each phase:

1. **Branch** `feat/phase-<N>-<slug>` **always off the latest `main`** (`git fetch && git checkout -b
   feat/phase-<N>-<slug> origin/main`). Merge the prior phase's PR to `main` *before* starting the next.
2. **Build** to the phase's acceptance criteria; add/extend tests; honor the design system below.
3. **Verify**: `npm test` + `npm run check` green (0 errors); preview UI locally.
4. **Push** the branch + open a PR **with base `main`** (commit with the `Co-Authored-By` trailer).
5. **Record**: tick the box in `plans/promptlens-roadmap.md` Status Tracker, update this section's
   "Next up" pointer, refresh `.remember/remember.md`.
6. **Reset**: `/clear` and resume at the next phase.

> **Never stack a phase branch on another phase's branch, and never base a PR on anything but `main`.**
> Phase 3 was nearly stranded because PRs were chained (Phase 3 → Phase 2 branch → roadmap branch →
> `main`) and `main` was squash-merged, so the 3-way merge against the rewritten history conflicted.
> One branch off `main`, one PR into `main`, merged before the next phase starts — keeps history linear
> and every phase reaches `main`. If you ever must rebase a stranded branch, cherry-pick its phase commit
> onto fresh `origin/main` rather than merging the divergent history.

See `plans/promptlens-roadmap.md` → "Execution Protocol" + "Status Tracker" for the authoritative list.

**Completed:**
- **Rename to PromptLens** (roadmap Task 1): all user-facing surfaces, metadata, emails, README — on
  branch `feat/promptlens-roadmap`.
- **Full UI/UX redesign** — "Editorial Intelligence" design system (landing + entire app shell).
- **Phase 2 — Project URL + primary use case** (branch `feat/phase-2-project-url`): added
  `project.url` + `project.primaryUseCase` to schema; `validateProjectUrl` (http/https allowlist via
  WHATWG `URL`) in `convex/lib/utils.ts`; create/update mutations validate + store both; wizard and
  detail-page edit modal capture/edit them; `fillIntentQueryTemplate` (`convex/lib/constants.ts`) and
  the brand-visibility prompt (`convex/lib/prompts.ts`) consume them. Unit tests in
  `tests/unit/utils.test.ts` + `tests/unit/prompts.test.ts`.
- **Phase 3 — Industry prompt library** (branch `feat/phase-3-prompt-library`): replaced the flat
  `INTENT_QUERY_TEMPLATES` in `convex/lib/constants.ts` with a structured `PROMPT_LIBRARY` (8 categories —
  best_tools/alternatives/comparisons/integrations/verticals/pricing/problem_aware/use_cases — each
  template tagged with `stage` (awareness/consideration/decision) + `buyerRole`). `generateIntentQueries`
  is deterministic (stable order + dedup); `INDUSTRY_PROMPT_PACKS` appends vertical prompts by normalized
  industry keyword (`normalizeIndustryKey`); versioned via `PROMPT_LIBRARY_VERSION`. Schema `intentQueries`
  gained optional `stage` + `templateVersion` (no migration). `projects.create` stores them. Tests in
  `tests/unit/promptLibrary.test.ts`.
- **Phase 4 — Multi-model confidence** (branch `feat/phase-4-multi-model`): a single scan now runs every
  configured provider (OpenAI + Claude) unless one is forced. Consensus math extracted to a pure,
  unit-tested module `convex/lib/consensus.ts` (`deriveConfidence`, `consensusFromRuns` per model,
  `aggregateAcrossModels`). Each `results` row stays **one-per-query** (aggregate verdict) and gained
  optional `runCount` / `successfulRuns` / `consensusRatio` / `modelResults[]` (per-model breakdown) — all
  optional, no migration. `scans.ts` (`runScan` + auto-scan `runScanForProject`) builds the aggregate and
  tolerates a provider failing all runs (recorded as a failed `ModelVisibility`; scan continues if ≥1
  succeeds); `runScan` returns `models` + `failedModels`. `results.getModelComparison` rewritten to read
  per-model from the latest single scan's `modelResults` (legacy rows fall back to top-level model).
  Dashboard scan dropdown defaults to "All Models" and toasts partial-provider failure. Tests:
  `tests/unit/consensus.test.ts`.

**Next up: Phase 5 — Evidence viewer.** Branch `feat/phase-5-evidence-viewer`. Add a prompt detail view
(prompt text, model, raw transcript, parsed recommendation, competitor winner, reasons, confidence, scan
date); link every top win/miss to evidence; render raw model output as text (never HTML); hide internal
system prompts/API metadata; polished empty/error states; works on mobile + desktop. See
`plans/promptlens-roadmap.md` → "Phase 5".

**Known open decisions (do not silently resolve):**
- **Pricing is inconsistent** across three sources — code (`convex/lib/constants.ts`: indie $49 /
  startup $149), the strategy doc ($99/$249/$799), and the landing page ($79/$199). Reconcile in
  **Phase 9 (billing)**; surface for the user's decision.
- The Convex browser client crashes `vite dev` when `PUBLIC_CONVEX_URL` is empty (it can't parse the
  `placeholder` deployment name). Worth an SSR guard later.

## Design System ("Editorial Intelligence")

Defined in `src/app.css`. Calm, warm, evidence-forward — a "premium intelligence cockpit," not a
marketing toy. Key rules when building any UI:

- **Palette:** warm paper bg (`#faf9f5`), warm ink (`#1c1b16`), a single **deep-evergreen** accent
  (`#0c5d4d`). NO neon orange, NO purple/blue AI gradients. Signal language: **evergreen = you win /
  recommended**, **amber (`--color-signal-miss`) = competitor wins / miss**.
- **Type:** `Fraunces` (serif display/headings — marketing + section titles), `Instrument Sans` (body),
  `JetBrains Mono` (data, scores, eyebrow labels). All loaded via the Google Fonts `@import` in `app.css`.
- **Tokens are the source of truth.** `--color-brand` is evergreen, so `Button variant="brand"` and email
  templates inherit automatically. A legacy compatibility layer in `app.css` (`:root` block) maps the older
  in-app vocabulary (`--space-*`, `--text-*`, `--bg-*`, `--border-*`, `--z-sticky`) onto the new system —
  **prefer the semantic tokens (`--color-foreground`, `--color-primary`, `--color-slate-*`) over hardcoded
  hexes.** Hardcoded cool-slate hexes clash with the warm palette.
- **Components own their scoped styles.** Svelte scopes CSS per file; co-locate markup and `<style>`.
  (The original landing was broken precisely because styles were orphaned in `+page.svelte` away from the
  child components that held the markup.) Use the `.eyebrow`, `.container`, `.section-spacing`, and
  `.btn-saas*` global utilities from `app.css`.
- Lucide icons (`lucide-svelte`); hairline borders; soft low shadows (`--shadow-card`, `--shadow-raised`);
  divided panels/lists over glossy cards.

## Local Preview Without a Backend

The landing page renders with vite alone, but the Convex client needs a *parseable* URL or it crashes the
dev server. To preview the authed app with realistic data:

```bash
VITE_BYPASS_AUTH=true PUBLIC_CONVEX_URL=https://industrious-narwhal-123.convex.cloud npm run dev:frontend
```

Data pages (dashboard, projects, billing) use a `withTimeout(...) + mock-data` fallback **gated on
`VITE_BYPASS_AUTH`** so a dead backend degrades to mock data instead of an infinite skeleton (prod
behavior is unaffected). Follow this same pattern when adding new data-backed pages.

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
