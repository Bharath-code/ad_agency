# AI Performance Architecture — AI Visibility Intelligence

> Parallelization, orchestration, caching, and optimization strategies for fast scans

---

## Performance Goals

| Metric | Current (Naive) | Target | Optimized |
|--------|-----------------|--------|-----------|
| Full scan (30 queries) | ~90 seconds | <20 seconds | ✓ |
| Single query | ~3 seconds | <1 second | ✓ |
| User perceived wait | 90+ seconds | <5 seconds | ✓ |
| API cost per scan | ~$0.50 | ~$0.15 | ✓ |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SCAN ORCHESTRATOR                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         BATCH MANAGER                                │    │
│  │  • Splits 30 queries into concurrent batches                         │    │
│  │  • Manages rate limits                                               │    │
│  │  • Handles retries                                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│          ┌────────────────────────┬┴───────────────────────┐                │
│          ▼                        ▼                        ▼                │
│  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐       │
│  │   WORKER 1    │        │   WORKER 2    │        │   WORKER 3    │       │
│  │  Queries 1-10 │        │  Queries 11-20│        │  Queries 21-30│       │
│  └───────────────┘        └───────────────┘        └───────────────┘       │
│          │                        │                        │                │
│          └────────────────────────┴────────────────────────┘                │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         RESULT AGGREGATOR                            │    │
│  │  • Combines all results                                              │    │
│  │  • Calculates visibility score                                       │    │
│  │  • Generates recommendations                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Strategy 1: Parallel Processing

### Naive (Sequential)

```typescript
// ❌ SLOW: 30 queries × 3 seconds = 90 seconds
async function runScanSequential(queries: string[]) {
  const results = [];
  for (const query of queries) {
    const result = await analyzeQuery(query); // 3s each
    results.push(result);
  }
  return results;
}
```

### Optimized (Parallel with Batching)

```typescript
// ✅ FAST: 30 queries ÷ 10 parallel = 3 batches × 3s = 9 seconds
async function runScanParallel(queries: string[]) {
  const BATCH_SIZE = 10; // OpenAI rate limit friendly
  const batches = chunk(queries, BATCH_SIZE);
  
  const results = [];
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(query => analyzeQuery(query))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### Fully Parallel with Rate Limiting

```typescript
// ✅ FASTEST: Controlled concurrency with p-limit
import pLimit from 'p-limit';

async function runScanOptimized(queries: string[]) {
  const limit = pLimit(10); // Max 10 concurrent requests
  
  const results = await Promise.all(
    queries.map(query => 
      limit(() => analyzeQuery(query))
    )
  );
  
  return results;
}
```

**Result:** 90 seconds → ~10 seconds

---

## Strategy 2: Streaming Results

Don't make users wait for the full scan. Show results as they come in.

```typescript
// convex/scans/actions.ts
export const runScanStreaming = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const queries = await ctx.runQuery(internal.queries.getForProject, {
      projectId: args.projectId,
    });
    
    const limit = pLimit(10);
    
    // Process in parallel, save each result immediately
    await Promise.all(
      queries.map(query =>
        limit(async () => {
          const result = await analyzeQuery(query);
          
          // Save immediately — UI updates in real-time via Convex
          await ctx.runMutation(internal.results.save, {
            projectId: args.projectId,
            queryId: query._id,
            result,
          });
        })
      )
    );
  },
});
```

**User Experience:**
```
[▓▓▓░░░░░░░] 3 of 30 queries complete...
[▓▓▓▓▓▓░░░░] 6 of 30 queries complete...
[▓▓▓▓▓▓▓▓▓▓] Complete! Visibility: 47%
```

---

## Strategy 3: Multi-Layer Caching

### Cache Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CACHE LAYERS                                      │
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   L1 CACHE  │    │   L2 CACHE  │    │   L3 CACHE  │    │   FRESH     │  │
│  │   Memory    │───▶│   Database  │───▶│   Similar   │───▶│   API Call  │  │
│  │   (1 min)   │    │   (24 hrs)  │    │   (7 days)  │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                              │
│  Hit Rate:  ~5%         ~40%               ~30%              ~25%           │
│  Latency:   1ms         10ms               50ms              3000ms         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// convex/lib/llm/cache.ts

interface CacheEntry {
  key: string;
  result: AnalysisResult;
  createdAt: number;
  hitCount: number;
}

export async function getCachedOrFresh(
  ctx: ActionCtx,
  prompt: AnalysisPrompt,
  options: { ttlMs: number } = { ttlMs: 24 * 60 * 60 * 1000 }
): Promise<AnalysisResult> {
  const cacheKey = hashPrompt(prompt);
  
  // L2: Check database cache
  const cached = await ctx.runQuery(internal.cache.get, { key: cacheKey });
  
  if (cached && Date.now() - cached.createdAt < options.ttlMs) {
    // Update hit count for analytics
    await ctx.runMutation(internal.cache.incrementHit, { key: cacheKey });
    return cached.result;
  }
  
  // L3: Check for similar queries (semantic matching)
  const similar = await ctx.runQuery(internal.cache.findSimilar, {
    query: prompt.userPrompt,
    threshold: 0.95,
  });
  
  if (similar) {
    return similar.result;
  }
  
  // Fresh API call
  const result = await callLLM(prompt);
  
  // Save to cache
  await ctx.runMutation(internal.cache.set, {
    key: cacheKey,
    result,
    createdAt: Date.now(),
  });
  
  return result;
}
```

