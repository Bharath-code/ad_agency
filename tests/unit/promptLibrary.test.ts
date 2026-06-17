import { describe, expect, it } from 'vitest';
import {
    generateIntentQueries,
    INDUSTRY_PROMPT_PACKS,
    normalizeIndustryKey,
    PROMPT_LIBRARY,
    PROMPT_LIBRARY_VERSION,
    type IntentQueryVars,
    type QueryCategory,
} from '../../convex/lib/constants';

const REQUIRED_CATEGORIES: QueryCategory[] = [
    'alternatives',
    'comparisons',
    'best_tools',
    'integrations',
    'verticals',
    'pricing',
    'problem_aware',
    'use_cases',
];

const vars: IntentQueryVars = {
    product: 'Acme',
    industry: 'helpdesk',
    useCase: 'managing support tickets',
    competitor: 'Zendesk',
};

describe('PROMPT_LIBRARY', () => {
    it('is versioned', () => {
        expect(PROMPT_LIBRARY_VERSION).toMatch(/\S/);
    });

    it('covers every required intent category', () => {
        const categories = new Set(PROMPT_LIBRARY.map((t) => t.category));
        for (const category of REQUIRED_CATEGORIES) {
            expect(categories).toContain(category);
        }
    });

    it('tags every template with a funnel stage', () => {
        const stages = new Set(PROMPT_LIBRARY.map((t) => t.stage));
        expect(stages).toEqual(new Set(['awareness', 'consideration', 'decision']));
        expect(PROMPT_LIBRARY.every((t) => t.stage.length > 0)).toBe(true);
    });
});

describe('normalizeIndustryKey', () => {
    it('matches a known pack by keyword substring, case-insensitively', () => {
        expect(normalizeIndustryKey('CRM')).toBe('crm');
        expect(normalizeIndustryKey('Email Marketing')).toBe('email');
        expect(normalizeIndustryKey('B2B project management')).toBe('project');
    });

    it('returns null for an unknown industry', () => {
        expect(normalizeIndustryKey('helpdesk')).toBeNull();
    });
});

describe('generateIntentQueries', () => {
    it('produces at least 30 prompts', () => {
        expect(generateIntentQueries(vars).length).toBeGreaterThanOrEqual(30);
    });

    it('covers every required intent category in the generated set', () => {
        const categories = new Set(generateIntentQueries(vars).map((q) => q.category));
        for (const category of REQUIRED_CATEGORIES) {
            expect(categories).toContain(category);
        }
    });

    it('replaces every placeholder', () => {
        for (const { query } of generateIntentQueries(vars)) {
            expect(query).not.toMatch(/\{[A-Z_]+\}/);
        }
    });

    it('substitutes real project values', () => {
        const queries = generateIntentQueries(vars).map((q) => q.query);
        expect(queries).toContain('Acme vs Zendesk');
        expect(queries).toContain('What is the best helpdesk tool?');
        expect(queries).toContain('Best tool for managing support tickets');
    });

    it('is deterministic for identical inputs', () => {
        expect(generateIntentQueries(vars)).toEqual(generateIntentQueries(vars));
    });

    it('appends industry-specific prompts for a known industry', () => {
        const base = generateIntentQueries({ ...vars, industry: 'helpdesk' });
        const crm = generateIntentQueries({ ...vars, industry: 'CRM' });
        expect(crm.length).toBe(base.length + INDUSTRY_PROMPT_PACKS.crm.length);
        expect(crm.map((q) => q.query)).toContain('Best CRM for sales pipeline management');
    });

    it('never emits duplicate queries', () => {
        const queries = generateIntentQueries(vars).map((q) => q.query);
        expect(new Set(queries).size).toBe(queries.length);
    });
});
