Good. Below is a **single, comprehensive MVP specification** you can hand to yourself (or any dev) and build **without ambiguity**.

This is **not** a pitch, not a concept — this is an **execution document**.

---

# 🧠 MVP SPEC — *AI Visibility Intelligence*

## One-line definition

> A B2B SaaS that shows founders **when and why AI assistants recommend (or ignore) their product**, and what to fix.

---

# 1️⃣ MVP GOAL (NON-NEGOTIABLE)

By the end of MVP:

* A founder can answer **one critical question**:

  > “Why does ChatGPT recommend my competitor instead of me?”

If your MVP does that reliably → it wins.

---

# 2️⃣ WHAT THE MVP MUST DO (CORE OUTCOMES)

### The MVP must:

✅ Run predefined AI intent queries
✅ Detect brand & competitor mentions
✅ Classify visibility (primary / secondary / absent)
✅ Explain *why* competitors appear
✅ Suggest **one concrete fix per missed intent**
✅ Produce a weekly summary founders understand
✅ Charge money

### The MVP must NOT:

❌ Claim control over AI
❌ Promise rankings
❌ Be real-time
❌ Be “autonomous agents”
❌ Be overdesigned

---

# 3️⃣ MVP USER PERSONA (BUILD FOR ONE)

**Primary user**

* Solo / small SaaS founder
* Revenue: $1k–$100k MRR
* Knows competitors
* Already hearing: “ChatGPT is recommending X”

If this user is happy → expand later.

---

# 4️⃣ MVP FEATURES (FINAL SCOPE)

## ✅ FEATURE 1 — PROJECT SETUP (ONBOARDING)

**Input**

* Product name
* Short description (1–2 lines)
* Industry
* 2–5 competitors
* Primary use-case

**Output**

* Project created
* Default intent queries auto-added

⏱ Time to complete: < 2 minutes

---

## ✅ FEATURE 2 — FIXED INTENT QUERY ENGINE (CORE)

You do **not** allow users to write their own prompts in MVP.

### Why?

* Consistency
* Comparability
* Safety
* Lower infra cost

### MVP query set

* 30 high-intent queries (best / alternatives / comparisons / worth it / use-case)

### Execution

* Run all queries in batch
* Store results
* Repeat weekly (cron)

---

## ✅ FEATURE 3 — BRAND VISIBILITY ANALYSIS

For **each query**, store:

* `mentioned` → true / false
* `position` → primary / secondary / not_mentioned
* `context` → one sentence explanation
* `confidence_level` → high / medium / low

This feeds everything else.

---

## ✅ FEATURE 4 — COMPETITOR ADVANTAGE EXPLANATION

For each **missed query**:

* Identify the winning competitor
* Extract **3 concrete reasons** (positioning, clarity, specificity)

This is what founders pay for.

---

## ✅ FEATURE 5 — RECOMMENDATION GAP ENGINE

For each missed intent:

* 1 positioning change
* 1 content asset to create
* 1 messaging clarification

No more. No less.

---

## ✅ FEATURE 6 — VISIBILITY SCORE (SIMPLE)

Formula (locked for MVP):

```
visibility_score =
(primary_mentions * 2 + secondary_mentions * 1)
/ total_queries * 100
```

Displayed as:

> “You appear in 7 of 30 high-intent AI answers”

Human-readable > fancy charts.

---

## ✅ FEATURE 7 — DASHBOARD (MVP UI)

### Sections

1. **Visibility Score**
2. **Top Wins**
3. **Top Misses**
4. **Competitor Mentions**
5. **Recommended Fixes**

No filters. No customization.

---

## ✅ FEATURE 8 — WEEKLY EMAIL REPORT (RETENTION)

Auto-send:

* Visibility change (+ / –)
* New competitor appearances
* 3 priority fixes

This is your **retention engine**.

---

## ✅ FEATURE 9 — BILLING (REQUIRED FOR MVP)

Plans:

* Free (5 scans total, no history)
* Indie ($49/mo) — Unlimited scans, 1 project
* Startup ($149/mo) — Unlimited scans, 5 projects

**DodoPayments** (Merchant of Record).
No coupons.
No annual plans initially.

