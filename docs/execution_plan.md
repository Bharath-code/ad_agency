# 15-Day Execution Plan — AI Visibility Intelligence

> **Start Date:** 2026-02-04
> **MVP Launch:** 2026-02-19
> **Working Hours:** ~8h/day

---

## Timeline Overview

```
Week 1 (Feb 4-10)                    Week 2 (Feb 11-17)          Launch (Feb 18-19)
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│ D1 │ D2 │ D3 │ D4 │ D5 │ D6 │ D7 │ D8 │ D9 │D10 │D11 │D12 │D13 │D14 │D15 │
├────┴────┼────┴────┼────┴────┴────┼────┴────┼────┴────┼────┴────┼────┴────┤
│Foundation│Onboard │ Query Engine │Dashboard│ Billing │ Reports │ Polish  │
└─────────┴─────────┴──────────────┴─────────┴─────────┴─────────┴─────────┘
```

---

## Day 1-2: Foundation

### Day 1 (Feb 4) — Project Setup

**Morning (4h)**
- [ ] Initialize SvelteKit project with Svelte 5
- [ ] Configure pnpm + Bun runtime
- [ ] Add Biome for linting/formatting
- [ ] Initialize Convex project
- [ ] Set up TypeScript config

**Afternoon (4h)**
- [ ] Create Convex schema (all tables)
- [ ] Set up Convex Auth
- [ ] Create base layout components (Sidebar, Header)
- [ ] Configure CSS variables and design tokens

**Deliverable:** Empty app with auth, user can sign up.

### Day 2 (Feb 5) — Auth + Layout

**Morning (4h)**
- [ ] Complete login/signup pages
- [ ] OAuth callback handling
- [ ] Protected route guard
- [ ] User session management

**Afternoon (4h)**
- [ ] Finish app layout (sidebar, header, responsive)
- [ ] Empty dashboard shell
- [ ] Navigation between routes
- [ ] Error boundary

**Deliverable:** Authenticated user sees empty dashboard.

---

## Day 3-4: Onboarding

### Day 3 (Feb 6) — Project Creation

**Morning (4h)**
- [ ] Project creation form UI
- [ ] Form validation (Zod)
- [ ] Convex mutation: `projects.create`
- [ ] Seed 30 intent queries on project create

**Afternoon (4h)**
- [ ] Competitor input (add 2-5)
- [ ] Convex mutation: `competitors.add`
- [ ] Industry selector dropdown
- [ ] Success redirect to project

**Deliverable:** User creates project with competitors.

### Day 4 (Feb 7) — Project Management

**Morning (4h)**
- [ ] Project list page
- [ ] Project card component
- [ ] Convex query: `projects.list`
- [ ] Empty state design

**Afternoon (4h)**
- [ ] Project detail page layout
- [ ] Project settings page
- [ ] Edit project mutation
- [ ] Delete project (with confirmation)

**Deliverable:** Full project CRUD working.

---

## Day 5-7: Query Engine (Core)

### Day 5 (Feb 8) — OpenAI Integration

**Morning (4h)**
- [ ] OpenAI client setup (`convex/lib/openai.ts`)
- [ ] Prompt 1: Brand Visibility Detection
- [ ] Test prompt with sample data
- [ ] Error handling + retries

**Afternoon (4h)**
- [ ] Prompt 2: Competitor Advantage Extraction
- [ ] Prompt 3: Positioning Fix Suggestion
- [ ] Store prompts as constants
- [ ] Response parsing + validation

**Deliverable:** All 3 prompts working in isolation.

### Day 6 (Feb 9) — Batch Execution

**Morning (4h)**
- [ ] Convex action: `scans.run`
- [ ] Batch all 30 queries
- [ ] Sequential execution with rate limiting
- [ ] Progress tracking (scanId)

**Afternoon (4h)**
- [ ] Result storage (`results` table)
- [ ] Handle partial failures
- [ ] Retry failed queries
- [ ] Scan status tracking

**Deliverable:** "Run Scan" executes all 30 queries.

### Day 7 (Feb 10) — Scoring + Polish

**Morning (4h)**
- [ ] Visibility score calculation
- [ ] Score formula: `(primary*2 + secondary*1) / total * 100`
- [ ] Update project with latest score
- [ ] Historical score tracking

**Afternoon (4h)**
- [ ] Scan progress UI (spinner, progress bar)
- [ ] Real-time updates during scan
- [ ] Scan completion notification
- [ ] Edge case testing

**Deliverable:** Complete scan flow with live progress.

---

## Day 8-9: Dashboard

### Day 8 (Feb 11) — Core Dashboard

**Morning (4h)**
- [ ] Visibility Score card (big number)
- [ ] Score trend indicator (↑ ↓)
- [ ] Top Wins list (queries where mentioned)
- [ ] Convex queries for dashboard data

**Afternoon (4h)**
- [ ] Top Misses list (not mentioned)
- [ ] Competitor Mentions section
- [ ] Query detail modal
- [ ] Loading states

**Deliverable:** Dashboard shows real scan data.

