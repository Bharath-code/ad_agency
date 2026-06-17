/**
 * Evidence shaping (Phase 5).
 *
 * `toEvidence` builds the client-facing evidence object from a stored result row
 * by *explicitly* mapping the allowed fields. It never touches `rawResponse`, so
 * internal system prompts and provider API metadata (token usage, latency) can
 * never leak into the evidence view — the only way something reaches the client
 * is if it is named here.
 */

import type { Confidence, Position } from './consensus';

/** Per-model verdict as stored on a result row's `modelResults`. */
export interface EvidenceModel {
	model: string;
	position: Position;
	mentioned: boolean;
	runCount: number;
	successfulRuns: number;
	consensusRatio: number;
	confidence: Confidence;
}

/** Minimal shape of a stored result the mapper reads from (a Convex `Doc<'results'>` satisfies it). */
export interface EvidenceResultInput {
	queryId: string;
	scanId: string;
	model?: string;
	position: Position;
	mentioned: boolean;
	context: string;
	confidence: Confidence;
	runCount?: number;
	successfulRuns?: number;
	consensusRatio?: number;
	modelResults?: EvidenceModel[];
	competitorMentioned?: string;
	competitorReasons?: string[];
	positioningFix?: string;
	contentSuggestion?: string;
	messagingFix?: string;
	createdAt: number;
}

export interface PromptEvidence {
	queryId: string;
	queryText: string;
	scanId: string;
	model: string;
	position: Position;
	mentioned: boolean;
	context: string;
	confidence: Confidence;
	runCount: number;
	successfulRuns: number;
	consensusRatio: number;
	models: EvidenceModel[];
	competitorMentioned?: string;
	competitorReasons: string[];
	fixes: {
		positioningFix?: string;
		contentSuggestion?: string;
		messagingFix?: string;
	};
	createdAt: number;
}

export function toEvidence(result: EvidenceResultInput, queryText: string): PromptEvidence {
	return {
		queryId: result.queryId,
		queryText,
		scanId: result.scanId,
		model: result.model ?? 'unknown',
		position: result.position,
		mentioned: result.mentioned,
		context: result.context,
		confidence: result.confidence,
		runCount: result.runCount ?? 0,
		successfulRuns: result.successfulRuns ?? 0,
		consensusRatio: result.consensusRatio ?? 0,
		models: result.modelResults ?? [],
		competitorMentioned: result.competitorMentioned,
		competitorReasons: result.competitorReasons ?? [],
		fixes: {
			positioningFix: result.positioningFix,
			contentSuggestion: result.contentSuggestion,
			messagingFix: result.messagingFix,
		},
		createdAt: result.createdAt,
	};
}
