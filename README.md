# RivalEye

RivalEye is an AI Visibility Intelligence platform that helps SaaS and B2B companies track, analyze, and optimize how often Large Language Models (LLMs) like ChatGPT, Claude, and Perplexity recommend their product over competitors.

## Features

- **Visibility Score:** Track your aggregate brand presence across dozens of high-value buyer intent queries.
- **Head-to-Head Competitor Analysis:** See exactly *why* an AI is recommending a competitor instead of you.
- **Actionable Fixes:** Get concrete AI-generated recommendations for positioning, content, and messaging tweaks to win back recommendations.
- **Scan Transcripts & CSV Export:** Drill down into raw LLM responses and export the data for deeper analysis.
- **Historical Trends:** Track your visibility score progress over time.
- **Automated Scanning:** Background cron jobs power recurring AI product sentiment analysis.

## Tech Stack

- **Framework:** [SvelteKit](https://svelte.dev/)
- **Backend & Database:** [Convex](https://convex.dev/) (Real-time edge database and serverless functions)
- **Authentication:** Convex Auth with GitHub OAuth
- **LLM Integration:** OpenAI & Anthropic (via custom routing layer in Convex actions)
- **Payments:** [Dodo Payments](https://dodopayments.com/)
- **Styling:** TailwindCSS + Custom UI components powered by Lucide Svelte

## Getting Started

### Prerequisites

- Node.js 18+
- [Convex Account](https://convex.dev/)

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Initialize Convex (this will spin up your backend and start syncing your schemas/functions):
   ```bash
   npx convex dev
   ```

3. Start the SvelteKit development server in a new terminal:
   ```bash
   pnpm run dev
   ```

## Environment Variables

Copy your `.env.local.example` to `.env.local` and populate the required keys to ensure everything runs correctly:

```env
# Convex
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...

# Auth (GitHub)
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...

# AI Models
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Dodo Payments
DODO_PAYMENTS_API_KEY=...
DODO_WEBHOOK_SECRET=...
```

## Running Tests

We use Vitest to run our core utility and LLM testing functions. 
```bash
pnpm test
```
