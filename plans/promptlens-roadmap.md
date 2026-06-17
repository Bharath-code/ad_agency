# Plan: PromptLens Product Roadmap

> Source PRD: `docs/product_strategy_master_plan.md`

## Execution Protocol (one phase per session)

Each phase is delivered on its own branch, then we start a fresh session for the next phase
so context stays clean. Repeat this loop for every phase:

1. **Branch.** Create `feat/phase-<N>-<slug>` (e.g. `feat/phase-2-project-url`) **always off the
   latest `main`** (`git fetch && git checkout -b feat/phase-<N>-<slug> origin/main`). Merge the
   previous phase's PR into `main` *before* starting the next — never stack a phase branch on another
   phase's branch, and always open the PR with base `main`. (Stacking + squash-merge nearly stranded
   Phase 3: chained PR bases left its commit off `main` and produced a conflicting 3-way merge.)
2. **Build.** Implement the phase against its acceptance criteria. Honor the design system and
   conventions in `CLAUDE.md`. Add/extend tests.
3. **Verify.** `npm test` + `npm run check` must be green (0 errors). Preview UI changes locally
   (see CLAUDE.md → "Local Preview Without a Backend").
4. **Push.** Commit (Co-Authored-By trailer), push the branch, open a PR.
5. **Record.** Tick this phase's box below, update CLAUDE.md "Product & Roadmap Status" (move the
   "Next up" pointer), and refresh `.remember/remember.md` (local handoff for the next session).
6. **Reset.** `/clear` (or open a new session) and resume at the next phase.

## Status Tracker

- [x] **Phase 0 — Rename to PromptLens** (Task 1) — branch `feat/promptlens-roadmap`
- [x] **Full UI/UX redesign** — "Editorial Intelligence" design system (landing + entire app shell)
- [x] **Phase 2 — Project URL + primary use case** — branch `feat/phase-2-project-url`
- [x] **Phase 3 — Industry prompt library** — branch `feat/phase-3-prompt-library`
- [x] **Phase 4 — Multi-model confidence** — branch `feat/phase-4-multi-model`
- [ ] **Phase 5 — Evidence viewer** ← NEXT
- [ ] **Phase 6 — Competitor win/loss dashboard**
- [ ] **Phase 7 — Recommendation action queue**
- [ ] **Phase 8 — Weekly report & retention**
- [ ] **Phase 9 — Billing & entitlements** (reconcile the 3-way pricing inconsistency here)
- [ ] **Phase 10 — Agency reports**

> Note: the original numbered "Phase 1: Rename" is done (tracked above as Phase 0 + the redesign).
> Numbering below keeps the original document's phase numbers.

## Architectural Decisions

- **Routes:** Keep `/app/projects`, `/app/projects/new`, and `/app/projects/[id]` as the primary project workflow. Add detail surfaces inside project pages before introducing major route sprawl.
- **Backend:** Continue using Convex queries, mutations, actions, scheduled functions, and indexes.
- **LLM boundary:** Keep all model calls behind a provider router. Frontend never calls model providers directly.
- **Billing:** Keep Dodo Payments as merchant of record and use Convex webhook state for entitlements.
- **Trust model:** Store raw transcripts, metadata, confidence, and scoring inputs for every result.
- **Design:** Build a work-focused intelligence dashboard with restrained visuals, compact data views, strong empty states, and evidence-first drilldowns.

---

## Phase 1: Rename And Reposition

**User stories:** As a visitor, I understand that PromptLens helps me see why AI recommends competitors. As a founder, I immediately know the product is about buyer prompts, not generic AI dashboards.

### What to Build

Rename the product to PromptLens across user-facing surfaces and rewrite the main positioning around competitor recommendation diagnostics.

### Acceptance Criteria

- [ ] Landing page, app shell, README, metadata, and pricing use PromptLens.
- [ ] Hero copy says the product diagnoses why AI recommends competitors.
- [ ] Calls to action use "Run diagnostic" or "Analyze buyer prompts."
- [ ] No user-facing generic "AI Visibility Intelligence" copy remains except category explanation.

---

## Phase 2: Better Project Profile

**User stories:** As a user, I can provide my website and use case so scans are more relevant. As the system, I can generate better prompts and recommendations.

### What to Build

Extend project creation with URL and primary use case, then feed those fields into prompt generation and scan prompts.

### Acceptance Criteria

- [x] Project creation captures product URL and primary use case.
- [x] URL validation prevents unsafe or malformed values.
- [x] Project profile can be edited after creation.
- [x] Prompt templates use product URL and use case where useful.
- [x] Tests cover validation and prompt substitution.

---

## Phase 3: Industry Prompt Library

**User stories:** As a SaaS founder, I get realistic buyer prompts for my market. As a product marketer, I can trust prompts because they map to buyer intent.

### What to Build

Replace generic fixed prompts with a structured prompt library by intent category, industry, use case, buyer role, and funnel stage.

