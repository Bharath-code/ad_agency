import { describe, expect, it } from 'vitest';
import {
	type ActionItemInput,
	buildActionQueue,
	computeMovement,
	positionRank,
	scoreActionPriority,
} from '../../convex/lib/actionQueue';

function action(over: Partial<ActionItemInput> & { _id: string; queryId: string }): ActionItemInput {
	return {
		type: 'positioning',
		title: 'Fix it',
		status: 'planned',
		baselinePosition: 'not_mentioned',
		createdAt: 1,
		updatedAt: 1,
		...over,
	};
}

const queryMap = new Map<string, string>([
	['q1', 'best crm for startups'],
	['q2', 'crm alternatives'],
	['q3', 'cheapest crm'],
]);

describe('positionRank', () => {
	it('orders not_mentioned < secondary < primary', () => {
		expect(positionRank('not_mentioned')).toBeLessThan(positionRank('secondary'));
		expect(positionRank('secondary')).toBeLessThan(positionRank('primary'));
	});
});

describe('computeMovement', () => {
	it('is pending until a newer scan exists (current null)', () => {
		const m = computeMovement('not_mentioned', null);
		expect(m).toEqual({ from: 'not_mentioned', to: null, direction: 'pending', delta: 0 });
	});

	it('improved when the prompt climbs', () => {
		const m = computeMovement('not_mentioned', 'primary');
		expect(m.direction).toBe('improved');
		expect(m.delta).toBe(2);
	});

	it('declined when the prompt slips', () => {
		expect(computeMovement('primary', 'secondary').direction).toBe('declined');
	});

	it('unchanged when the prompt holds', () => {
		expect(computeMovement('secondary', 'secondary').direction).toBe('unchanged');
	});
});

describe('scoreActionPriority', () => {
	it('ranks an outright miss above a weak secondary mention', () => {
		const miss = scoreActionPriority({ baselinePosition: 'not_mentioned' });
		const weak = scoreActionPriority({ baselinePosition: 'secondary' });
		expect(miss).toBeGreaterThan(weak);
	});

	it('rewards confidence and an active competitor', () => {
		const base = scoreActionPriority({ baselinePosition: 'not_mentioned' });
		const withConf = scoreActionPriority({
			baselinePosition: 'not_mentioned',
			baselineConfidence: 'high',
		});
		const withBoth = scoreActionPriority({
			baselinePosition: 'not_mentioned',
			baselineConfidence: 'high',
			competitorAtCreation: 'Acme',
		});
		expect(withConf).toBeGreaterThan(base);
		expect(withBoth).toBeGreaterThan(withConf);
		// not_mentioned(3) + high(2) + competitor(1)
		expect(withBoth).toBe(6);
	});

	it('ignores a blank competitor string', () => {
		expect(
			scoreActionPriority({ baselinePosition: 'secondary', competitorAtCreation: '   ' }),
		).toBe(1);
	});
});

describe('buildActionQueue', () => {
	it('returns a polished empty shape with no actions', () => {
		const out = buildActionQueue([], new Map(), queryMap);
		expect(out.items).toEqual([]);
		expect(out.topPriority).toEqual([]);
		expect(out.counts).toEqual({ planned: 0, shipped: 0, ignored: 0, archived: 0 });
	});

	it('counts statuses, resolves query text, and sorts planned-first by priority', () => {
		const actions = [
			action({ _id: 'a1', queryId: 'q1', baselinePosition: 'secondary' }), // score 1
			action({ _id: 'a2', queryId: 'q2', baselinePosition: 'not_mentioned' }), // score 3
			action({ _id: 'a3', queryId: 'q3', status: 'archived' }),
		];
		const out = buildActionQueue(actions, new Map(), queryMap);

		expect(out.counts).toEqual({ planned: 2, shipped: 0, ignored: 0, archived: 1 });
		expect(out.items.map((i) => i._id)).toEqual(['a2', 'a1', 'a3']); // a2 higher score, archived last
		expect(out.items[0].queryText).toBe('crm alternatives');
	});

	it('surfaces only the top 3 planned actions, highest score first', () => {
		const actions = [
			action({ _id: 'p1', queryId: 'q1', baselinePosition: 'secondary' }), // 1
			action({ _id: 'p2', queryId: 'q2', baselinePosition: 'not_mentioned', baselineConfidence: 'high' }), // 5
			action({ _id: 'p3', queryId: 'q3', baselinePosition: 'not_mentioned' }), // 3
			action({ _id: 'p4', queryId: 'q1', baselinePosition: 'not_mentioned', competitorAtCreation: 'Acme' }), // 4
			action({ _id: 's1', queryId: 'q2', status: 'shipped', baselinePosition: 'not_mentioned', baselineConfidence: 'high' }),
		];
		const out = buildActionQueue(actions, new Map(), queryMap);

		expect(out.topPriority).toHaveLength(3);
		expect(out.topPriority.map((i) => i._id)).toEqual(['p2', 'p4', 'p3']);
		expect(out.topPriority.every((i) => i.status === 'planned')).toBe(true);
	});

	it('shows movement only after a genuinely new scan (baseline scan != latest)', () => {
		const actions = [
			action({ _id: 'a1', queryId: 'q1', status: 'shipped', baselinePosition: 'not_mentioned', baselineScanId: 'scan-1' }),
		];
		const positions = new Map([['q1', 'primary' as const]]);

		// Same scan as baseline -> pending (no re-scan yet)
		const same = buildActionQueue(actions, positions, queryMap, 'scan-1');
		expect(same.items[0].movement.direction).toBe('pending');
		expect(same.items[0].currentPosition).toBeNull();

		// A newer scan exists -> real before/after
		const rescanned = buildActionQueue(actions, positions, queryMap, 'scan-2');
		expect(rescanned.items[0].movement).toMatchObject({
			from: 'not_mentioned',
			to: 'primary',
			direction: 'improved',
		});
		expect(rescanned.items[0].currentPosition).toBe('primary');
	});
});
