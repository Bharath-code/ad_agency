# Tech Stack — AI Visibility Intelligence

> **Last Updated:** 2026-02-04
> **Timeline:** 15 days to MVP

---

## Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│  SvelteKit 2 + Svelte 5 (Runes)                            │
│  Hosted on: Vercel                                          │
├─────────────────────────────────────────────────────────────┤
│                      BACKEND                                │
│  Convex (Database + Functions + Realtime + Cron)           │
│  Hosted on: Convex Cloud                                    │
├─────────────────────────────────────────────────────────────┤
│                      SERVICES                               │
│  AI:       OpenAI API (gpt-4o-mini)                        │
│  Payments: DodoPayments (Merchant of Record)               │
│  Email:    Resend                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Technologies

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **SvelteKit** | 2.x | Full-stack framework, SSR, routing |
| **Svelte** | 5.x | UI components with Runes |
| **TypeScript** | 5.x | Type safety |

### Backend (Convex)
| Feature | Usage |
|---------|-------|
| **Database** | Projects, users, queries, results, subscriptions |
| **Functions** | Queries, mutations, actions (for OpenAI calls) |
| **Scheduled Functions** | Weekly report generation, batch scans |
| **Real-time** | Live dashboard updates during scans |
| **Auth** | Built-in Convex Auth |

### External Services
| Service | Purpose | Pricing Model |
|---------|---------|---------------|
| **OpenAI API** | ChatGPT analysis (gpt-4o-mini) | Pay per token |
| **DodoPayments** | Payments + Tax compliance (MoR) | ~4% per transaction |
| **Resend** | Transactional email + Weekly reports | Free tier → $20/mo |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **Bun** | JavaScript runtime (fast execution) |
| **pnpm** | Package manager (fast, disk-efficient) |
| **Biome** | Linting + Formatting (replaces ESLint + Prettier) |
| **TypeScript** | Type checking |

---

## Why These Choices?

### Convex over Supabase
- **Reactive by default** — Dashboard updates automatically during scans
- **TypeScript-first** — Schema = Types, no ORM mismatch
- **Built-in cron** — No external scheduler needed for weekly reports
- **Generous free tier** — Scales with early users

### DodoPayments over Stripe
- **Merchant of Record** — They handle VAT, GST, sales tax
- **Simpler compliance** — No 1099 headaches
- **Trade-off** — ~1% higher fees, but worth the peace of mind

### Bun + pnpm
- **Speed** — Faster installs, faster cold starts
- **Compatibility** — Bun handles SvelteKit well in 2026

### Biome over ESLint + Prettier
- **10–100x faster** — Noticeable in CI/CD
- **Single tool** — One config, one command
- **Growing ecosystem** — Good enough for MVP

---

## Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                       VERCEL                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SvelteKit App (SSR + Static)                       │   │
│  │  - Landing page                                      │   │
│  │  - Dashboard                                         │   │
│  │  - Auth pages                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
├─────────────────────────────────────────────────────────────┤
│                     CONVEX CLOUD                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Database   │  │   Functions  │  │  Scheduled   │      │
│  │  (Tables)    │  │  (API)       │  │  (Cron)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                │               │
│           └────────────────┼────────────────┘               │
│                            ▼                                │
├─────────────────────────────────────────────────────────────┤
│                    EXTERNAL APIS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   OpenAI     │  │ DodoPayments │  │    Resend    │      │
│  │  (Analysis)  │  │  (Billing)   │  │   (Email)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=
PUBLIC_CONVEX_URL=

# OpenAI
OPENAI_API_KEY=

# DodoPayments
DODO_API_KEY=
DODO_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
PUBLIC_APP_URL=https://yourapp.com
```

---

## Cost Estimates (MVP)

| Service | Free Tier | Paid Threshold |
|---------|-----------|----------------|
| Convex | 1M function calls/month | ~$25/mo after |
| OpenAI (gpt-4o-mini) | N/A | ~$0.15 per 1M input tokens |
| DodoPayments | N/A | 4% per transaction |
| Resend | 3,000 emails/month | $20/mo after |
| Vercel | 100GB bandwidth | $20/mo after |

**Estimated cost at 100 paying users:** ~$50–100/month