### Acceptance Criteria

- [x] Prompt templates include category and intent stage.
- [x] New projects receive at least 30 relevant prompts.
- [x] Prompt categories cover alternatives, comparisons, best tools, integrations, verticals, pricing, problem-aware, and use-case prompts.
- [x] Prompt generation is deterministic and versioned.
- [x] Unit tests verify prompt count and placeholder replacement.

---

## Phase 4: Multi-Model Confidence

**User stories:** As a user, I can see whether my visibility is consistent across assistants. As a skeptical buyer, I can see confidence and variance.

### What to Build

Run prompts across available providers, store model-level results, and calculate confidence from repeated runs and agreement.

### Acceptance Criteria

- [x] Manual scan supports OpenAI and Claude when configured.
- [x] Result records include model, run count, successful runs, consensus ratio, and confidence.
- [x] Dashboard shows aggregate score and per-model score.
- [x] Partial provider failures are visible but do not fail the entire scan.
- [x] Tests cover consensus, low confidence, and provider failure.

### Deferred follow-ups

- Multi-model is currently scoped to the **visibility verdict**. The competitor "who wins & why"
  reasoning and the positioning-fix generation still run single-provider (router failover, once per
  missed query). Extending those to cross-model consensus is tracked in **Phase 6** below.

---

## Phase 5: Evidence Viewer

**User stories:** As a user, I can inspect raw answers and verify the product's claims. As an agency, I can show clients evidence.

### What to Build

Add a prompt detail view with prompt text, model, raw transcript, parsed recommendation, competitor winner, reasons, confidence, and scan date.

### Acceptance Criteria

- [ ] Every top win and top miss links to prompt evidence.
- [ ] Raw model output renders as text, never HTML.
- [ ] Internal system prompts and API metadata remain hidden.
- [ ] Empty and error states are polished.
- [ ] Evidence view works on mobile and desktop.

---

## Phase 6: Competitor Win/Loss Dashboard

**User stories:** As a founder, I can see which competitors repeatedly win and why. As a marketer, I can prioritize the biggest positioning gaps.

### What to Build

Create a competitor analysis section that groups missed prompts by winning competitor and repeated reason themes.

### Acceptance Criteria

- [ ] Dashboard shows competitor win counts from latest scan.
- [ ] Each competitor includes representative prompts.
- [ ] Repeated reasons are grouped and deduplicated.
- [ ] User can drill into evidence for each reason.
- [ ] Empty state explains what happens after a scan.
- [ ] Competitor "who wins & why" reasoning runs cross-model (consensus winner + reasons across
      configured providers, reusing the Phase 4 `convex/lib/consensus.ts` aggregation), so reason
      themes reflect agreement rather than a single provider. *(Carried over from Phase 4.)*

---

## Phase 7: Recommendation Action Queue

**User stories:** As a user, I can turn missed prompts into a concrete plan. As a team, we can track what we shipped and whether it worked.

### What to Build

Create action items from missed prompts and let users track them from recommendation to shipped fix.

### Acceptance Criteria

- [ ] Each missed prompt can create positioning, content, proof, comparison, or source/citation action items.
- [ ] Actions have planned, shipped, ignored, and archived statuses.
- [ ] Actions link to prompt evidence.
- [ ] Dashboard highlights top 3 priority actions.
- [ ] After re-scan, shipped actions show before/after prompt movement.

---

## Phase 8: Weekly Report And Retention

**User stories:** As a paid user, I receive a weekly summary without logging in. As a founder, I know what changed and what to do next.

### What to Build

Generate and send weekly reports for paid users with score change, new competitor wins, and top recommended actions.

### Acceptance Criteria

- [ ] Paid users receive weekly reports.
- [ ] Free users do not receive paid-plan recurring reports.
- [ ] Report generation works without sending email in tests.
- [ ] Email includes dashboard links and top 3 fixes.
- [ ] Send status and errors are stored.

---

## Phase 9: Billing And Entitlements

**User stories:** As a business, we can charge for value. As a user, I understand what is included in my plan.

### What to Build

Finalize plan limits, upgrade prompts, webhook handling, and gated features.

### Acceptance Criteria

- [ ] Free diagnostic is capped.
- [ ] Paid plans unlock recurring scans and transcripts.
- [ ] Agency plan unlocks multi-project workflows.
- [ ] Webhook signature verification and idempotency are tested.
- [ ] UI clearly explains plan limits before blocking actions.

---

## Phase 10: Agency Reports

**User stories:** As an agency, I can package PromptLens insights into client-ready reports. As a client, I can understand wins, losses, and next actions.

### What to Build

Add multi-client reporting, share links, and exportable reports.

### Acceptance Criteria

- [ ] Agency users can manage multiple client projects.
- [ ] Reports include score, competitor wins, evidence, and actions.
- [ ] Client-safe share links hide internal debug data.
- [ ] White-label exports are available on agency plan.
- [ ] Report access is permission-checked.

