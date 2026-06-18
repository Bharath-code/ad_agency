/**
 * Industry Prompt Library — structured buyer-intent prompts.
 *
 * These are the questions buyers ask AI assistants when researching a market.
 * Prompts are organized by intent category and funnel stage so generation is
 * relevant per project, deterministic, and versioned.
 *
 * Placeholders: {PRODUCT}, {INDUSTRY}, {USE_CASE}, {COMPETITOR}
 */

/**
 * Bump when the library content changes. Stored on each generated intent query
 * so we can tell which library version a project's prompts came from.
 */
export const PROMPT_LIBRARY_VERSION = '2026-06-1';

export type QueryCategory =
	| 'best_tools'
	| 'alternatives'
	| 'comparisons'
	| 'integrations'
	| 'verticals'
	| 'pricing'
	| 'problem_aware'
	| 'use_cases';

/** Buyer journey funnel stage the prompt maps to. */
export type FunnelStage = 'awareness' | 'consideration' | 'decision';

/** Buyer role a prompt targets (metadata; drives vertical relevance). */
export type BuyerRole = 'founder' | 'marketer' | 'engineer' | 'operations' | 'general';

export interface PromptTemplate {
	query: string;
	category: QueryCategory;
	stage: FunnelStage;
	buyerRole: BuyerRole;
}

/**
 * Base library — applies to every project regardless of industry.
 * Covers all eight intent categories across awareness/consideration/decision.
 */
export const PROMPT_LIBRARY: PromptTemplate[] = [
	// Best tools (consideration)
	{ query: 'What is the best {INDUSTRY} tool?', category: 'best_tools', stage: 'consideration', buyerRole: 'general' },
	{ query: 'Best {INDUSTRY} software for teams', category: 'best_tools', stage: 'consideration', buyerRole: 'operations' },
	{ query: 'Top {INDUSTRY} tools in 2026', category: 'best_tools', stage: 'consideration', buyerRole: 'general' },
	{ query: 'Most recommended {INDUSTRY} software', category: 'best_tools', stage: 'consideration', buyerRole: 'general' },
	{ query: 'What {INDUSTRY} tool should I use?', category: 'best_tools', stage: 'consideration', buyerRole: 'general' },

	// Alternatives (consideration)
	{ query: 'Best alternatives to {COMPETITOR}', category: 'alternatives', stage: 'consideration', buyerRole: 'general' },
	{ query: '{COMPETITOR} alternatives', category: 'alternatives', stage: 'consideration', buyerRole: 'general' },
	{ query: 'What can I use instead of {COMPETITOR}?', category: 'alternatives', stage: 'consideration', buyerRole: 'general' },
	{ query: 'Open source alternative to {COMPETITOR}', category: 'alternatives', stage: 'consideration', buyerRole: 'engineer' },
	{ query: '{COMPETITOR} competitors', category: 'alternatives', stage: 'consideration', buyerRole: 'general' },

	// Comparisons (decision)
	{ query: '{PRODUCT} vs {COMPETITOR}', category: 'comparisons', stage: 'decision', buyerRole: 'general' },
	{ query: 'Compare {PRODUCT} and {COMPETITOR}', category: 'comparisons', stage: 'decision', buyerRole: 'general' },
	{ query: 'Which is better {PRODUCT} or {COMPETITOR}?', category: 'comparisons', stage: 'decision', buyerRole: 'general' },
	{ query: '{PRODUCT} {COMPETITOR} comparison', category: 'comparisons', stage: 'decision', buyerRole: 'general' },
	{ query: 'Difference between {PRODUCT} and {COMPETITOR}', category: 'comparisons', stage: 'decision', buyerRole: 'general' },

	// Integrations (consideration)
	{ query: '{INDUSTRY} software with API access', category: 'integrations', stage: 'consideration', buyerRole: 'engineer' },
	{ query: 'Best {INDUSTRY} tool that integrates with Slack', category: 'integrations', stage: 'consideration', buyerRole: 'operations' },
	{ query: '{INDUSTRY} tools with a Zapier integration', category: 'integrations', stage: 'consideration', buyerRole: 'operations' },
	{ query: 'Does {PRODUCT} integrate with other tools?', category: 'integrations', stage: 'consideration', buyerRole: 'engineer' },

	// Verticals (consideration)
	{ query: 'Best {INDUSTRY} tool for startups', category: 'verticals', stage: 'consideration', buyerRole: 'founder' },
	{ query: 'Best {INDUSTRY} software for agencies', category: 'verticals', stage: 'consideration', buyerRole: 'marketer' },
	{ query: 'Best {INDUSTRY} tool for enterprise', category: 'verticals', stage: 'consideration', buyerRole: 'operations' },
	{ query: '{INDUSTRY} software for remote teams', category: 'verticals', stage: 'consideration', buyerRole: 'operations' },

	// Pricing (decision)
	{ query: 'How much does {INDUSTRY} software cost?', category: 'pricing', stage: 'decision', buyerRole: 'general' },
	{ query: 'Most affordable {INDUSTRY} tool', category: 'pricing', stage: 'decision', buyerRole: 'founder' },
	{ query: 'Is {PRODUCT} worth the price?', category: 'pricing', stage: 'decision', buyerRole: 'general' },
	{ query: 'Best free {INDUSTRY} tools', category: 'pricing', stage: 'decision', buyerRole: 'general' },

	// Problem-aware (awareness)
	{ query: 'How do I {USE_CASE}?', category: 'problem_aware', stage: 'awareness', buyerRole: 'general' },
	{ query: 'Best way to {USE_CASE}', category: 'problem_aware', stage: 'awareness', buyerRole: 'general' },
	{ query: 'What tools help with {USE_CASE}?', category: 'problem_aware', stage: 'awareness', buyerRole: 'general' },

	// Use cases (consideration)
	{ query: 'Best tool for {USE_CASE}', category: 'use_cases', stage: 'consideration', buyerRole: 'general' },
	{ query: 'What tool should I use for {USE_CASE}?', category: 'use_cases', stage: 'consideration', buyerRole: 'general' },
	{ query: '{USE_CASE} software recommendations', category: 'use_cases', stage: 'consideration', buyerRole: 'general' },
	{ query: 'Software for {USE_CASE} for small business', category: 'use_cases', stage: 'consideration', buyerRole: 'founder' },
];