### Cache Hit Optimization

```typescript
// Pre-populate cache with common queries across all customers
const UNIVERSAL_QUERIES = [
  "What's the best CRM?",
  "Best project management tool",
  "Top email marketing tools",
  // ... 100+ common queries
];

// Run these daily to warm cache
export const warmCache = internalAction({
  handler: async (ctx) => {
    for (const query of UNIVERSAL_QUERIES) {
      await analyzeQuery(query, { force: false }); // Only if not cached
    }
  },
});
```

**Result:** 75% cache hit rate = 75% fewer API calls = 75% faster + cheaper

---

## Strategy 4: Smart Query Prioritization

Not all queries are equal. Process important ones first.

```typescript
// Priority scoring
function prioritizeQueries(queries: IntentQuery[]): IntentQuery[] {
  return queries.sort((a, b) => {
    // High-intent queries first
    const priorityMap = {
      'best_tools': 3,
      'alternatives': 3,
      'comparisons': 2,
      'use_cases': 1,
    };
    
    return (priorityMap[b.category] || 0) - (priorityMap[a.category] || 0);
  });
}

// Process high-priority first, show early results
async function runSmartScan(queries: IntentQuery[]) {
  const prioritized = prioritizeQueries(queries);
  
  // First batch: Top 10 most important (fast feedback)
  const firstBatch = prioritized.slice(0, 10);
  await Promise.all(firstBatch.map(q => analyzeAndSave(q)));
  
  // Remaining queries in background
  const remaining = prioritized.slice(10);
  await Promise.all(remaining.map(q => analyzeAndSave(q)));
}
```

---

## Strategy 5: AI Agent Orchestration

For complex analysis, use specialized agents.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT ORCHESTRATOR                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         COORDINATOR AGENT                            │    │
│  │  • Receives scan request                                             │    │
│  │  • Distributes to specialized agents                                 │    │
│  │  • Aggregates and synthesizes results                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│          ┌────────────────────────┬┴───────────────────────┐                │
│          ▼                        ▼                        ▼                │
│  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐       │
│  │ VISIBILITY    │        │ COMPETITOR    │        │ RECOMMENDATION│       │
│  │ AGENT         │        │ AGENT         │        │ AGENT         │       │
│  │               │        │               │        │               │       │
│  │ "Is brand     │        │ "Who's        │        │ "What should  │       │
│  │  mentioned?"  │        │  winning?"    │        │  they change?"│       │
│  └───────────────┘        └───────────────┘        └───────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Implementation

```typescript
// convex/lib/agents/types.ts

interface Agent {
  name: string;
  role: string;
  analyze(input: AgentInput): Promise<AgentOutput>;
}

// Visibility Agent — Fast, simple checks
const visibilityAgent: Agent = {
  name: 'visibility',
  role: 'Check if brand is mentioned in AI response',
  async analyze({ query, brand, aiResponse }) {
    const prompt = `
      Does this response mention "${brand}"?
      Response: "${aiResponse}"
      
      Return JSON: { "mentioned": boolean, "position": "primary"|"secondary"|"not_mentioned", "context": "..." }
    `;
    return await callLLM(prompt, { model: 'gpt-4o-mini', maxTokens: 100 });
  }
};

// Competitor Agent — Deeper analysis
const competitorAgent: Agent = {
  name: 'competitor',
  role: 'Analyze why competitors are recommended',
  async analyze({ query, competitors, aiResponse }) {
    const prompt = `
      Which of these competitors are mentioned: ${competitors.join(', ')}?
      Why are they recommended over others?
      
      Response: "${aiResponse}"
      
      Return JSON: { "winner": string, "reasons": string[3] }
    `;
    return await callLLM(prompt, { model: 'gpt-4o-mini', maxTokens: 200 });
  }
};

// Recommendation Agent — Strategic suggestions
const recommendationAgent: Agent = {
  name: 'recommendation',
  role: 'Generate actionable positioning fixes',
  async analyze({ brand, competitorAdvantages, missingQueries }) {
    const prompt = `
      Brand "${brand}" is losing to competitors because: ${competitorAdvantages}
      They're missing in these queries: ${missingQueries}
      
      What 3 specific changes should they make to their positioning, content, and messaging?
      
      Return JSON: { "positioning": "...", "content": "...", "messaging": "..." }
    `;
    return await callLLM(prompt, { model: 'gpt-4o', maxTokens: 500 }); // Better model for strategy
  }
};
```

