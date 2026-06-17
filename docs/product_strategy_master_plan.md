# Product Strategy Master Plan

*Last updated: 2026-06-16*

## Executive Verdict

This product is worth pursuing, but the category is already competitive. The winning path is not to be another generic AI visibility score tool. The winning path is to become the most trusted **AI recommendation diagnostics platform** for B2B SaaS teams: the product that shows exactly which buyer prompts recommend competitors, why they win, and what content or positioning change should be shipped next.

The current codebase already has a credible MVP foundation: SvelteKit, Convex, project setup, competitors, fixed intent queries, scan execution, multi-provider LLM abstraction, dashboard summaries, billing primitives, and weekly report primitives. The next phase should focus on trust, accuracy, repeatability, and a sharper product wedge.

## New Product Name

### Recommended Name: PromptLens

**Why this name works:**

- It is specific to the new behavior: buyers use prompts, and companies need a lens into what AI answers say.
- It avoids generic "AI visibility" naming.
- It can expand beyond SaaS later without being locked into ads, SEO, or agencies.
- It sounds like an intelligence product, not a gimmick.

### Positioning Line

**PromptLens shows B2B teams why AI assistants recommend competitors instead of them, then gives the exact content and positioning fixes to win those buyer prompts.**

### Short Taglines

- See why AI recommends them, not you.
- Win the prompts your buyers ask.
- The competitor intelligence layer for AI answers.
- Turn AI search losses into content and positioning actions.

### Names To Avoid

- RivalEye: good for competitor monitoring, but less specific to AI search and prompts.
- AI Visibility Intelligence: descriptive but generic.
- GEO Tracker: too SEO-jargon heavy and likely to commoditize.
- ChatRank: too narrow and may create platform/trademark risk.

## Market Category

PromptLens sits between:

- AI search visibility monitoring
- Generative engine optimization
- SEO/content intelligence
- Competitive positioning intelligence
- Product marketing research

The category is validated. Search results and market lists now mention many AI visibility tools, including Peec AI, Profound, Scrunch AI, OtterlyAI, AthenaHQ, RankScale, LLM Refs, Semrush AI Visibility Toolkit, SE Ranking AI Visibility Tracker, and Ahrefs Brand Radar. This means the opportunity is real, but a simple "track your AI visibility" dashboard is becoming a commodity.

## Market Positioning

### Category Narrative

Old world:

- Buyers searched Google.
- Companies measured rankings, clicks, and conversions.
- SEO teams optimized pages around keywords.

New world:

- Buyers ask ChatGPT, Claude, Gemini, and Perplexity.
- AI assistants summarize the market and recommend vendors.
- Companies have little visibility into whether they appear, which competitors win, and why.

PromptLens should own this belief:

> AI recommendations are becoming a new buyer discovery channel. Companies need diagnostics, not vanity scores.

### Differentiated Position

Most competitors sell "AI visibility tracking."

PromptLens sells **AI recommendation diagnostics**:

- Which buyer prompts matter?
- Which prompts do you win?
- Which prompts do competitors win?
- Why does the answer prefer them?
- What proof, messaging, content, or positioning is missing?
- Did your fix improve outcomes over time?

## Ideal Customer Profile

### Primary ICP

**B2B SaaS companies with founder-led or lean marketing teams**

- Stage: bootstrapped, seed, Series A
- Revenue: $5k-$500k MRR
- Team size: 2-100
- Buyer: founder, CEO, head of growth, product marketer, content lead
- Pain: "AI tools mention competitors more than us."
- Budget: $99-$499/mo for software, $500-$5k for one-time audit or advisory

### Secondary ICP

**SEO/content agencies and fractional CMOs**

- They manage many clients.
- They need repeatable reports.
- They can resell AI visibility audits.
- They have stronger willingness to pay for multi-project workflows.

### Later ICP

**Enterprise brand and demand-gen teams**

- Larger budgets.
- Higher compliance requirements.
- Need SSO, audit logs, team permissions, benchmarks, and API access.

## Competitors

### Direct Competitors

