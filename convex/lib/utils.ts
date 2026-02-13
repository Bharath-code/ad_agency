/**
 * Visibility Score Utilities
 *
 * Formula: ((primaryMentions * 2 + secondaryMentions * 1) / (totalQueries * 2)) * 100
 */

export interface ScoreInput {
	primaryMentions: number;
	secondaryMentions: number;
	totalQueries: number;
}

export function calculateVisibilityScore(input: ScoreInput): number {
	const { primaryMentions, secondaryMentions, totalQueries } = input;

	if (totalQueries === 0) return 0;

	return Math.round(((primaryMentions * 2 + secondaryMentions * 1) / (totalQueries * 2)) * 100);
}

export function getScoreLabel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
	if (score >= 70) return 'excellent';
	if (score >= 50) return 'good';
	if (score >= 25) return 'fair';
	return 'poor';
}

export function getScoreColor(score: number): string {
	if (score >= 70) return 'green';
	if (score >= 50) return 'blue';
	if (score >= 25) return 'yellow';
	return 'red';
}