/**
 * Industry-specific packs appended when a project's industry matches a known
 * key. Keeps generation relevant for common verticals while staying deterministic.
 */
export const INDUSTRY_PROMPT_PACKS: Record<string, PromptTemplate[]> = {
	crm: [
		{ query: 'Best CRM for sales pipeline management', category: 'verticals', stage: 'consideration', buyerRole: 'operations' },
		{ query: 'CRM with the best email automation', category: 'integrations', stage: 'consideration', buyerRole: 'marketer' },
	],
	email: [
		{ query: 'Best email marketing tool for newsletters', category: 'verticals', stage: 'consideration', buyerRole: 'marketer' },
		{ query: 'Email platform with the highest deliverability', category: 'best_tools', stage: 'consideration', buyerRole: 'marketer' },
	],
	project: [
		{ query: 'Best project management tool for software teams', category: 'verticals', stage: 'consideration', buyerRole: 'engineer' },
		{ query: 'Project management software with Gantt charts', category: 'integrations', stage: 'consideration', buyerRole: 'operations' },
	],
	analytics: [
		{ query: 'Best product analytics tool for SaaS', category: 'verticals', stage: 'consideration', buyerRole: 'founder' },
		{ query: 'Analytics platform that is privacy-friendly', category: 'best_tools', stage: 'consideration', buyerRole: 'engineer' },
	],
};

export interface IntentQueryVars {
	product: string;
	industry: string;
	useCase: string;
	competitor: string;
}

export interface GeneratedIntentQuery {
	query: string;
	category: QueryCategory;
	stage: FunnelStage;
}

/**
 * Substitute intent-query placeholders with project values.
 * Replaces every occurrence so repeated placeholders all resolve.
 */
export function fillIntentQueryTemplate(template: string, vars: IntentQueryVars): string {
	return template
		.replaceAll('{PRODUCT}', vars.product)
		.replaceAll('{INDUSTRY}', vars.industry)
		.replaceAll('{USE_CASE}', vars.useCase)
		.replaceAll('{COMPETITOR}', vars.competitor);
}

/** Normalize a free-text industry to a pack key (lowercase, first matching keyword). */
export function normalizeIndustryKey(industry: string): string | null {
	const normalized = industry.trim().toLowerCase();
	for (const key of Object.keys(INDUSTRY_PROMPT_PACKS)) {
		if (normalized.includes(key)) {
			return key;
		}
	}
	return null;
}

/**
 * Deterministically build the intent-query set for a project from the library.
 * Order is stable (base library, then matched industry pack); duplicate filled
 * queries are removed so industry packs never collide with base prompts.
 */
export function generateIntentQueries(vars: IntentQueryVars): GeneratedIntentQuery[] {
	const packKey = normalizeIndustryKey(vars.industry);
	const templates = packKey
		? [...PROMPT_LIBRARY, ...INDUSTRY_PROMPT_PACKS[packKey]]
		: PROMPT_LIBRARY;

	const seen = new Set<string>();
	const queries: GeneratedIntentQuery[] = [];
	for (const template of templates) {
		const query = fillIntentQueryTemplate(template.query, vars);
		if (seen.has(query)) {
			continue;
		}
		seen.add(query);
		queries.push({ query, category: template.category, stage: template.stage });
	}
	return queries;
}

/**
 * Pricing/plan tiers — re-exported from the pure entitlements core
 * (single source of truth reconciled in Phase 9).
 */
export { PLAN_PRICING, PLAN_LIMITS, type PlanType } from './entitlements';

