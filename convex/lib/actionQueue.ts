/**
 * Action queue aggregation (Phase 7).
 *
 * Turns stored action items into a dashboard-ready view: each item is joined to
 * the latest scan's standing for its prompt to compute before/after movement,
 * scored for priority, and the top planned actions are surfaced. Pure and
 * dependency-free for unit testing; `actionItems.ts` composes it over DB rows.
 */

import type { Confidence, Position } from './consensus';

export type ActionType = 'positioning' | 'content' | 'proof' | 'comparison' | 'source';
export type ActionStatus = 'planned' | 'shipped' | 'ignored' | 'archived';

export const ACTION_TYPES: readonly ActionType[] = [
	'positioning',
	'content',
	'proof',
	'comparison',
	'source',
] as const;

/** Minimal shape read from a stored action row (a Convex `Doc<'actionItems'>` satisfies it). */
export interface ActionItemInput {
	_id: string;
	queryId: string;
	type: ActionType;
	title: string;
	detail?: string;
	status: ActionStatus;
	baselinePosition: Position;
	baselineScanId?: string;
	baselineConfidence?: Confidence;
	competitorAtCreation?: string;
	createdAt: number;
	updatedAt: number;
	shippedAt?: number;
}

export type MovementDirection = 'improved' | 'declined' | 'unchanged' | 'pending';

export interface Movement {
	from: Position;
	to: Position | null; // null until a newer scan exists for the prompt
	direction: MovementDirection;
	delta: number; // rank(to) - rank(from); 0 when pending
}

export interface ActionQueueItem extends ActionItemInput {
	queryText: string;
	currentPosition: Position | null;
	movement: Movement;
	priorityScore: number;
}

export interface ActionQueueView {
	items: ActionQueueItem[]; // every action, sorted for display
	topPriority: ActionQueueItem[]; // up to 3 highest-impact planned actions
	counts: Record<ActionStatus, number>;
}

/** Ordinal rank so positions can be compared/subtracted. Higher = more visible. */
export function positionRank(position: Position): number {
	switch (position) {
		case 'primary':
			return 2;
		case 'secondary':
			return 1;
		default:
			return 0;
	}
}

/**
 * Before/after movement for a prompt. `current` is null until a scan newer than
 * the action's baseline exists, in which case the direction is `pending`.
 */
export function computeMovement(baseline: Position, current: Position | null): Movement {
	if (current === null) {
		return { from: baseline, to: null, direction: 'pending', delta: 0 };
	}
	const delta = positionRank(current) - positionRank(baseline);
	const direction: MovementDirection =
		delta > 0 ? 'improved' : delta < 0 ? 'declined' : 'unchanged';
	return { from: baseline, to: current, direction, delta };
}

/**
 * Derived impact score (Phase 7, AC4). Higher = more worth doing now.
 * Weights chosen with the user: a prompt the brand loses outright is worth more
 * than a shaky secondary mention, a high-confidence miss is more trustworthy
 * signal, and a prompt an active competitor owns is more urgent.
 */
export function scoreActionPriority(item: {
	baselinePosition: Position;
	baselineConfidence?: Confidence;
	competitorAtCreation?: string;
}): number {
	const positionWeight =
		item.baselinePosition === 'not_mentioned' ? 3 : item.baselinePosition === 'secondary' ? 1 : 0;

	const confidenceWeight =
		item.baselineConfidence === 'high' ? 2 : item.baselineConfidence === 'medium' ? 1 : 0;

	const competitorPresence = item.competitorAtCreation?.trim() ? 1 : 0;

	return positionWeight + confidenceWeight + competitorPresence;
}

const STATUS_ORDER: Record<ActionStatus, number> = {
	planned: 0,
	shipped: 1,
	ignored: 2,
	archived: 3,
};

export function buildActionQueue(
	actions: ActionItemInput[],
	currentPositionByQuery: Map<string, Position>,
	queryMap: Map<string, string>,
	latestScanId: string | null = null,
): ActionQueueView {
	const counts: Record<ActionStatus, number> = {
		planned: 0,
		shipped: 0,
		ignored: 0,
		archived: 0,
	};

	const items: ActionQueueItem[] = actions.map((action) => {
		counts[action.status] += 1;
		// No genuine "after" until a scan newer than the action's baseline exists.
		const rescanned = !action.baselineScanId || action.baselineScanId !== latestScanId;
		const current = rescanned ? (currentPositionByQuery.get(action.queryId) ?? null) : null;
		return {
			...action,
			queryText: queryMap.get(action.queryId) ?? '',
			currentPosition: current,
			movement: computeMovement(action.baselinePosition, current),
			priorityScore: scoreActionPriority(action),
		};
	});

	items.sort((a, b) => {
		if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
			return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
		}
		if (b.priorityScore !== a.priorityScore) {
			return b.priorityScore - a.priorityScore;
		}
		return b.createdAt - a.createdAt;
	});

	const topPriority = items
		.filter((item) => item.status === 'planned')
		.sort((a, b) =>
			b.priorityScore !== a.priorityScore
				? b.priorityScore - a.priorityScore
				: b.createdAt - a.createdAt,
		)
		.slice(0, 3);

	return { items, topPriority, counts };
}
