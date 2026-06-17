import { describe, expect, it } from 'vitest';
import { buildCompetitorWinLoss, type WinLossResultInput } from '../../convex/lib/competitorWinLoss';

function miss(
	queryId: string,
	competitor: string,
	reasons: string[],
): WinLossResultInput {
	return { queryId, position: 'not_mentioned', competitorMentioned: competitor, competitorReasons: reasons };
}

const queryMap = new Map<string, string>([
	['q1', 'best crm for startups'],
	['q2', 'crm alternatives'],
	['q3', 'cheapest crm'],
	['q4', 'crm with slack integration'],
	['q5', 'top sales tools'],
]);

describe('buildCompetitorWinLoss', () => {
	it('returns a polished empty shape when there are no results', () => {
		const out = buildCompetitorWinLoss([], queryMap);
		expect(out.totalQueries).toBe(0);
		expect(out.competitors).toEqual([]);
		expect(out.brand.winRate).toBe(0);
	});

	it('counts brand wins and per-competitor losses, sorted by wins', () => {
		const results: WinLossResultInput[] = [
			{ queryId: 'q1', position: 'primary' },
			{ queryId: 'q5', position: 'secondary' },
			miss('q2', 'Acme', ['Better pricing']),
			miss('q3', 'Acme', ['Cheaper plans']),
			miss('q4', 'Beta', ['Native Slack app']),
		];
		const out = buildCompetitorWinLoss(results, queryMap);

		expect(out.totalQueries).toBe(5);
		expect(out.brand).toMatchObject({ primaryMentions: 1, secondaryMentions: 1, notMentioned: 3 });
		expect(out.brand.winRate).toBe(40); // (1+1)/5
		expect(out.competitors.map((c) => c.name)).toEqual(['Acme', 'Beta']);
		expect(out.competitors[0]).toMatchObject({ name: 'Acme', wins: 2, winRate: 40 });
	});

	it('groups + dedupes repeated reason themes with their prompt ids', () => {
		const results: WinLossResultInput[] = [
			miss('q2', 'Acme', ['Better pricing', 'More integrations']),
			miss('q3', 'Acme', ['better pricing  ', 'Stronger brand']),
			miss('q4', 'Acme', ['BETTER PRICING']),
		];
		const out = buildCompetitorWinLoss(results, queryMap);
		const acme = out.competitors[0];

		const topReason = acme.reasons[0];
		expect(topReason.count).toBe(3); // "better pricing" across q2, q3, q4
		expect(topReason.reason.toLowerCase()).toBe('better pricing');
		expect(new Set(topReason.queryIds)).toEqual(new Set(['q2', 'q3', 'q4']));
		// other themes appear once each, ordered after
		expect(acme.reasons.slice(1).every((r) => r.count === 1)).toBe(true);
	});

	it('lists representative prompts (deduped) with resolved query text', () => {
		const results: WinLossResultInput[] = [
			miss('q2', 'Acme', ['x']),
			miss('q3', 'Acme', ['y']),
		];
		const out = buildCompetitorWinLoss(results, queryMap);
		const acme = out.competitors[0];
		expect(acme.prompts).toEqual([
			{ queryId: 'q2', query: 'crm alternatives' },
			{ queryId: 'q3', query: 'cheapest crm' },
		]);
	});

	it('ignores misses with no named competitor', () => {
		const results: WinLossResultInput[] = [
			{ queryId: 'q2', position: 'not_mentioned' },
			miss('q3', 'Acme', ['x']),
		];
		const out = buildCompetitorWinLoss(results, queryMap);
		expect(out.competitors).toHaveLength(1);
		expect(out.brand.notMentioned).toBe(2);
	});
});
