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

/**
 * Project URL validation
 *
 * Allowlists http/https only and relies on the WHATWG URL parser so unsafe
 * schemes (javascript:, data:, file:) and malformed input are rejected.
 */
export interface UrlValidationResult {
	valid: boolean;
	url?: string;
	error?: string;
}

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:']);
const MAX_URL_LENGTH = 2048;

export function validateProjectUrl(input: string): UrlValidationResult {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		return { valid: false, error: 'URL is required' };
	}
	if (trimmed.length > MAX_URL_LENGTH) {
		return { valid: false, error: 'URL is too long' };
	}

	const tryParse = (value: string): URL | null => {
		try {
			return new URL(value);
		} catch {
			return null;
		}
	};

	// Parse as-is first so unsafe schemes are caught before any normalization.
	let parsed = tryParse(trimmed);
	if (parsed && !ALLOWED_URL_PROTOCOLS.has(parsed.protocol)) {
		return { valid: false, error: 'URL must use http or https' };
	}
	// Bare domains (no scheme) default to https.
	if (!parsed) {
		parsed = tryParse(`https://${trimmed}`);
	}

	if (!parsed) {
		return { valid: false, error: 'Enter a valid URL' };
	}
	if (!ALLOWED_URL_PROTOCOLS.has(parsed.protocol)) {
		return { valid: false, error: 'URL must use http or https' };
	}
	if (!parsed.hostname.includes('.')) {
		return { valid: false, error: 'Enter a valid domain' };
	}

	return { valid: true, url: parsed.toString() };
}
