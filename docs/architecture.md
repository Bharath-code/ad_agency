# System Architecture — AI Visibility Intelligence

> High-level architecture and system design

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  SvelteKit App                                                       │    │
│  │  - Landing Page (public)                                             │    │
│  │  - Dashboard (authenticated)                                         │    │
│  │  - Billing Portal                                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONVEX BACKEND                                  │
│                                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │    QUERIES    │  │   MUTATIONS   │  │    ACTIONS    │                   │
│  │  (Read-only)  │  │   (Write)     │  │  (External)   │                   │
│  │               │  │               │  │               │                   │
│  │ - getProject  │  │ - createProj  │  │ - runScan     │                   │
│  │ - getResults  │  │ - updateProj  │  │ - sendEmail   │                   │
│  │ - getScore    │  │ - saveResult  │  │ - processPayment                  │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
│           │                 │                 │                             │
│           └─────────────────┼─────────────────┘                             │
│                             ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DATABASE                                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  users   │ │ projects │ │ queries  │ │ results  │ │ subs     │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SCHEDULED FUNCTIONS (CRON)                        │   │
│  │  - weeklyReportJob (every Monday 9am)                                │   │
│  │  - autoScanJob (weekly for paid users)                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │    OpenAI     │  │  DodoPayments │  │    Resend     │                   │
│  │               │  │               │  │               │                   │
│  │ gpt-4o-mini   │  │ Subscriptions │  │ Weekly emails │                   │
│  │ Brand detect  │  │ Webhooks      │  │ Transactional │                   │
│  │ Gap analysis  │  │               │  │               │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## LLM Provider Abstraction Layer (Risk Mitigation)

