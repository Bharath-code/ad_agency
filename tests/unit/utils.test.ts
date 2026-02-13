import { describe, expect, it } from 'vitest';
import { INTENT_QUERY_TEMPLATES, PRICING_TIERS } from '../../convex/lib/constants';
import { parseJSONResponse } from '../../convex/lib/llm/types';
import { calculateVisibilityScore, getScoreColor, getScoreLabel } from '../../convex/lib/utils';

describe('calculateVisibilityScore', () => {
	it('returns 0 when totalQueries is 0', () => {
		expect(
			calculateVisibilityScore({
				primaryMentions: 0,
				secondaryMentions: 0,
				totalQueries: 0,
			}),
		).toBe(0);
	});

	it('calculates 100% when all primary mentions', () => {
		expect(
			calculateVisibilityScore({
				primaryMentions: 10,
				secondaryMentions: 0,
				totalQueries: 10,
			}),
		).toBe(100);
	});

	it('calculates 50% when all secondary mentions', () => {
		expect(
			calculateVisibilityScore({
				primaryMentions: 0,
				secondaryMentions: 10,
				totalQueries: 10,
			}),
		).toBe(50);
	});

	it('calculates mixed score correctly', () => {
		expect(
			calculateVisibilityScore({
				primaryMentions: 5,
				secondaryMentions: 3,
				totalQueries: 10,
			}),
		).toBe(65);
	});

	it('rounds to nearest integer', () => {
		expect(
			calculateVisibilityScore({
				primaryMentions: 3,
				secondaryMentions: 1,
				totalQueries: 10,
			}),
		).toBe(35);
	});
});

describe('getScoreLabel', () => {
	it('returns excellent for score >= 70', () => {
		expect(getScoreLabel(70)).toBe('excellent');
		expect(getScoreLabel(100)).toBe('excellent');
	});

	it('returns good for score >= 50 and < 70', () => {
		expect(getScoreLabel(50)).toBe('good');
		expect(getScoreLabel(69)).toBe('good');
	});

	it('returns fair for score >= 25 and < 50', () => {
		expect(getScoreLabel(25)).toBe('fair');
		expect(getScoreLabel(49)).toBe('fair');
	});

	it('returns poor for score < 25', () => {
		expect(getScoreLabel(0)).toBe('poor');
		expect(getScoreLabel(24)).toBe('poor');
	});
});

describe('getScoreColor', () => {
	it('returns green for score >= 70', () => {
		expect(getScoreColor(70)).toBe('green');
		expect(getScoreColor(100)).toBe('green');
	});

	it('returns blue for score >= 50 and < 70', () => {
		expect(getScoreColor(50)).toBe('blue');
		expect(getScoreColor(69)).toBe('blue');
	});

	it('returns yellow for score >= 25 and < 50', () => {
		expect(getScoreColor(25)).toBe('yellow');
		expect(getScoreColor(49)).toBe('yellow');
	});

	it('returns red for score < 25', () => {
		expect(getScoreColor(0)).toBe('red');
		expect(getScoreColor(24)).toBe('red');
	});
});

describe('parseJSONResponse', () => {
	it('parses plain JSON', () => {
		const result = parseJSONResponse<{ mentioned: boolean }>('{"mentioned": true}');
		expect(result.mentioned).toBe(true);
	});

	it('parses JSON wrapped in ```json code block', () => {
		const result = parseJSONResponse<{ mentioned: boolean }>('```json\n{"mentioned": true}\n```');
		expect(result.mentioned).toBe(true);
	});

	it('parses JSON wrapped in ``` code block', () => {
		const result = parseJSONResponse<{ mentioned: boolean }>('```\n{"mentioned": true}\n```');
		expect(result.mentioned).toBe(true);
	});

	it('trims whitespace', () => {
		const result = parseJSONResponse<{ mentioned: boolean }>('  {"mentioned": true}  ');
		expect(result.mentioned).toBe(true);
	});

	it('throws on invalid JSON', () => {
		expect(() => parseJSONResponse('not valid json')).toThrow();
	});
});

describe('PRICING_TIERS', () => {
	it('has free, indie, and startup tiers', () => {
		expect(PRICING_TIERS.free).toBeDefined();
		expect(PRICING_TIERS.indie).toBeDefined();
		expect(PRICING_TIERS.startup).toBeDefined();
	});

	it('free tier has limited scans', () => {
		expect(PRICING_TIERS.free.maxScans).toBe(5);
		expect(PRICING_TIERS.free.maxProjects).toBe(1);
	});

	it('paid tiers have unlimited scans', () => {
		expect(PRICING_TIERS.indie.maxScans).toBe(-1);
		expect(PRICING_TIERS.startup.maxScans).toBe(-1);
	});

	it('startup tier has more projects', () => {
		expect(PRICING_TIERS.startup.maxProjects).toBe(5);
		expect(PRICING_TIERS.indie.maxProjects).toBe(1);
	});

	it('prices are correct', () => {
		expect(PRICING_TIERS.free.price).toBe(0);
		expect(PRICING_TIERS.indie.price).toBe(49);
		expect(PRICING_TIERS.startup.price).toBe(149);
	});
});

describe('INTENT_QUERY_TEMPLATES', () => {
	it('has 30 queries', () => {
		expect(INTENT_QUERY_TEMPLATES).toHaveLength(30);
	});

	it('all queries have category', () => {
		INTENT_QUERY_TEMPLATES.forEach((q) => {
			expect(q.category).toBeDefined();
			expect(q.query).toBeDefined();
		});
	});

	it('has 5 categories', () => {
		const categories = new Set(INTENT_QUERY_TEMPLATES.map((q) => q.category));
		expect(categories.size).toBe(5);
	});

	it('queries contain placeholders', () => {
		const hasIndustry = INTENT_QUERY_TEMPLATES.some((q) => q.query.includes('{INDUSTRY}'));
		const hasProduct = INTENT_QUERY_TEMPLATES.some((q) => q.query.includes('{PRODUCT}'));
		const hasCompetitor = INTENT_QUERY_TEMPLATES.some((q) => q.query.includes('{COMPETITOR}'));

		expect(hasIndustry).toBe(true);
		expect(hasProduct).toBe(true);
		expect(hasCompetitor).toBe(true);
	});

	it('each category has 6 queries', () => {
		const categories = ['best_tools', 'alternatives', 'comparisons', 'worth_it', 'use_cases'];

		categories.forEach((cat) => {
			const count = INTENT_QUERY_TEMPLATES.filter((q) => q.category === cat).length;
			expect(count).toBe(6);
		});
	});
});
