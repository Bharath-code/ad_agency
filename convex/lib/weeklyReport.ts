/**
 * Weekly report shaping (Phase 8).
 *
 * `buildWeeklyReport` derives the entire report payload — score movement, new
 * competitor wins, and the top recommended fixes — from the *typed* dashboard
 * summary plus the previous report. It is pure: no DB, no email, no clock. The
 * Convex shell (`emails.sendWeeklyReport`) gathers the inputs, renders the
 * template, sends, and records send status; everything decidable lives here so
 * it can be unit-tested without a backend (acceptance criterion: "report
 * generation works without sending email in tests").
 */

import type { Confidence } from './consensus';

/** Subset of a recommended-fix row the report reads from. */
export interface ReportFixInput {
	positioningFix?: string;
	contentSuggestion?: string;
	messagingFix?: string;
}

/** Subset of a miss row the report reads from. */
export interface ReportMissInput {
	query: string;
	competitorMentioned?: string;
}

/** Subset of a win row the report reads from. */
export interface ReportWinInput {
	query: string;
	confidence?: Confidence;
}

/** Minimal slice of the dashboard summary the report needs. */
export interface WeeklyReportSummaryInput {
	visibilityScore: number;
	topWins: ReportWinInput[];
	topMisses: ReportMissInput[];
	recommendedFixes: ReportFixInput[];
}

/** Previously stored report (null on the first run for a project). */
export interface PreviousReportInput {
	currentScore: number;
	newCompetitorMentions: string[];
}

export interface WeeklyReport {
	previousScore: number;
	currentScore: number;
	scoreChange: number;
	topWins: string[];
	topMisses: string[];
	topFixes: string[];
	newCompetitorMentions: string[];
}

const DEFAULT_LIMIT = 3;

/** First non-empty fix per row → up to `limit` strings. */
export function selectTopFixes(fixes: ReportFixInput[], limit = DEFAULT_LIMIT): string[] {
	return fixes
		.map((fix) => fix.positioningFix ?? fix.contentSuggestion ?? fix.messagingFix)
		.filter((fix): fix is string => Boolean(fix && fix.trim()))
		.slice(0, limit);
}

const normalize = (name: string): string => name.trim().toLowerCase();

/**
 * Competitors winning a query this week that were not recorded in the previous
 * report — the "new competitor wins" story. Case-insensitive dedup; the first
 * spelling seen is preserved for display.
 */
export function diffCompetitorMentions(
	misses: ReportMissInput[],
	previousMentions: string[],
): string[] {
	const seenBefore = new Set(previousMentions.map(normalize));
	const out: string[] = [];
	const added = new Set<string>();

	for (const miss of misses) {
		const name = miss.competitorMentioned?.trim();
		if (!name) continue;
		const key = normalize(name);
		if (seenBefore.has(key) || added.has(key)) continue;
		added.add(key);
		out.push(name);
	}

	return out;
}

export function buildWeeklyReport(
	summary: WeeklyReportSummaryInput,
	previousReport: PreviousReportInput | null,
	limit = DEFAULT_LIMIT,
): WeeklyReport {
	const previousScore = previousReport?.currentScore ?? 0;
	const currentScore = summary.visibilityScore;

	return {
		previousScore,
		currentScore,
		scoreChange: currentScore - previousScore,
		topWins: summary.topWins.slice(0, limit).map((w) => w.query),
		topMisses: summary.topMisses.slice(0, limit).map((m) => m.query),
		topFixes: selectTopFixes(summary.recommendedFixes, limit),
		newCompetitorMentions: diffCompetitorMentions(
			summary.topMisses,
			previousReport?.newCompetitorMentions ?? [],
		),
	};
}