> DodoPayments handles VAT, GST, and sales tax compliance.

---

# 5️⃣ TECH ARCHITECTURE (LEAN & REAL)

> **See:** [tech_stack.md](./tech_stack.md) for full details
> **See:** [architecture.md](./architecture.md) for system design
> **See:** [folder_structure.md](./folder_structure.md) for project layout

## Frontend

* **SvelteKit 2 + Svelte 5** (Runes)
* Simple dashboard (tables > charts)
* Auth-protected routes
* Hosted on **Vercel**

## Backend (Convex)

* **Convex** — Database + Functions + Realtime + Cron
* Queries, Mutations, Actions
* Scheduled functions for weekly reports
* No separate API server needed

Tables:
* users
* projects
* competitors
* intentQueries
* results
* weeklyReports
* subscriptions

## AI Layer

* **OpenAI API** (gpt-4o-mini)
* Fixed prompt templates
* Low temperature (0.3)
* No streaming

## Payments

* **DodoPayments** (Merchant of Record)
* Handles VAT, GST, sales tax
* Webhook-based subscription sync

## Email

* **Resend** for transactional + weekly reports

## Development Tools

* **Bun** — JavaScript runtime
* **pnpm** — Package manager
* **Biome** — Linting + Formatting
* **TypeScript** — Type safety

## Infra

* Convex scheduled functions (cron)
* Built-in queue for async actions
* No external job queue needed

---

# 6️⃣ MVP PROMPT FLOW (LOCK THIS)

For each intent query:

1. Run **Brand Visibility Prompt**
2. If not mentioned → run **Competitor Advantage Prompt**
3. Run **Positioning Fix Prompt**
4. Store results
5. Score visibility

This deterministic flow is critical.

---

# 7️⃣ MVP UX FLOW (END-TO-END)

1. User signs up
2. Creates project
3. Sees “Run first scan” button
4. Waits ~1–3 minutes
5. Sees:

   * Visibility score
   * Missed intents
   * Concrete recommendations
6. Gets weekly email
7. Pays to keep history

That’s it.

---

# 8️⃣ MVP COPY (LEGAL + TRUST)

Everywhere on site:

> “We analyze observable patterns in AI answers.
> We do not influence, control, or manipulate AI systems.”

This protects you **legally and reputationally**.

---

# 9️⃣ MVP SUCCESS METRICS (ONLY THESE)

If these happen, you’re winning:

* ≥ 30% of free users upgrade
* Weekly report open rate > 50%
* Users take recommended actions
* Founders ask: “Can you add X?”

Ignore everything else.

---

# 🔟 BUILD PLAN (15-DAY SPRINT)

> **See:** [execution_plan.md](./execution_plan.md) for day-by-day breakdown

### Day 1-2: Foundation
* Project scaffold (SvelteKit + Convex + Biome)
* Auth flow
* Base layout components

### Day 3-4: Onboarding
* Project creation form
* Competitor management
* 30 intent queries seeded

### Day 5-7: Query Engine (Core)
* OpenAI integration
* 3 prompt templates
* Batch execution
* Result storage + scoring

### Day 8-9: Dashboard
* Visibility score display
* Top wins/misses
* Recommended fixes
* Full results view

### Day 10-11: Billing
* DodoPayments integration
* Pricing tiers (Free, Indie $49, Startup $149)
* Paywall logic

### Day 12-13: Weekly Reports
* Resend email integration
* Report generation
* Convex cron jobs

### Day 14-15: Polish + Launch
* Landing page
* Mobile responsive
* Deploy to production
* **LAUNCH** 🚀

You can ship MVP in **15 days**.

---

# 🚫 FEATURES YOU MUST DELIBERATELY SKIP

* User-defined prompts
* Multi-model comparison
* Real-time tracking
* API access
* Team roles
* Fancy charts
* “AI agents”

Skipping these is what makes you fast.

---

# FINAL FOUNDER ADVICE (IMPORTANT)

This MVP is:

* Narrow
* Honest
* Valuable

That combination **wins early markets**.

Your only job now:

> Build the smallest version that makes a founder say
> “Oh… now I get why we’re losing.”

That sentence = product-market signal.

---