| Competitor | Position | Likely Strength | Weakness PromptLens Can Exploit |
|---|---|---|---|
| Peec AI | AI search visibility platform | Category awareness, dashboards, broad tracking | Can be beaten with deeper SaaS-specific diagnosis and action quality |
| Profound | Enterprise AI visibility/answer intelligence | Enterprise credibility, broad platform story | Likely expensive and less founder-friendly |
| OtterlyAI | AI search monitoring | Accessible monitoring and tracking | Less differentiated if focused on reporting over diagnosis |
| Scrunch AI | AI search/GEO platform | GEO-focused messaging and optimization | May feel SEO-heavy rather than product-marketing sharp |
| AthenaHQ | AI visibility / GEO | Emerging category player | Opportunity to out-position with buyer-prompt diagnostics |
| RankScale | AI visibility tracking | SEO audience familiarity | May be score/rank heavy |
| LLM Refs / LLM Pulse / Goodie AI | LLM mention tracking | Narrow tracking utility | Can be outflanked with recommendations, trust layer, and workflows |

### Major Platform Threats

| Competitor | Threat |
|---|---|
| Ahrefs Brand Radar | Strong SEO brand, existing customer base, distribution, data assets |
| Semrush AI Toolkit | Existing SEO budgets and enterprise relationships |
| SE Ranking AI Visibility Tracker | SEO suite bundling pressure |
| Google Search Console / Bing Webmaster Tools | Could eventually expose AI answer visibility directly |
| OpenAI / Anthropic / Perplexity business tools | Could expose brand analytics or answer insights natively |

### Indirect Competitors

- Manual ChatGPT checks by founders.
- SEO agencies doing AI visibility audits in spreadsheets.
- Content strategy consultants.
- Traditional SEO tools.
- Brand monitoring tools.
- Product marketing research tools.

## Differentiation Strategy

### Core Differentiator

**PromptLens does not only tell you whether you appear. It tells you why you lost and what to ship next.**

### Product Differentiators

- Buyer-prompt library by industry and use case.
- Multi-run confidence scoring.
- Cross-model consensus scoring.
- Competitor reason extraction.
- Evidence-backed recommendations with raw transcripts.
- Content/action workflow from missed prompt to shipped fix.
- Before/after impact tracking by prompt.
- Agency-ready multi-client reporting.

### Trust Differentiators

- No claims of "guaranteed rankings."
- Show raw AI responses.
- Show confidence level and variance.
- Show model, date, prompt, geography, and run count.
- Explain scoring methodology publicly.
- Track changes over time instead of pretending one answer is truth.

## Product Principles

1. **Diagnostics over dashboards.** Every screen should help the user decide what to do next.
2. **Evidence before advice.** Every recommendation should connect to prompts, model outputs, competitor mentions, or source gaps.
3. **Confidence is part of the product.** Show uncertainty instead of hiding it.
4. **Founder-simple, expert-deep.** A founder should understand the report in 2 minutes; a marketer should trust the details.
5. **No false promises.** Say "improve your odds of being recommended," not "rank #1 in ChatGPT."

## Feature Roadmap

### MVP v1: Trustworthy Prompt Diagnostics

Goal: A founder can answer: "Which AI buyer prompts recommend my competitors, why, and what should I fix first?"

Features:

- Project onboarding: product, description, industry, competitors, URL.
- Industry-specific buyer prompt generation.
- Fixed prompt set with categories: best tools, alternatives, comparison, use case, pricing, integration, vertical, problem-aware.
- Manual scan across at least OpenAI and Claude.
- Multi-run consensus per prompt.
- Visibility score with confidence.
- Prompt-level transcript viewer.
- Competitor win/loss summary.
- Recommended fixes per missed prompt.
- Weekly email report.
- Billing gate.

### v1.5: Action Workflow

Goal: Move from insight to execution.

Features:

- Prioritized action queue.
- Suggested content briefs for missed prompts.
- Messaging fixes for homepage/product pages.
- Mark action as planned, shipped, ignored.
- Re-scan after action.
- Before/after impact view.
- CSV export.

### v2: Agency And Multi-Client

