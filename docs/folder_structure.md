# Folder Structure — AI Visibility Intelligence

> Opinionated SvelteKit + Convex project structure

---

## Root Structure

```
ai-visibility/
├── src/                      # SvelteKit app source
├── convex/                   # Convex backend
├── static/                   # Static assets
├── docs/                     # Documentation
├── tests/                    # Test files
│
├── package.json
├── pnpm-lock.yaml
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── biome.json                # Biome config (linting + formatting)
├── convex.json               # Convex config
├── .env.local                # Local env vars (gitignored)
├── .env.example              # Example env template
└── README.md
```

---

## SvelteKit Source (`src/`)

```
src/
├── routes/                   # SvelteKit routes (file-based routing)
│   ├── +layout.svelte        # Root layout
│   ├── +layout.server.ts     # Root server layout (auth check)
│   ├── +page.svelte          # Landing page (public)
│   ├── +error.svelte         # Error boundary
│   │
│   ├── (auth)/               # Auth route group
│   │   ├── login/
│   │   │   └── +page.svelte
│   │   ├── signup/
│   │   │   └── +page.svelte
│   │   └── callback/
│   │       └── +page.svelte  # OAuth callback
│   │
│   ├── (app)/                # Protected app routes
│   │   ├── +layout.svelte    # App layout (sidebar, header)
│   │   ├── +layout.server.ts # Auth guard
│   │   │
│   │   ├── dashboard/
│   │   │   ├── +page.svelte  # Main dashboard
│   │   │   └── +page.ts      # Load data
│   │   │
│   │   ├── projects/
│   │   │   ├── +page.svelte  # Project list
│   │   │   ├── new/
│   │   │   │   └── +page.svelte  # Create project
│   │   │   └── [id]/
│   │   │       ├── +layout.svelte
│   │   │       ├── +page.svelte      # Project dashboard
│   │   │       ├── results/
│   │   │       │   └── +page.svelte  # Detailed results
│   │   │       ├── competitors/
│   │   │       │   └── +page.svelte  # Manage competitors
│   │   │       └── settings/
│   │   │           └── +page.svelte  # Project settings
│   │   │
│   │   ├── billing/
│   │   │   ├── +page.svelte  # Billing dashboard
│   │   │   └── success/
│   │   │       └── +page.svelte  # Payment success
│   │   │
│   │   └── settings/
│   │       └── +page.svelte  # User settings
│   │
│   └── api/                  # API routes (webhooks)
│       └── webhooks/
│           └── dodo/
│               └── +server.ts  # DodoPayments webhook
│
├── lib/                      # Shared code
│   ├── components/           # UI components
│   │   ├── ui/               # Base UI primitives
│   │   │   ├── Button.svelte
│   │   │   ├── Card.svelte
│   │   │   ├── Input.svelte
│   │   │   ├── Modal.svelte
│   │   │   ├── Badge.svelte
│   │   │   ├── Spinner.svelte
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/           # Layout components
│   │   │   ├── Sidebar.svelte
│   │   │   ├── Header.svelte
│   │   │   ├── Footer.svelte
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/        # Dashboard-specific
│   │   │   ├── VisibilityScore.svelte
│   │   │   ├── TopWins.svelte
│   │   │   ├── TopMisses.svelte
│   │   │   ├── CompetitorMentions.svelte
│   │   │   ├── RecommendedFixes.svelte
│   │   │   └── index.ts
│   │   │
│   │   ├── project/          # Project-specific
│   │   │   ├── ProjectCard.svelte
│   │   │   ├── CompetitorList.svelte
│   │   │   ├── ScanButton.svelte
│   │   │   ├── QueryResultRow.svelte
│   │   │   └── index.ts
│   │   │
│   │   └── billing/          # Billing-specific
│   │       ├── PricingCard.svelte
│   │       ├── SubscriptionStatus.svelte
│   │       └── index.ts
│   │
│   ├── stores/               # Svelte stores (client state)
│   │   ├── user.ts           # User store
│   │   ├── project.ts        # Active project store
│   │   └── index.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── formatters.ts     # Date, number formatters
│   │   ├── validators.ts     # Form validation
│   │   └── index.ts
│   │
│   ├── styles/               # Global styles
│   │   ├── app.css           # Main CSS file
│   │   ├── variables.css     # CSS variables
│   │   └── components.css    # Component styles
│   │
│   └── convex.ts             # Convex client setup
│
└── app.html                  # HTML template
```

