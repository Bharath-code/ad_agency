/**
 * Intent Queries — 30 fixed high-intent queries
 * These are the questions users ask ChatGPT/AI when looking for solutions
 */

export type QueryCategory =
	| 'best_tools'
	| 'alternatives'
	| 'comparisons'
	| 'worth_it'
	| 'use_cases'
	| 'versus';

export interface IntentQuery {
	query: string;
	category: QueryCategory;
}

// Industry placeholders: {PRODUCT}, {INDUSTRY}, {COMPETITOR}
export const INTENT_QUERY_TEMPLATES: IntentQuery[] = [
	// Best Tools (6 queries)
	{ query: 'What is the best {INDUSTRY} tool?', category: 'best_tools' },
	{ query: 'Best {INDUSTRY} software for startups', category: 'best_tools' },
	{ query: 'Top {INDUSTRY} tools in 2026', category: 'best_tools' },
	{ query: 'What {INDUSTRY} tool should I use?', category: 'best_tools' },
	{ query: 'Best free {INDUSTRY} tool', category: 'best_tools' },
	{ query: 'Most recommended {INDUSTRY} software', category: 'best_tools' },

	// Alternatives (6 queries)
	{ query: 'Best alternatives to {COMPETITOR}', category: 'alternatives' },
	{ query: '{COMPETITOR} alternatives', category: 'alternatives' },
	{ query: 'What can I use instead of {COMPETITOR}?', category: 'alternatives' },
	{ query: 'Cheaper alternative to {COMPETITOR}', category: 'alternatives' },
	{ query: 'Free alternatives to {COMPETITOR}', category: 'alternatives' },
	{ query: '{COMPETITOR} competitors', category: 'alternatives' },

	// Comparisons (6 queries)
	{ query: '{PRODUCT} vs {COMPETITOR}', category: 'comparisons' },
	{ query: 'Compare {PRODUCT} and {COMPETITOR}', category: 'comparisons' },
	{ query: 'Which is better {PRODUCT} or {COMPETITOR}?', category: 'comparisons' },
	{ query: '{PRODUCT} vs {COMPETITOR} for startups', category: 'comparisons' },
	{ query: '{PRODUCT} {COMPETITOR} comparison', category: 'comparisons' },
	{ query: 'Difference between {PRODUCT} and {COMPETITOR}', category: 'comparisons' },

	// Worth It (6 queries)
	{ query: 'Is {PRODUCT} worth it?', category: 'worth_it' },
	{ query: 'Is {PRODUCT} good?', category: 'worth_it' },
	{ query: '{PRODUCT} review', category: 'worth_it' },
	{ query: 'Should I use {PRODUCT}?', category: 'worth_it' },
	{ query: '{PRODUCT} pros and cons', category: 'worth_it' },
	{ query: 'Is {PRODUCT} reliable?', category: 'worth_it' },

	// Use Cases (6 queries)
	{ query: 'Best tool for {USE_CASE}', category: 'use_cases' },
	{ query: 'How to {USE_CASE}', category: 'use_cases' },
	{ query: 'What tool should I use for {USE_CASE}?', category: 'use_cases' },
	{ query: '{USE_CASE} software recommendations', category: 'use_cases' },
	{ query: 'Best way to {USE_CASE}', category: 'use_cases' },
	{ query: 'Tool for {USE_CASE} for small business', category: 'use_cases' },
];

/**
 * Pricing tiers
 */
export const PRICING_TIERS = {
	free: {
		name: 'Free',
		price: 0,
		maxScans: 5,
		maxProjects: 1,
		features: ['5 scans total', '1 project', 'No history'],
	},
	indie: {
		name: 'Indie',
		price: 49,
		maxScans: -1, // unlimited
		maxProjects: 1,
		features: ['Unlimited scans', '1 project', 'Full history', 'Weekly reports'],
	},
	startup: {
		name: 'Startup',
		price: 149,
		maxScans: -1, // unlimited
		maxProjects: 5,
		features: [
			'Unlimited scans',
			'5 projects',
			'Full history',
			'Weekly reports',
			'Priority support',
		],
	},
} as const;

export type PlanType = keyof typeof PRICING_TIERS;