Goal: Make agencies the growth channel.

Features:

- Multiple workspaces.
- Client reporting.
- White-label PDF exports.
- Scheduled reports.
- Team roles.
- Client share links.
- Bulk project creation.

### v3: Benchmarks And Moat

Goal: Build a proprietary dataset.

Features:

- Industry benchmarks.
- Prompt benchmark index.
- Share of AI recommendation by category.
- Trend detection.
- Source/citation analysis.
- API access.
- Enterprise controls.

## Implementation Tasks With Acceptance Criteria

### Task 1: Rename Product To PromptLens

**Goal:** Replace user-facing RivalEye / AI Visibility Intelligence language with PromptLens and sharper positioning.

Acceptance criteria:

- Landing page hero uses PromptLens as the product name.
- Navbar, footer, metadata, README, and pricing copy use PromptLens.
- Copy clearly says "why AI recommends competitors instead of you."
- No user-facing "ad_agency" or generic "AI Visibility Intelligence" remains unless used as category description.

### Task 2: Add Product URL And Source Context To Project Setup

**Goal:** Make analysis more accurate by giving the system the customer website.

Acceptance criteria:

- Project creation accepts product URL.
- URL is validated and stored.
- Scan prompts include product URL when available.
- UI explains that URL improves diagnosis quality.
- Tests cover invalid URL and valid URL cases.

### Task 3: Build Industry-Specific Prompt Library

**Goal:** Improve relevance beyond generic 30 prompts.

Acceptance criteria:

- Prompt templates are grouped by industry, buyer role, and intent category.
- New projects receive prompts based on industry and primary use case.
- At least 8 categories exist: best tools, alternatives, comparison, use-case, vertical, integration, pricing, problem-aware.
- Every generated prompt avoids keyword stuffing and sounds like a real buyer question.
- Unit tests verify placeholder substitution and prompt count.

### Task 4: Add Cross-Model Scans

**Goal:** Measure visibility across multiple assistant ecosystems.

Acceptance criteria:

- User can scan OpenAI and Claude if both keys exist.
- Results store model name for every prompt result.
- Dashboard can show aggregate score and per-model score.
- If one provider fails, the scan continues and marks confidence lower.
- Tests cover provider failure and partial completion.

### Task 5: Improve Confidence And Variance Scoring

**Goal:** Make scores trustworthy.

Acceptance criteria:

- Each prompt result stores run count, successful run count, consensus ratio, and confidence.
- Dashboard shows "high/medium/low confidence" beside score.
- Low-confidence prompts are clearly flagged for review.
- Score calculation excludes failed runs but reports failure rate.
- Tests cover high consensus, split consensus, and failed runs.

### Task 6: Add Raw Transcript Viewer

**Goal:** Let users verify claims.

Acceptance criteria:

- Prompt detail shows original prompt, model, date, raw response, parsed result, and confidence.
- Transcript view is accessible from every top win/top miss.
- No raw transcript is editable by the user.
- Sensitive API/system prompt content is never exposed.

### Task 7: Build Competitor Win/Loss Page

**Goal:** Make the product's main value obvious.

Acceptance criteria:

- Project page includes a "Competitor Wins" section.
- For each competitor, show number of prompts they won, representative prompts, and repeated reasons.
- Repeated reasons are grouped into themes.
- User can drill into prompt evidence.
- Empty state appears when no competitors are detected.

### Task 8: Build Recommendation Action Queue

**Goal:** Convert analysis into execution.

Acceptance criteria:

- Missed prompts generate an action item with type: positioning, content, proof, comparison, source/citation.
- User can mark actions as planned, shipped, ignored.
- Actions link back to the prompt evidence.
- Dashboard shows top 3 priority actions.
- Re-scan can compare before/after for shipped actions.

### Task 9: Weekly Email Report

**Goal:** Improve retention.

Acceptance criteria:

- Paid users receive weekly reports.
- Email includes score change, new competitor wins, top 3 fixes, and link to dashboard.
- Free users do not receive recurring paid-plan reports.
- Email send status is stored.
- Tests cover report generation without sending real email.

