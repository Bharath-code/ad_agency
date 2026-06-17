/**
 * Cross-model competitor consensus (Phase 6).
 *
 * Collapses every provider's competitor-advantage runs (each model sampled at
 * several temperatures) into one verdict: which competitor wins, and the reason
 * themes the models agree on. Pure and dependency-free so it can be unit tested
 * without the Convex runtime — `scans.ts` composes it around the live LLM calls.
 *
 * This is the Phase 4 follow-up: the "who wins & why" reasoning now reflects
 * agreement across configured providers rather than a single provider's answer.
 */

import { type Confidence, deriveConfidence } from './consensus';
import type { CompetitorAdvantageResponse } from './llm/types';

/** A reason cited for the competitor winning, with how many runs cited it. */
export interface CompetitorReasonTheme {
	reason: string; // representative original text (first seen, original casing)
	count: number; // runs that cited this reason (normalized match)
}

export interface CompetitorConsensus {
	winner: string;
	reasons: string[]; // ordered reason themes as plain strings (stored on the result row)
	reasonThemes: CompetitorReasonTheme[]; // same order, with citation counts
	consensusRatio: number; // runs voting for the winner / successful runs
	successfulRuns: number;
	confidence: Confidence;
}

const EMPTY: CompetitorConsensus = {
	winner: '',
	reasons: [],
	reasonThemes: [],
	consensusRatio: 0,
	successfulRuns: 0,
	confidence: 'low',
};

/** Lowercase, trim, and collapse internal whitespace so trivially different wordings merge. */
export function normalizeReason(reason: string): string {
	return reason.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * @param runs successful competitor responses across every provider + temperature
 * @param plannedRuns total runs attempted (providers x temperatures) — drives completion
 */
export function consensusCompetitor(
	runs: CompetitorAdvantageResponse[],
	plannedRuns: number,
): CompetitorConsensus {
	if (runs.length === 0) {
		return EMPTY;
	}

	const winnerCounts = new Map<string, number>();
	for (const run of runs) {
		const winner = run.winner.trim();
		if (!winner) continue;
		winnerCounts.set(winner, (winnerCounts.get(winner) ?? 0) + 1);
	}

	const topWinner = [...winnerCounts.entries()].sort(([, a], [, b]) => b - a)[0];
	const winner = topWinner?.[0] ?? '';
	const winnerVotes = topWinner?.[1] ?? 0;

	// Aggregate reasons by normalized key, keeping the first original spelling.
	const reasonMap = new Map<string, CompetitorReasonTheme>();
	for (const run of runs) {
		for (const raw of run.reasons) {
			const value = raw?.trim();
			if (!value) continue;
			const key = normalizeReason(value);
			const existing = reasonMap.get(key);
			if (existing) {
				existing.count += 1;
			} else {
				reasonMap.set(key, { reason: value, count: 1 });
			}
		}
	}

	const reasonThemes = [...reasonMap.values()].sort((a, b) => b.count - a.count);
	const consensusRatio = winnerVotes / runs.length;

	return {
		winner,
		reasons: reasonThemes.map((t) => t.reason),
		reasonThemes,
		consensusRatio,
		successfulRuns: runs.length,
		confidence: deriveConfidence(plannedRuns, runs.length, consensusRatio),
	};
}
