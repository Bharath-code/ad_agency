Perfect. Below is **the full internal blueprint** you can paste into your repo and start building **today**.

No fluff. No theory. This is **operator-grade**.

---

# 🔧 1️⃣ EXACT PROMPT TEMPLATES (COPY–PASTE)

These are **controlled, deterministic prompts**.
You are **not** asking the model to be creative.
You are extracting *patterns*.

---

## 🔹 PROMPT A — BRAND VISIBILITY CHECK

**Purpose:**
Detect whether the brand appears, how strongly, and in what context.

```
SYSTEM:
You are a neutral analyst. Do not promote or discourage any product.
Answer concisely and factually.

USER:
Question: "{{USER_INTENT_QUERY}}"

Analyze the answer space and respond in this exact JSON format:

{
  "mentioned": true | false,
  "position": "primary" | "secondary" | "not_mentioned",
  "context": "one sentence describing why the brand appears or does not",
  "confidence_level": "high" | "medium" | "low"
}

Brand to evaluate: "{{BRAND_NAME}}"
Competitors: {{COMPETITOR_LIST}}
```

✅ Why this works:

* Binary outputs
* No hallucination incentives
* Easy scoring

---

## 🔹 PROMPT B — COMPETITOR ADVANTAGE EXTRACTION

**Purpose:**
Understand *why* competitors are winning.

```
SYSTEM:
You are analyzing decision-making criteria in AI recommendations.

USER:
When users ask: "{{USER_INTENT_QUERY}}"

Why would an assistant recommend "{{COMPETITOR_NAME}}" instead of "{{BRAND_NAME}}"?

Return 3 concrete reasons in this format:

{
  "reasons": [
    "reason 1",
    "reason 2",
    "reason 3"
  ]
}

Do not speculate. Base answers on clarity, positioning, and perceived usefulness.
```

This becomes **actionable advice**, not “AI vibes”.

---

## 🔹 PROMPT C — POSITIONING FIX SUGGESTION

**Purpose:**
Turn insight into action.

```
SYSTEM:
You are a product positioning consultant.

USER:
Given this missed intent:
"{{USER_INTENT_QUERY}}"

And this context:
{{CONTEXT_FROM_PREVIOUS_RESULT}}

Suggest:
1. One positioning change
2. One content asset to create
3. One clarification to add to product messaging

Respond in bullet points. Be concise.
```

This powers your **Recommendation Gap Engine**.

---

## 🔹 PROMPT D — SENTIMENT SAFETY CHECK (OPTIONAL v1.5)

```
SYSTEM:
Classify tone only.

USER:
In the context of this recommendation:
"{{MENTION_CONTEXT}}"

Classify sentiment toward "{{BRAND_NAME}}" as:
positive | neutral | negative

Respond with one word only.
```

---

# 📌 2️⃣ INITIAL 30 HIGH-INTENT QUERIES (STEAL THESE)

These are **universal SaaS money queries**.
They trigger **decisions**, not browsing.

---

## 🔥 CATEGORY: “BEST” (Top-funnel decision)

1. Best {{CATEGORY}} for startups
2. Best {{CATEGORY}} for small teams
3. Best {{CATEGORY}} for SaaS
4. Best {{CATEGORY}} for non-technical founders
5. Best {{CATEGORY}} under $50/month

---

## 🔥 CATEGORY: “ALTERNATIVES” (High buying intent)

6. {{COMPETITOR}} alternatives
7. Alternatives to {{COMPETITOR}} for startups
8. Open-source alternatives to {{COMPETITOR}}
9. Cheaper alternative to {{COMPETITOR}}
10. {{COMPETITOR}} vs competitors

---

## 🔥 CATEGORY: “COMPARISON” (Late funnel)

11. {{BRAND}} vs {{COMPETITOR}}
12. {{COMPETITOR_A}} vs {{COMPETITOR_B}}
13. Which is better {{BRAND}} or {{COMPETITOR}}
14. Is {{BRAND}} better than {{COMPETITOR}}
15. {{BRAND}} comparison

---

## 🔥 CATEGORY: “WORTH IT” (Decision friction)

16. Is {{BRAND}} worth it
17. Should I use {{BRAND}}
18. Pros and cons of {{BRAND}}
19. {{BRAND}} pricing vs value
20. {{BRAND}} review

---

## 🔥 CATEGORY: “USE-CASE” (AI loves these)

21. Best {{CATEGORY}} for {{USE_CASE}}
22. Tools for {{JOB_TO_BE_DONE}}
23. How to solve {{PROBLEM}}
24. Software to fix {{PROBLEM}}
25. Tools used by {{ROLE}}

---

## 🔥 CATEGORY: “TRUST & SAFETY”

26. Is {{BRAND}} safe
27. Is {{BRAND}} reliable
28. Is {{BRAND}} secure
29. Who should not use {{BRAND}}
30. When NOT to use {{BRAND}}

These queries **do not change often** → perfect for monitoring.

---

# 🗄 3️⃣ DATABASE SCHEMA (SUPABASE-READY)

Simple. Clean. Scalable.

---

## 🔹 TABLE: `projects`

```
id (uuid, pk)
name (text)
industry (text)
brand_name (text)
created_at (timestamp)
```

---

## 🔹 TABLE: `competitors`

```
id (uuid, pk)
project_id (fk)
name (text)
```

---

## 🔹 TABLE: `intent_queries`

```
id (uuid, pk)
project_id (fk)
query_text (text)
category (text)
```

---

## 🔹 TABLE: `ai_results`

```
id (uuid, pk)
intent_query_id (fk)
brand (text)
mentioned (boolean)
position (text)
context (text)
confidence_level (text)
sentiment (text)
created_at (timestamp)
```

---

## 🔹 TABLE: `insights`

```
id (uuid, pk)
intent_query_id (fk)
type (text) -- "gap", "win", "risk"
recommendation (text)
created_at (timestamp)
```

---

## 🔹 TABLE: `weekly_reports`

```
id (uuid, pk)
project_id (fk)
visibility_score (integer)
wins (integer)
losses (integer)
summary (text)
sent_at (timestamp)
```

---

# 🔌 4️⃣ API ROUTES (MINIMAL & REAL)

### POST `/projects`

Create new project

---

### POST `/queries/run`

Runs all intent prompts
→ stores results

---

### GET `/dashboard/:projectId`

Returns:

* Visibility score
* Wins vs losses
* Top missed intents

---

### GET `/insights/:projectId`

Returns:

* Gaps
* Suggested actions

---

### POST `/reports/weekly`

Generates + emails report

---

# 📊 VISIBILITY SCORE (DON’T OVERTHINK)

```
visibility_score =
(mentioned_primary * 2 + mentioned_secondary * 1) / total_queries * 100
```

Simple.
Explainable.
Trusted.

---

# ⚠️ CRITICAL RULES (READ THIS)

1. **Never promise rankings**
2. **Never imply control over ChatGPT**
3. **Always say “pattern-based insights”**
4. **Be honest about limitations**

This builds *trust* — and trust is your moat.

---

# 🧠 WHY THIS WILL WIN

You are not:

* Selling ads
* Selling hype
* Selling magic

You are selling:

* Clarity
* Visibility
* Direction

Founders pay for that **forever**.

---

## FINAL NEXT ACTION (DO THIS TODAY)

1. Create repo
2. Implement Prompt A
3. Store first results
4. Show ONE visibility score
5. Sell to ONE founder

Momentum > perfection.

If you want next:

* Landing page copy
* Pricing page
* Founder outreach script
* Or investor-grade narrative

Say the word.