### Task 10: Billing And Entitlements

**Goal:** Charge money safely.

Acceptance criteria:

- Free plan: 1 project, 1 full scan or limited sample scan.
- Starter plan: 1 project, weekly scans, transcript access.
- Growth plan: 5 projects, multi-model scans, exports, weekly reports.
- Agency plan: 25 projects, client reports, white-label export.
- UI blocks gated features with upgrade prompts.
- Webhook handling is idempotent.

### Task 11: Agency Reporting

**Goal:** Build a higher-ARPU channel.

Acceptance criteria:

- Agency users can create multiple client projects.
- Reports can be exported as PDF or share link.
- Report includes client-safe explanations, not internal debug data.
- White-label option hides PromptLens branding on agency plan.

### Task 12: Security Baseline

**Goal:** Make the product production-safe.

Acceptance criteria:

- All project and result queries verify ownership.
- Webhook events are idempotent and signature verified.
- User input length limits exist for product, competitors, URL, and descriptions.
- No secrets are exposed to frontend code.
- Raw LLM output is rendered as text, not HTML.
- Rate limits or cooldowns protect scans.
- Security headers/CSP are configured at deploy layer or documented.

### Task 13: Performance Baseline

**Goal:** Keep scans and dashboard usable as data grows.

Acceptance criteria:

- Dashboard queries read only latest scan by indexed access.
- Long scans provide progress state or clear loading state.
- Scan jobs tolerate partial provider failures.
- UI has skeleton states, empty states, and error states.
- Bundle size and main route performance are checked before launch.

## Accuracy And Relevance Strategy

Accuracy is the product. If users do not trust the results, they will churn.

### Improve Accuracy

- Run each prompt multiple times and calculate consensus.
- Use multiple models and show model-specific variance.
- Store every raw response.
- Use structured JSON parsing with schema validation.
- Separate "mentioned" from "recommended." A brand can be mentioned but not recommended.
- Track position: primary, secondary, passing mention, absent.
- Add a "competitor won because" classifier with evidence snippets.
- Add confidence score based on run completion and agreement.
- Keep prompts stable for trend tracking.
- Version prompt templates so score changes can be interpreted.

### Improve Relevance

- Generate prompts from industry, use case, buyer role, company size, and competitors.
- Allow users to approve/edit prompt set after MVP.
- Add prompt categories mapped to funnel stage.
- Add region/language settings later.
- Add source/citation monitoring for Perplexity/Gemini-like answers.
- Build category benchmark data from aggregated anonymized results.

### Make It Trustable

- Public methodology page.
- Raw transcript access.
- Confidence levels.
- Prompt history.
- Model/date/run metadata.
- Clear disclaimers: "AI answers vary; PromptLens measures observed recommendation patterns."
- Avoid fake precision.
- Show "what changed since last scan."
- Let customers export evidence.

## Revenue Potential

### Pricing Strategy

Recommended launch pricing:

| Plan | Price | Target | Includes |
|---|---:|---|---|
| Free Diagnostic | $0 | Lead capture | 1 limited scan, 5 prompts, no history |
| Starter | $99/mo | Solo SaaS founder | 1 project, 30 prompts, weekly scan, transcripts |
| Growth | $249/mo | SaaS growth team | 5 projects, 75 prompts/project, multi-model, reports |
| Agency | $799/mo | Agencies/fractional CMOs | 25 projects, client reporting, exports |
| One-Time Audit | $499-$2,500 | Cash-flow validation | Manual AI visibility report and strategy call |

Do not start too cheap. A $49 plan may attract curiosity users who churn. The value is tied to revenue risk: one recovered buyer-intent channel can be worth far more than $99/mo.

### Unit Economics

Estimated COGS per active project:

- LLM calls: $1-$15/month depending on model count, prompts, run count.
- Convex/storage: low at MVP scale.
- Email: low.
- Support: highest hidden cost early.

Target gross margin:

- Starter: 85%-95%.
- Growth: 90%+.
- Agency: 90%+ if scans are capped and scheduled.

### Revenue Scenarios