### Day 9 (Feb 12) — Recommendations

**Morning (4h)**
- [ ] Recommended Fixes section
- [ ] Fix card component (positioning, content, messaging)
- [ ] Prioritized list (most impactful first)
- [ ] Copy-to-clipboard for fixes

**Afternoon (4h)**
- [ ] Results page (full table view)
- [ ] Filter by: mentioned, position, category
- [ ] Sort options
- [ ] Export to CSV (nice to have)

**Deliverable:** Full dashboard with actionable insights.

---

## Day 10-11: Billing

### Day 10 (Feb 13) — DodoPayments Setup

**Morning (4h)**
- [ ] DodoPayments account setup
- [ ] Create products (Indie $49, Startup $149)
- [ ] Webhook endpoint (`/api/webhooks/dodo`)
- [ ] Webhook verification

**Afternoon (4h)**
- [ ] Convex action: `payments.createCheckout`
- [ ] Checkout redirect flow
- [ ] Payment success page
- [ ] Update subscription in Convex

**Deliverable:** User can pay and subscription is stored.

### Day 11 (Feb 14) — Paywall + Billing UI

**Morning (4h)**
- [ ] Free tier limits (5 scans total)
- [ ] Scan limit check in `scans.run`
- [ ] Upgrade prompt when limit hit
- [ ] Pricing page component

**Afternoon (4h)**
- [ ] Billing dashboard
- [ ] Current plan display
- [ ] Upgrade/downgrade flow
- [ ] Cancel subscription

**Deliverable:** Full billing flow working.

---

## Day 12-13: Weekly Reports

### Day 12 (Feb 15) — Email Setup

**Morning (4h)**
- [ ] Resend integration (`convex/lib/resend.ts`)
- [ ] Email templates (HTML)
- [ ] Weekly report template design
- [ ] Test email sending

**Afternoon (4h)**
- [ ] Report generation logic
- [ ] Calculate week-over-week changes
- [ ] Extract top 3 priority fixes
- [ ] New competitor mentions

**Deliverable:** Can manually trigger report email.

### Day 13 (Feb 16) — Automation

**Morning (4h)**
- [ ] Convex cron: `weeklyReports` (Monday 9am)
- [ ] Convex cron: `weeklyScans` (Monday 6am)
- [ ] Only run for paid users
- [ ] Email preference (opt-out)

**Afternoon (4h)**
- [ ] Weekly reports table
- [ ] Report history in UI
- [ ] Email preview in app
- [ ] Test cron execution

**Deliverable:** Automated weekly emails working.

---

## Day 14-15: Polish + Launch

### Day 14 (Feb 17) — Landing Page

**Morning (4h)**
- [ ] Hero section (headline, CTA)
- [ ] Features section (4-6 features)
- [ ] Pricing section
- [ ] Social proof (placeholder)

**Afternoon (4h)**
- [ ] FAQ section
- [ ] Legal copy ("we analyze, not manipulate")
- [ ] Footer
- [ ] Mobile responsive

**Deliverable:** Public landing page ready.

### Day 15 (Feb 18-19) — Final Polish

**Morning (4h)**
- [ ] Loading states everywhere
- [ ] Error handling + user feedback
- [ ] Mobile responsiveness check
- [ ] Accessibility basics (a11y)

**Afternoon (4h)**
- [ ] Deploy to Vercel (production)
- [ ] Deploy Convex (production)
- [ ] Environment variables configured
- [ ] Smoke test all flows

**Evening**
- [ ] Final walkthrough
- [ ] Fix any critical bugs
- [ ] **LAUNCH** 🚀

---

## Daily Checklist Template

```
## Day X (Date)

**Morning Focus:** [Area]
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
- [ ] Task 4

**Afternoon Focus:** [Area]
- [ ] Task 5
- [ ] Task 6
- [ ] Task 7
- [ ] Task 8

**End of Day:**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Committed to git
- [ ] Tomorrow's plan clear
```

---

## Risk Mitigation

| Risk | Mitigation | Fallback |
|------|------------|----------|
| OpenAI rate limits | Implement retry + backoff | Reduce batch size |
| DodoPayments issues | Start integration Day 10 | Fallback to Stripe |
| Convex edge cases | Test thoroughly Day 7 | Simplify schema |
| Time overrun | Weekly reports are cut first | Launch without automation |

---

## Cut List (If Behind Schedule)

**Can defer to post-MVP:**
1. Weekly email reports (send manually)
2. Export to CSV
3. Result filtering/sorting
4. Email preferences
5. Scan history (keep only latest)

**Cannot defer:**
- Auth
- Project CRUD
- Scan execution
- Dashboard
- Billing

---

## Success Criteria

By Day 15, a user must be able to:

1. ✅ Sign up and create a project
2. ✅ Add competitors
3. ✅ Run a scan
4. ✅ See visibility score + results
5. ✅ Read actionable recommendations
6. ✅ Pay to upgrade
7. ✅ Receive weekly email (if paid)

If all 7 work → **MVP is complete**.