---

## Convex Backend (`convex/`)

```
convex/
├── schema.ts                 # Database schema
├── auth.config.ts            # Auth configuration
│
├── functions/                # Organized by domain
│   ├── users/
│   │   ├── queries.ts        # getUser, getCurrentUser
│   │   └── mutations.ts      # updateProfile
│   │
│   ├── projects/
│   │   ├── queries.ts        # list, get, getWithScore
│   │   ├── mutations.ts      # create, update, delete
│   │   └── helpers.ts        # Shared project logic
│   │
│   ├── competitors/
│   │   ├── queries.ts
│   │   └── mutations.ts
│   │
│   ├── scans/
│   │   ├── actions.ts        # runScan (calls OpenAI)
│   │   ├── mutations.ts      # saveResult
│   │   └── helpers.ts        # Scoring logic
│   │
│   ├── results/
│   │   ├── queries.ts        # getLatest, getHistory
│   │   └── helpers.ts
│   │
│   ├── reports/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── actions.ts        # sendWeeklyEmail
│   │
│   └── payments/
│       ├── actions.ts        # createCheckout, handleWebhook
│       ├── mutations.ts      # updateSubscription
│       └── queries.ts        # getSubscription
│
├── crons/
│   ├── weeklyScans.ts        # Auto-scan for paid users
│   └── weeklyReports.ts      # Generate and send reports
│
├── lib/                      # Shared backend utilities
│   ├── llm/                  # LLM Provider Abstraction (Risk Mitigation)
│   │   ├── types.ts          # LLMProvider interface, AnalysisPrompt, etc.
│   │   ├── providers/
│   │   │   ├── openai.ts     # OpenAI provider (PRIMARY)
│   │   │   ├── claude.ts     # Claude provider (FALLBACK #1)
│   │   │   └── gemini.ts     # Gemini provider (FALLBACK #2)
│   │   ├── router.ts         # Provider router with failover
│   │   ├── confidence.ts     # Multi-run averaging for variance mitigation
│   │   └── cache.ts          # Response caching (7-day TTL)
│   │
│   ├── resend.ts             # Email client
│   ├── dodo.ts               # DodoPayments client
│   └── constants.ts          # Intent queries, categories
│
└── _generated/               # Auto-generated (gitignored)
    ├── api.d.ts
    └── dataModel.d.ts
```

---

## Static Assets (`static/`)

```
static/
├── favicon.ico
├── favicon.svg
├── og-image.png              # Open Graph image
├── robots.txt
└── fonts/
    ├── inter-var.woff2
    └── ...
```

---

## Tests (`tests/`)

```
tests/
├── unit/
│   ├── utils/
│   │   └── formatters.test.ts
│   └── components/
│       └── Button.test.ts
│
├── integration/
│   ├── projects.test.ts
│   └── scans.test.ts
│
└── e2e/
    ├── auth.spec.ts
    ├── onboarding.spec.ts
    └── billing.spec.ts
```

---

## Key Files

### `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always"
    }
  }
}
```

### `package.json` (scripts)

```json
{
  "scripts": {
    "dev": "convex dev & vite dev",
    "build": "convex deploy && vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `VisibilityScore.svelte` |
| Routes | kebab-case | `projects/[id]/results` |
| Functions | camelCase | `runScan`, `getProject` |
| CSS classes | kebab-case | `.visibility-card` |
| Constants | SCREAMING_SNAKE | `INTENT_QUERIES` |
| Types | PascalCase | `Project`, `ScanResult` |
| Files (TS) | camelCase | `formatters.ts` |

---

## Import Aliases

Configure in `svelte.config.js`:

```javascript
kit: {
  alias: {
    '$components': 'src/lib/components',
    '$stores': 'src/lib/stores',
    '$utils': 'src/lib/utils',
    '$styles': 'src/lib/styles'
  }
}
```

Usage:
```typescript
import { Button } from '$components/ui';
import { user } from '$stores';
import { formatDate } from '$utils';
```
