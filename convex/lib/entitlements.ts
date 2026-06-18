/**
 * Plan entitlements — the single source of truth for what each plan unlocks.
 *
 * Tiers (reconciled in Phase 9 from the strategy doc; code/landing/docs all align here):
 *   free   $0    capped diagnostic
 *   starter $99  1 project, unlimited scans, transcripts, weekly reports
 *   growth  $249 5 projects, multi-project, multi-model, reports
 *   agency  $799 25 projects, client reporting/exports (Phase 10)
 *
 * Keep all plan-shaped knowledge (limits, feature flags, pricing copy) in this
 * pure module so a future tier change is a one-file edit and stays unit-testable
 * with no Convex/DB/network. `dodo.ts` and `constants.ts` re-export from here.
 */

export type PlanType = 'free' | 'starter' | 'growth' | 'agency';

export interface PlanLimits {
	scans: number; // -1 = unlimited
	projects: number;
	competitors: number;
	queries: number;
}

/** Hard numeric caps per plan. */
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
	free: { scans: 5, projects: 1, competitors: 2, queries: 10 },
	starter: { scans: -1, projects: 1, competitors: 3, queries: 30 },
	growth: { scans: -1, projects: 5, competitors: 10, queries: 75 },
	agency: { scans: -1, projects: 25, competitors: 25, queries: 75 },
} as const;

/** Boolean feature gates per plan. */
export type PlanFeature =
	| 'recurringScans' // auto-scan cron
	| 'transcripts' // raw response evidence viewer
	| 'weeklyReports' // emailed weekly digest
	| 'multiProject' // create more than one project
	| 'clientReports'; // white-label/agency exports (Phase 10)

export const PLAN_FEATURES: Record<PlanType, Record<PlanFeature, boolean>> = {
	free: {
		recurringScans: false,
		transcripts: false,
		weeklyReports: false,
		multiProject: false,
		clientReports: false,
	},
	starter: {
		recurringScans: true,
		transcripts: true,
		weeklyReports: true,
		multiProject: false,
		clientReports: false,
	},
	growth: {
		recurringScans: true,
		transcripts: true,
		weeklyReports: true,
		multiProject: true,
		clientReports: false,
	},
	agency: {
		recurringScans: true,
		transcripts: true,
		weeklyReports: true,
		multiProject: true,
		clientReports: true,
	},
} as const;

/** Paid tiers, in upgrade order. */
export const PAID_PLANS: readonly PlanType[] = ['starter', 'growth', 'agency'] as const;

export interface PlanPricing {
	id: PlanType;
	name: string;
	priceMonthly: number;
	tagline: string;
	features: string[];
}

/** Display copy for pricing surfaces (billing page, landing). */
export const PLAN_PRICING: Record<PlanType, PlanPricing> = {
	free: {
		id: 'free',
		name: 'Free',
		priceMonthly: 0,
		tagline: 'A baseline diagnostic for one product.',
		features: ['1 project', '10 buyer prompts', '5 scans total', 'Snapshot report'],
	},
	starter: {
		id: 'starter',
		name: 'Starter',
		priceMonthly: 99,
		tagline: 'For a solo founder optimizing one product.',
		features: [
			'1 project',
			'30 buyer prompts',
			'Unlimited scans',
			'Raw transcripts & evidence',
			'Weekly visibility report',
		],
	},
	growth: {
		id: 'growth',
		name: 'Growth',
		priceMonthly: 249,
		tagline: 'For B2B SaaS growth teams.',
		features: [
			'5 projects',
			'75 buyer prompts/project',
			'Multi-model consensus',
			'Competitor win/loss tracking',
			'Prioritized fix plan',
		],
	},
	agency: {
		id: 'agency',
		name: 'Agency',
		priceMonthly: 799,
		tagline: 'For agencies and fractional CMOs.',
		features: [
			'25 projects',
			'Everything in Growth',
			'Client-ready reports',
			'White-label exports',
			'Priority support',
		],
	},
} as const;

export function isPaidPlan(plan: PlanType): boolean {
	return plan !== 'free';
}

export function planLimits(plan: PlanType): PlanLimits {
	return PLAN_LIMITS[plan];
}

export function hasFeature(plan: PlanType, feature: PlanFeature): boolean {
	return PLAN_FEATURES[plan][feature];
}

/** True if the plan can run another scan given how many it has already used. */
export function canScan(plan: PlanType, scansUsed: number): boolean {
	const limit = PLAN_LIMITS[plan].scans;
	return limit === -1 || scansUsed < limit;
}

/** Scans left this period, or null when unlimited. */
export function remainingScans(plan: PlanType, scansUsed: number): number | null {
	const limit = PLAN_LIMITS[plan].scans;
	if (limit === -1) return null;
	return Math.max(0, limit - scansUsed);
}

export function projectLimit(plan: PlanType): number {
	return PLAN_LIMITS[plan].projects;
}

/** True if the plan can create another project given its current project count. */
export function canCreateProject(plan: PlanType, currentCount: number): boolean {
	return currentCount < PLAN_LIMITS[plan].projects;
}
