/**
 * Multi-model consensus + confidence math (Phase 4).
 *
 * Pure, dependency-free functions so they can be unit tested without the Convex
 * runtime. The scan action (`scans.ts`) composes these around live LLM calls.
 */

import type { BrandVisibilityResponse } from './llm/types';

export type Confidence = 'high' | 'medium' | 'low';
export type Position = 'primary' | 'secondary' | 'not_mentioned';

/**
 * Confidence blends how many planned runs actually succeeded (completion) with
 * how strongly the successful runs agreed (consensus). A provider that fails
 * half its runs caps completion at 0.5, which pulls confidence down even when
 * the surviving runs agree perfectly — partial failure should never read "high".
 */
export function deriveConfidence(
	totalRunsPlanned: number,
	successfulRuns: number,
	consensusRatio: number,
): Confidence {
	if (totalRunsPlanned === 0 || successfulRuns === 0) {
		return 'low';
	}
	const completionRatio = successfulRuns / totalRunsPlanned;
	const score = completionRatio * consensusRatio;

	if (score >= 0.85) {
		return 'high';
	}
	if (score >= 0.6) {
		return 'medium';
	}
	return 'low';
}

/** Per-model verdict after collapsing that model's repeated (multi-temperature) runs. */
export interface ModelVisibility {
	model: string;
	mentioned: boolean;
	position: Position;
	context: string;
	runCount: number; // runs planned for this model
	successfulRuns: number; // runs that returned parseable output
	consensusRatio: number; // votes for winning position / successful runs
	confidence: Confidence;
	failed: boolean; // true when no run succeeded
}

function topPosition(positions: Position[]): { position: Position; votes: number } {
	const counts: Record<Position, number> = { primary: 0, secondary: 0, not_mentioned: 0 };
	for (const p of positions) {
		counts[p] += 1;
	}
	const [position, votes] = (Object.entries(counts) as Array<[Position, number]>).sort(
		([, a], [, b]) => b - a,
	)[0];
	return { position, votes };
}

/**
 * Collapse one model's repeated runs into a single verdict. `runs` may contain
 * nulls for runs that failed to produce parseable output.
 */
export function consensusFromRuns(
	model: string,
	plannedRuns: number,
	runs: Array<BrandVisibilityResponse | null>,
): ModelVisibility {
	const successful = runs.filter((r): r is BrandVisibilityResponse => r !== null);

	if (successful.length === 0) {
		return {
			model,
			mentioned: false,
			position: 'not_mentioned',
			context: '',
			runCount: plannedRuns,
			successfulRuns: 0,
			consensusRatio: 0,
			confidence: 'low',
			failed: true,
		};
	}

	const { position, votes } = topPosition(successful.map((r) => r.position));
	const consensusRatio = votes / successful.length;
	const mentionedCount = successful.filter((r) => r.mentioned).length;
	const contextRun = successful.find((r) => r.position === position) ?? successful[0];

	return {
		model,
		mentioned: mentionedCount > successful.length / 2,
		position,
		context: contextRun.context,
		runCount: plannedRuns,
		successfulRuns: successful.length,
		consensusRatio,
		confidence: deriveConfidence(plannedRuns, successful.length, consensusRatio),
		failed: false,
	};
}

/** Cross-model aggregate stored on the result row + surfaced as the headline verdict. */
export interface AggregateVisibility {
	mentioned: boolean;
	position: Position;
	context: string;
	confidence: Confidence;
	runCount: number; // total planned runs across every model
	successfulRuns: number; // total successful runs across every model
	consensusRatio: number; // models agreeing on winning position / models that succeeded
	models: ModelVisibility[]; // every attempted model, including failures
	succeededModels: string[];
	failedModels: string[];
}

/**
 * Combine per-model verdicts into one cross-model verdict. Models that failed
 * entirely are kept in `models`/`failedModels` (so the failure stays visible)
 * but excluded from the position vote. The aggregate confidence uses total runs
 * across all models, so a dead provider drags confidence down rather than being
 * silently ignored.
 */
export function aggregateAcrossModels(perModel: ModelVisibility[]): AggregateVisibility {
	const runCount = perModel.reduce((sum, m) => sum + m.runCount, 0);
	const successfulRuns = perModel.reduce((sum, m) => sum + m.successfulRuns, 0);
	const succeeded = perModel.filter((m) => !m.failed);
	const failedModels = perModel.filter((m) => m.failed).map((m) => m.model);

	if (succeeded.length === 0) {
		return {
			mentioned: false,
			position: 'not_mentioned',
			context: '',
			confidence: 'low',
			runCount,
			successfulRuns: 0,
			consensusRatio: 0,
			models: perModel,
			succeededModels: [],
			failedModels,
		};
	}

	const { position, votes } = topPosition(succeeded.map((m) => m.position));
	const consensusRatio = votes / succeeded.length;
	const mentionedModels = succeeded.filter((m) => m.mentioned).length;
	const contextModel = succeeded.find((m) => m.position === position) ?? succeeded[0];

	return {
		mentioned: mentionedModels > succeeded.length / 2,
		position,
		context: contextModel.context,
		confidence: deriveConfidence(runCount, successfulRuns, consensusRatio),
		runCount,
		successfulRuns,
		consensusRatio,
		models: perModel,
		succeededModels: succeeded.map((m) => m.model),
		failedModels,
	};
}
