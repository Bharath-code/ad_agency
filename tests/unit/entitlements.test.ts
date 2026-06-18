import { describe, expect, it } from 'vitest';
import {
    canCreateProject,
    canScan,
    hasFeature,
    isPaidPlan,
    PAID_PLANS,
    PLAN_FEATURES,
    PLAN_LIMITS,
    PLAN_PRICING,
    type PlanType,
    projectLimit,
    remainingScans,
} from '../../convex/lib/entitlements';

const ALL_PLANS: PlanType[] = ['free', 'starter', 'growth', 'agency'];

describe('plan ladder', () => {
    it('defines limits, features, and pricing for every plan', () => {
        for (const plan of ALL_PLANS) {
            expect(PLAN_LIMITS[plan]).toBeDefined();
            expect(PLAN_FEATURES[plan]).toBeDefined();
            expect(PLAN_PRICING[plan]).toBeDefined();
        }
    });

    it('prices the reconciled 4-tier ladder ($0/$99/$249/$799)', () => {
        expect(PLAN_PRICING.free.priceMonthly).toBe(0);
        expect(PLAN_PRICING.starter.priceMonthly).toBe(99);
        expect(PLAN_PRICING.growth.priceMonthly).toBe(249);
        expect(PLAN_PRICING.agency.priceMonthly).toBe(799);
    });

    it('treats only non-free plans as paid', () => {
        expect(isPaidPlan('free')).toBe(false);
        expect(PAID_PLANS).toEqual(['starter', 'growth', 'agency']);
        for (const plan of PAID_PLANS) {
            expect(isPaidPlan(plan)).toBe(true);
        }
    });

    it('grants more projects as tiers increase', () => {
        expect(projectLimit('free')).toBe(1);
        expect(projectLimit('starter')).toBe(1);
        expect(projectLimit('growth')).toBe(5);
        expect(projectLimit('agency')).toBe(25);
    });
});

describe('canScan / remainingScans', () => {
    it('caps the free tier at its scan limit', () => {
        expect(canScan('free', 0)).toBe(true);
        expect(canScan('free', 4)).toBe(true);
        expect(canScan('free', 5)).toBe(false);
        expect(canScan('free', 6)).toBe(false);
    });

    it('treats -1 as unlimited for paid tiers', () => {
        expect(canScan('starter', 9999)).toBe(true);
        expect(remainingScans('starter', 9999)).toBeNull();
    });

    it('reports remaining free scans without going negative', () => {
        expect(remainingScans('free', 0)).toBe(5);
        expect(remainingScans('free', 3)).toBe(2);
        expect(remainingScans('free', 7)).toBe(0);
    });
});

describe('canCreateProject', () => {
    it('blocks a second project on single-project plans', () => {
        expect(canCreateProject('free', 0)).toBe(true);
        expect(canCreateProject('free', 1)).toBe(false);
        expect(canCreateProject('starter', 1)).toBe(false);
    });

    it('allows multi-project on growth and agency', () => {
        expect(canCreateProject('growth', 4)).toBe(true);
        expect(canCreateProject('growth', 5)).toBe(false);
        expect(canCreateProject('agency', 24)).toBe(true);
        expect(canCreateProject('agency', 25)).toBe(false);
    });
});

describe('feature gates', () => {
    it('locks paid-only features on free', () => {
        expect(hasFeature('free', 'transcripts')).toBe(false);
        expect(hasFeature('free', 'recurringScans')).toBe(false);
        expect(hasFeature('free', 'weeklyReports')).toBe(false);
    });

    it('unlocks transcripts and weekly reports for every paid plan', () => {
        for (const plan of PAID_PLANS) {
            expect(hasFeature(plan, 'transcripts')).toBe(true);
            expect(hasFeature(plan, 'weeklyReports')).toBe(true);
            expect(hasFeature(plan, 'recurringScans')).toBe(true);
        }
    });

    it('gates multi-project at growth+ and client reports at agency only', () => {
        expect(hasFeature('starter', 'multiProject')).toBe(false);
        expect(hasFeature('growth', 'multiProject')).toBe(true);
        expect(hasFeature('agency', 'multiProject')).toBe(true);

        expect(hasFeature('growth', 'clientReports')).toBe(false);
        expect(hasFeature('agency', 'clientReports')).toBe(true);
    });

    it('keeps multiProject consistent with the project limit', () => {
        for (const plan of ALL_PLANS) {
            expect(hasFeature(plan, 'multiProject')).toBe(projectLimit(plan) > 1);
        }
    });
});
