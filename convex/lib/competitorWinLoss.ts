/**
 * Competitor win/loss aggregation (Phase 6).
 *
 * Groups a scan's missed prompts by the winning competitor, then folds each
 * competitor's reasons into deduplicated themes that carry the prompt ids they
 * came from — so the UI can drill from a reason theme straight into the evidence
 * for any prompt where it appeared. Pure and dependency-free for unit testing;
 * `results.ts` composes it over the latest scan's rows.
 */

import type { Position } from './consensus';
import { normalizeReason } from './competitorConsensus';

/** Minimal shape read from a stored result row (a Convex `Doc<'results'>` satisfies it). */
export interface WinLossResultInput {
	queryId: string;
	position: Position;
	competitorMentioned?: string;
	competitorReasons?: string[];
}

/** A reason theme for one competitor, with the prompts that cited it. */
export interface CompetitorReasonGroup {
	reason: string; // representative original text
	count: number; // distinct prompts citing this theme
	queryIds: string[]; // prompts where it appeared (drill-into-evidence targets)
}

export interface CompetitorWinLossEntry {
	name: string;
	wins: number; // missed prompts this competitor won
	winRate: number; // wins / totalQueries (%)
	reasons: CompetitorReasonGroup[]; // grouped + deduped, by count desc
	prompts: Array<{ queryId: string; query: string }>; // representative missed prompts
}

export interface CompetitorWinLoss {
	totalQueries: number;
	brand: {
		primaryMentions: number;
		secondaryMentions: number;
		notMentioned: number;
		winRate: number;
	};
	competitors: CompetitorWinLossEntry[];
}

function pct(part: number, whole: number): number {
	return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

interface CompetitorAccumulator {
	name: string;
	wins: number;
	prompts: Array<{ queryId: string; query: string }>;
	reasons: Map<string, CompetitorReasonGroup>;
}

export function buildCompetitorWinLoss(
	results: WinLossResultInput[],
	queryMap: Map<string, string>,
): CompetitorWinLoss {
	const totalQueries = results.length;

	let primaryMentions = 0;
	let secondaryMentions = 0;
	let notMentioned = 0;

	const byCompetitor = new Map<string, CompetitorAccumulator>();

	for (const result of results) {
		if (result.position === 'primary') {
			primaryMentions++;
			continue;
		}
		if (result.position === 'secondary') {
			secondaryMentions++;
			continue;
		}

		notMentioned++;

		const name = result.competitorMentioned?.trim();
		if (!name) continue;

		let acc = byCompetitor.get(name);
		if (!acc) {
			acc = { name, wins: 0, prompts: [], reasons: new Map() };
			byCompetitor.set(name, acc);
		}

		acc.wins++;
		acc.prompts.push({ queryId: result.queryId, query: queryMap.get(result.queryId) ?? '' });

		for (const raw of result.competitorReasons ?? []) {
			const value = raw?.trim();
			if (!value) continue;
			const key = normalizeReason(value);
			const group = acc.reasons.get(key);
			if (group) {
				// A single prompt can repeat a reason; count distinct prompts only.
				if (!group.queryIds.includes(result.queryId)) {
					group.queryIds.push(result.queryId);
					group.count += 1;
				}
			} else {
				acc.reasons.set(key, { reason: value, count: 1, queryIds: [result.queryId] });
			}
		}
	}

	const competitors: CompetitorWinLossEntry[] = [...byCompetitor.values()]
		.map((acc) => ({
			name: acc.name,
			wins: acc.wins,
			winRate: pct(acc.wins, totalQueries),
			reasons: [...acc.reasons.values()].sort((a, b) => b.count - a.count),
			prompts: acc.prompts,
		}))
		.sort((a, b) => b.wins - a.wins);

	return {
		totalQueries,
		brand: {
			primaryMentions,
			secondaryMentions,
			notMentioned,
			winRate: pct(primaryMentions + secondaryMentions, totalQueries),
		},
		competitors,
	};
}