| Scenario | Customers | ARPA | MRR | Notes |
|---|---:|---:|---:|---|
| Early validation | 10 | $250 | $2,500 | Mix of audits and SaaS |
| Bootstrap traction | 50 | $150 | $7,500 | Founder-led content and outbound |
| Real business | 150 | $220 | $33,000 | Agencies and growth teams added |
| Strong niche SaaS | 500 | $280 | $140,000 | Requires channel and retention engine |

### Financial Risks

- Churn after curiosity scan.
- SEO suites bundle similar feature.
- LLM costs rise with multi-run/multi-model scans.
- Support load grows if recommendations are vague.
- Enterprise sales cycles are slow.

### Financial Mitigations

- Sell audits first to validate willingness to pay.
- Use scan caps and scheduled runs.
- Push agency plan early for higher ARPA.
- Make reports recurring and action-oriented.
- Build before/after ROI tracking.

## GTM Strategy

### Phase 1: Manual Revenue Validation

Goal: 10 paid audits in 30 days.

Offer:

> "I will run 30 buyer prompts across ChatGPT and Claude, show which competitors win, and give you a prioritized 10-item content/positioning action plan."

Price:

- First 3 customers: $299.
- Next 7 customers: $499-$999.
- Agencies: $1,500+ for multi-client package.

Channels:

- Founder DMs.
- LinkedIn teardown posts.
- X/Twitter public audits.
- SaaS communities.
- VC portfolio intros.
- SEO/content agencies.

### Phase 2: Productized Beta

Goal: 25 recurring customers.

Tactics:

- Free limited scan as lead magnet.
- "Your AI Competitor Report" landing page.
- Case studies from manual audits.
- Weekly benchmark posts.
- Founder-led content showing real prompt battles.

### Phase 3: Agency Channel

Goal: 10 agencies on $799/mo+.

Tactics:

- White-label reports.
- Agency partner kit.
- Revenue share.
- "AI visibility audit in a box."
- Client-ready PDFs.

### Content Strategy

High-intent content:

- "Why ChatGPT recommends your competitors"
- "How to improve AI visibility for SaaS"
- "Best AI visibility tracking tools"
- "Generative engine optimization for B2B SaaS"
- "[Competitor] alternative for AI visibility diagnostics"
- "AI visibility audit template"

Founder-led social formats:

- "I asked ChatGPT the top 20 buyer prompts in [category]. Here is who won."
- "Your competitor is not better. Their positioning is clearer."
- "Most SaaS websites fail AI recommendations for 3 boring reasons."
- "We scanned 100 SaaS companies. Only X appeared consistently."

## Product-Led Growth Loops

- Free scan creates shareable score.
- Reports include "scan another competitor."
- Agencies invite clients to view reports.
- Weekly changes bring users back.
- Public benchmark reports drive inbound.
- Action queue creates repeat usage after every scan.

## World-Class UI/UX Direction

### Product Feel

PromptLens should feel like a premium intelligence cockpit, not a marketing toy.

Design attributes:

- Quiet, precise, trustworthy.
- Dense enough for real work.
- Strong information hierarchy.
- Minimal decoration.
- Evidence-forward.
- Fast, calm, and readable.

### Visual System

Recommended palette:

- Background: warm off-white or zinc-50.
- Text: zinc-950 / slate-900.
- Borders: zinc-200.
- Accent: deep teal, emerald, or restrained amber.
- Avoid dominant purple/blue AI gradients.
- Avoid excessive orange/brown/beige.

Typography:

- Use high-quality sans-serif.
- Dashboard numbers can use mono.
- Do not use oversized hero type inside app surfaces.

Component principles:

- Cards only for repeated items and framed tools.
- Use tables, divided lists, tabs, and compact panels for dashboards.
- Every chart must answer a decision question.
- Every empty state should drive the next action.
- Every loading state should match the final layout.
- Icons should come from lucide-svelte.

### Core Screens

1. **Dashboard**
   - Visibility score with confidence.
   - Prompt wins/losses.
   - Competitor win table.
   - Top recommended actions.
   - Last scan metadata.