### Pipeline Orchestration

```typescript
// convex/lib/agents/orchestrator.ts

export async function runAgentPipeline(
  projectId: string,
  queries: IntentQuery[]
): Promise<ScanResult> {
  // Stage 1: Get AI responses for all queries (parallel)
  const aiResponses = await Promise.all(
    queries.map(q => getAIResponse(q.query))
  );
  
  // Stage 2: Run visibility checks (parallel, cheap)
  const visibilityResults = await Promise.all(
    aiResponses.map((response, i) => 
      visibilityAgent.analyze({
        query: queries[i].query,
        brand: project.name,
        aiResponse: response,
      })
    )
  );
  
  // Stage 3: Run competitor analysis only where needed (parallel)
  const notMentioned = visibilityResults.filter(r => !r.mentioned);
  const competitorResults = await Promise.all(
    notMentioned.map(r => 
      competitorAgent.analyze({
        query: r.query,
        competitors: project.competitors,
        aiResponse: r.aiResponse,
      })
    )
  );
  
  // Stage 4: Generate recommendations (single call, strategic)
  const recommendations = await recommendationAgent.analyze({
    brand: project.name,
    competitorAdvantages: summarize(competitorResults),
    missingQueries: notMentioned.map(r => r.query),
  });
  
  return {
    score: calculateScore(visibilityResults),
    results: visibilityResults,
    competitorInsights: competitorResults,
    recommendations,
  };
}
```

---

## Strategy 6: Optimized Prompts

### Single Prompt for Multiple Outputs

```typescript
// ❌ SLOW: 3 separate API calls
const visibility = await getVisibility(query);
const competitor = await getCompetitor(query);
const fix = await getFix(query);

// ✅ FAST: 1 API call, structured output
const prompt = `
Analyze this AI response for brand visibility:

Query: "${query}"
Brand: "${brand}"
Competitors: ${competitors.join(', ')}
AI Response: "${aiResponse}"

Return JSON:
{
  "visibility": {
    "mentioned": boolean,
    "position": "primary" | "secondary" | "not_mentioned",
    "context": "quote from response"
  },
  "competitor": {
    "winner": "competitor name or null",
    "reasons": ["reason 1", "reason 2", "reason 3"]
  },
  "fix": {
    "positioning": "specific change",
    "content": "specific content to create",
    "messaging": "specific phrase to add"
  }
}
`;
```

**Result:** 3 API calls → 1 API call = 3x faster + cheaper

---

## Strategy 7: Background Processing

Don't block on scan completion.

```typescript
// convex/scans/actions.ts

// User triggers scan — returns immediately
export const triggerScan = action({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Create scan record
    const scanId = await ctx.runMutation(internal.scans.create, {
      projectId: args.projectId,
      status: 'pending',
    });
    
    // Schedule background processing
    await ctx.scheduler.runAfter(0, internal.scans.process, {
      scanId,
    });
    
    // Return immediately
    return { scanId, status: 'started' };
  },
});

// Background processing — user doesn't wait
export const processScan = internalAction({
  args: { scanId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.scans.updateStatus, {
      scanId: args.scanId,
      status: 'running',
    });
    
    // Run full scan (takes 10+ seconds)
    const results = await runFullScan(args.scanId);
    
    await ctx.runMutation(internal.scans.complete, {
      scanId: args.scanId,
      results,
    });
  },
});
```

**User Experience:**
- Click "Scan" → Instant feedback "Scan started"
- Dashboard shows progress bar
- Results appear as they complete (real-time via Convex)

---

## Performance Summary

| Optimization | Impact | Complexity |
|--------------|--------|------------|
| Parallel processing | 90s → 10s | Low |
| Streaming results | Perceived 90s → 3s | Medium |
| Response caching | 75% fewer API calls | Medium |
| Query prioritization | Important results first | Low |
| Combined prompts | 3x fewer API calls | Low |
| Background processing | Instant feedback | Medium |
| Agent orchestration | Better quality, same speed | High |

### Final Performance

| Metric | Before | After |
|--------|--------|-------|
| Full scan | 90s | 10s |
| User wait | 90s | 3s (streaming) |
| API calls | 90 | 30 |
| API cost | $0.50 | $0.15 |
| Cache hit rate | 0% | ~75% |

---

## Implementation Priority

### Phase 1 (MVP)
1. ✅ Parallel processing with p-limit
2. ✅ Combined prompts (single call per query)
3. ✅ Background processing with progress

### Phase 2 (Post-Launch)
4. ⬜ Response caching (24-hour TTL)
5. ⬜ Streaming results to UI
6. ⬜ Query prioritization

### Phase 3 (Scale)
7. ⬜ Multi-layer caching
8. ⬜ Cache warming for common queries
9. ⬜ Agent orchestration for deeper analysis