To reduce OpenAI dependency, all LLM calls go through an abstraction layer.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LLM PROVIDER ABSTRACTION                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        LLMProvider Interface                         │    │
│  │  - analyze(prompt): Promise<Result>                                  │    │
│  │  - getHealth(): ProviderStatus                                       │    │
│  │  - getCostEstimate(): number                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│              ┌─────────────────────┼─────────────────────┐                  │
│              ▼                     ▼                     ▼                  │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │   OpenAI Provider │ │   Claude Provider │ │   Gemini Provider │         │
│  │   (PRIMARY)       │ │   (FALLBACK #1)   │ │   (FALLBACK #2)   │         │
│  │                   │ │                   │ │                   │         │
│  │   gpt-4o-mini     │ │   claude-3-haiku  │ │   gemini-1.5-flash│         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Provider Router                                 │    │
│  │  - Automatic failover on error                                       │    │
│  │  - Cost-based routing (optional)                                     │    │
│  │  - Health check monitoring                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Provider Interface (TypeScript)

```typescript
// convex/lib/llm/types.ts

export interface LLMProvider {
  name: string;
  analyze(prompt: AnalysisPrompt): Promise<AnalysisResult>;
  isHealthy(): Promise<boolean>;
  costPerCall: number; // Estimated cost in USD
}

export interface AnalysisPrompt {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AnalysisResult {
  content: string;
  provider: string;
  latencyMs: number;
  tokenUsage: { input: number; output: number };
}

export type ProviderName = "openai" | "claude" | "gemini";
```

### Multi-Run Confidence (LLM Variance Mitigation)

```typescript
// convex/lib/llm/confidence.ts

export async function analyzeWithConfidence(
  provider: LLMProvider,
  prompt: AnalysisPrompt,
  runs: number = 3
): Promise<ConfidenceResult> {
  const results = await Promise.all(
    Array(runs).fill(null).map(() => 
      provider.analyze({ ...prompt, temperature: 0.3 })
    )
  );
  
  const parsed = results.map(r => parseAnalysisJSON(r.content));
  
  return {
    mentioned: majorityVote(parsed.map(p => p.mentioned)),
    position: mostFrequent(parsed.map(p => p.position)),
    confidence: calculateAgreement(parsed),
    rawResults: parsed,
  };
}

function calculateAgreement(results: ParsedResult[]): "high" | "medium" | "low" {
  const mentionedAgree = results.every(r => r.mentioned === results[0].mentioned);
  const positionAgree = results.every(r => r.position === results[0].position);
  
  if (mentionedAgree && positionAgree) return "high";
  if (mentionedAgree || positionAgree) return "medium";
  return "low";
}
```

### Provider Router with Failover

```typescript
// convex/lib/llm/router.ts

export class ProviderRouter {
  private providers: LLMProvider[];
  private primaryIndex = 0;
  
  constructor(providers: LLMProvider[]) {
    this.providers = providers;
  }
  
  async analyze(prompt: AnalysisPrompt): Promise<AnalysisResult> {
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[(this.primaryIndex + i) % this.providers.length];
      
      try {
        if (await provider.isHealthy()) {
          return await provider.analyze(prompt);
        }
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
        // Try next provider
      }
    }
    
    throw new Error("All LLM providers are unavailable");
  }
}
```

### Response Caching

```typescript
// convex/lib/llm/cache.ts

// Cache identical prompts for 7 days to reduce costs and variance
export async function getCachedOrFresh(
  ctx: ActionCtx,
  prompt: AnalysisPrompt,
  provider: LLMProvider
): Promise<AnalysisResult> {
  const cacheKey = hashPrompt(prompt);
  
  const cached = await ctx.runQuery(internal.cache.get, { key: cacheKey });
  if (cached && !isExpired(cached, 7 * 24 * 60 * 60 * 1000)) {
    return cached.result;
  }
  
  const result = await provider.analyze(prompt);
  
  await ctx.runMutation(internal.cache.set, {
    key: cacheKey,
    result,
    createdAt: Date.now(),
  });
  
  return result;
}
```

---

## Data Flow

### 1. User Creates Project

```
User Input                Convex Mutation              Database
┌──────────┐             ┌──────────────┐            ┌──────────┐
│ Product  │────────────▶│ createProject│───────────▶│ projects │
│ Name     │             │              │            │          │
│ Industry │             │ Seeds 30     │───────────▶│ queries  │
│ Competitors            │ intent       │            │          │
└──────────┘             │ queries      │            └──────────┘
                         └──────────────┘
```

### 2. Run Scan (Core Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SCAN EXECUTION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

User clicks "Run Scan"
         │
         ▼
┌─────────────────┐
│ Convex Action:  │
│ runScan()       │
└─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  FOR EACH of 30 Intent Queries:                                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  STEP 1: Brand Visibility Prompt                                     │    │
│  │  ────────────────────────────────────                                │    │
│  │  Input:  Intent query + Brand name                                   │    │
│  │  Output: { mentioned: bool, position: enum, context: string }        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                               │                                              │
│                               ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  STEP 2: Competitor Advantage Prompt (if not mentioned)              │    │
│  │  ───────────────────────────────────────────────────                 │    │
│  │  Input:  Intent query + Competitor list                              │    │
│  │  Output: { winner: string, reasons: string[3] }                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                               │                                              │
│                               ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  STEP 3: Positioning Fix Prompt                                      │    │
│  │  ──────────────────────────────                                      │    │
│  │  Input:  Gap analysis context                                        │    │
│  │  Output: { positioning: string, content: string, messaging: string } │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                               │                                              │
│                               ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Save to `results` table                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Calculate       │
│ Visibility Score│
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard       │
│ Updates (live)  │
└─────────────────┘
```

### 3. Weekly Report Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Cron Job    │─────▶│ Generate    │─────▶│ Resend API  │─────▶│ User Inbox  │
│ Monday 9am  │      │ Report HTML │      │ Send Email  │      │             │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

### 4. Payment Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ User clicks │─────▶│ DodoPay     │─────▶│ Webhook     │─────▶│ Update      │
│ "Upgrade"   │      │ Checkout    │      │ Received    │      │ Subscription│
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

---

## Database Schema (Convex)

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("indie"), v.literal("startup")),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Projects table
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    industry: v.string(),
    createdAt: v.number(),
    lastScanAt: v.optional(v.number()),
    visibilityScore: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Competitors table
  competitors: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    url: v.optional(v.string()),
  }).index("by_project", ["projectId"]),

  // Intent Queries table (30 fixed queries per project)
  intentQueries: defineTable({
    projectId: v.id("projects"),
    query: v.string(),
    category: v.string(), // "best_tools", "alternatives", "comparisons", etc.
    isActive: v.boolean(),
  }).index("by_project", ["projectId"]),

  // Scan Results table
  results: defineTable({
    projectId: v.id("projects"),
    queryId: v.id("intentQueries"),
    scanId: v.string(), // Groups results from same scan
    
    // Visibility data
    mentioned: v.boolean(),
    position: v.union(
      v.literal("primary"),
      v.literal("secondary"),
      v.literal("not_mentioned")
    ),
    context: v.string(),
    confidence: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    
    // Competitor data
    competitorMentioned: v.optional(v.string()),
    competitorReasons: v.optional(v.array(v.string())),
    
    // Recommendations
    positioningFix: v.optional(v.string()),
    contentSuggestion: v.optional(v.string()),
    messagingFix: v.optional(v.string()),
    
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_scan", ["scanId"]),

  // Weekly Reports table
  weeklyReports: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    
    previousScore: v.number(),
    currentScore: v.number(),
    scoreChange: v.number(),
    
    newCompetitorMentions: v.array(v.string()),
    topFixes: v.array(v.string()),
    
    emailSentAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // Subscriptions table
  subscriptions: defineTable({
    userId: v.id("users"),
    dodoSubscriptionId: v.string(),
    plan: v.union(v.literal("indie"), v.literal("startup")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due")
    ),
    currentPeriodEnd: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

---

## API Design (Convex Functions)

### Queries (Read-only)

| Function | Input | Output |
|----------|-------|--------|
| `projects.list` | userId | Project[] |
| `projects.get` | projectId | Project with score |
| `results.getLatest` | projectId | Latest scan results |
| `results.getHistory` | projectId, limit | Historical scans |
| `dashboard.getSummary` | projectId | Dashboard data |

### Mutations (Write)

| Function | Input | Output |
|----------|-------|--------|
| `projects.create` | name, desc, industry, competitors | projectId |
| `projects.update` | projectId, updates | success |
| `projects.delete` | projectId | success |
| `competitors.add` | projectId, name | competitorId |

### Actions (External calls)

| Function | Purpose |
|----------|---------|
| `scans.run` | Execute 30-query scan via OpenAI |
| `email.sendWeeklyReport` | Send via Resend |
| `payments.createCheckout` | Create DodoPayments session |
| `payments.handleWebhook` | Process DodoPayments webhook |

### Scheduled Functions

| Function | Schedule | Purpose |
|----------|----------|---------|
| `cron.weeklyScans` | Monday 6am UTC | Auto-scan for paid users |
| `cron.weeklyReports` | Monday 9am UTC | Generate and send reports |

---

## Security Model

### Authentication
- Convex Auth handles user sessions
- JWT-based, server-validated

### Authorization
- Row-level security via Convex function guards
- Users can only access their own projects

```typescript
// Example guard pattern
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const project = await ctx.db.get(args.projectId);
    if (project?.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    return project;
  },
});
```

### Rate Limiting
- Free tier: 5 queries max
- Enforced in `scans.run` action

---

## Error Handling

| Error Type | Handling |
|------------|----------|
| OpenAI timeout | Retry with exponential backoff (3 attempts) |
| OpenAI rate limit | Queue and retry after delay |
| Payment failure | Show error, offer retry |
| Email failure | Log, retry in 1 hour |

---

## Scaling Considerations (Post-MVP)

| Bottleneck | Solution |
|------------|----------|
| Too many concurrent scans | Queue with rate limiting |
| Large result datasets | Pagination, archiving old scans |
| Email volume | Upgrade Resend tier |
| API costs | Cache common query patterns |
