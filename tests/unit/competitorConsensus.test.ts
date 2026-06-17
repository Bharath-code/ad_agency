import { describe, expect, it } from 'vitest';
import { consensusCompetitor } from '../../convex/lib/competitorConsensus';
import type { CompetitorAdvantageResponse } from '../../convex/lib/llm/types';

function run(winner: string, reasons: string[]): CompetitorAdvantageResponse {
	const padded = [...reasons];
	while (padded.length < 3) padded.push('');
	return { winner, reasons: [padded[0], padded[1], padded[2]] };
}

describe('consensusCompetitor', () => {
	it('returns the majority winner across all provider runs', () => {
		const result = consensusCompetitor(
			[
				run('Acme', ['Better pricing', 'More integrations']),
				run('Acme', ['Better pricing', 'Stronger brand']),
				run('Beta', ['Cheaper']),
			],
			6,
		);
		expect(result.winner).toBe('Acme');
		// 2 of 3 successful runs voted Acme
		expect(result.consensusRatio).toBeCloseTo(2 / 3);
		expect(result.successfulRuns).toBe(3);
	});

	it('orders reason themes by frequency and keeps original casing', () => {
		const result = consensusCompetitor(
			[
				run('Acme', ['Better pricing', 'More integrations']),
				run('Acme', ['better pricing  ', 'Social proof']),
				run('Acme', ['BETTER PRICING', 'More integrations']),
			],
			3,
		);
		expect(result.winner).toBe('Acme');
		// "better pricing" cited 3x (normalized), "more integrations" 2x
		expect(result.reasonThemes[0]).toMatchObject({ count: 3 });
		expect(result.reasonThemes[0].reason.toLowerCase()).toBe('better pricing');
		expect(result.reasonThemes[1]).toMatchObject({ reason: 'More integrations', count: 2 });
		// reasons mirrors the ordered themes as plain strings
		expect(result.reasons.slice(0, 2).map((r) => r.toLowerCase())).toEqual([
			'better pricing',
			'more integrations',
		]);
	});

	it('drops to low confidence when completion is poor across models', () => {
		// 6 planned, only 2 succeeded -> completion 0.33 caps confidence even if both agree
		const result = consensusCompetitor([run('Acme', ['x']), run('Acme', ['x'])], 6);
		expect(result.confidence).toBe('low');
	});

	it('is high confidence when every planned run succeeds and agrees', () => {
		const result = consensusCompetitor(
			[run('Acme', ['a']), run('Acme', ['a']), run('Acme', ['a'])],
			3,
		);
		expect(result.confidence).toBe('high');
	});

	it('ignores empty reason strings', () => {
		const result = consensusCompetitor([run('Acme', ['Real reason'])], 1);
		expect(result.reasonThemes).toHaveLength(1);
		expect(result.reasonThemes[0].reason).toBe('Real reason');
	});

	it('returns an empty low-confidence verdict when there are no successful runs', () => {
		const result = consensusCompetitor([], 6);
		expect(result.winner).toBe('');
		expect(result.successfulRuns).toBe(0);
		expect(result.reasonThemes).toEqual([]);
		expect(result.confidence).toBe('low');
	});
});