2. **Prompt Battle Detail**
   - Prompt.
   - Models scanned.
   - Who won.
   - Raw transcripts.
   - Evidence snippets.
   - Why they won.
   - Recommended action.

3. **Action Queue**
   - Prioritized fixes.
   - Action type.
   - Expected impact.
   - Status.
   - Re-scan after shipped.

4. **Reports**
   - Weekly summary.
   - Client-safe version.
   - Export/share.

5. **Settings**
   - Product profile.
   - Competitors.
   - Prompt library.
   - Billing.

## Architecture Recommendations

### Keep

- SvelteKit frontend.
- Convex backend.
- Convex scheduled functions.
- Provider router abstraction.
- Dodo Payments for merchant-of-record simplicity.
- Resend for reports.

### Improve

- Add versioned prompt templates.
- Add run metadata to result schema.
- Add source URL and project URL.
- Add action items table.
- Add prompt sets table or prompt template version field.
- Add scan status/progress table for long-running scans.
- Add organization/workspace model before agency plan.
- Add event audit table for billing/security-sensitive actions.

### Suggested Data Model Additions

- `project.url`
- `project.primaryUseCase`
- `intentQueries.templateVersion`
- `intentQueries.intentStage`
- `results.runCount`
- `results.successfulRuns`
- `results.consensusRatio`
- `results.model`
- `results.modelResponseId`
- `results.promptVersion`
- `actions`
- `scanRuns`
- `organizations`
- `memberships`

## Code Quality Priorities

- Remove duplicated scan logic between manual and scheduled scans.
- Centralize score calculation.
- Add schema validation for LLM JSON responses.
- Add tests for prompt generation, scoring, billing limits, webhook idempotency, and provider failure.
- Add typed domain objects for scan results.
- Add stable error types for scan limit, provider failure, unauthorized, billing required.
- Avoid exposing internal errors to users.
- Keep UI state predictable and route-based where possible.

## Security Priorities

- Verify ownership on every project, competitor, query, result, action, and report access.
- Never expose API keys or provider prompts to frontend.
- Validate Dodo webhook signatures and event idempotency.
- Render raw LLM output as text, never HTML.
- Apply strict input length limits.
- Rate limit/cooldown scans by project and user plan.
- Add audit logging for billing and data export actions.
- Confirm CSP/security headers in hosting configuration.
- Add abuse prevention for free scans.

## Success Metrics

### Product Metrics

- Activation: user creates project and completes first scan.
- Time to first insight: under 3 minutes after scan starts, or clear async completion.
- Prompt evidence opened per scan.
- Actions created per scan.
- Actions marked shipped.
- Re-scan rate.

### Business Metrics

- Free scan to paid conversion.
- Audit close rate.
- MRR.
- ARPA.
- Gross margin.
- Logo churn.
- Net revenue retention.
- Agency partners activated.

### Trust Metrics

- Percent of results with high confidence.
- Provider failure rate.
- Parse failure rate.
- User-disputed recommendations.
- Transcript views.
- Re-scan variance by prompt.

## 30/60/90 Day Plan

### First 30 Days

- Rename to PromptLens.
- Improve landing page positioning.
- Add project URL and primary use case.
- Improve prompt library.
- Add transcript viewer.
- Sell 10 manual audits.
- Interview every audit buyer.

### Days 31-60

- Add multi-model score breakdown.
- Add action queue.
- Add weekly reports.
- Launch paid beta.
- Publish 3 teardown-style case studies.
- Recruit 3 agency partners.

### Days 61-90

- Add agency reporting.
- Add shareable reports.
- Add before/after action tracking.
- Publish benchmark report.
- Raise prices if conversion is healthy.
- Decide whether to bootstrap, agency-led, or raise capital.

## Final Strategic Recommendation

Build PromptLens as a trust-first, evidence-backed AI recommendation diagnostics product. Do not compete on generic tracking. Compete on the quality of diagnosis, the usefulness of fixes, and the credibility of the methodology.

The fastest path to money is paid audits plus a productized SaaS beta. The highest-leverage long-term path is agency distribution plus proprietary prompt/answer benchmark data.

