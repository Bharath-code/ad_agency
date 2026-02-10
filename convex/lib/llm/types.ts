/**
 * LLM Provider Abstraction Layer
 * Supports pluggable LLM providers (OpenAI, Claude, Gemini)
 */

export interface LLMProvider {
	name: string;
	analyze(prompt: AnalysisPrompt): Promise<AnalysisResult>;
	isHealthy(): Promise<boolean>;
	costPerCall: number;
}

export interface AnalysisPrompt {
	systemPrompt: string;
	userPrompt: string;
	temperature?: number;
	maxTokens?: number;
	seed?: number;
}

export interface AnalysisResult {
	content: string;
	provider: string;
	latencyMs: number;
	tokenUsage: { input: number; output: number };
}

// Response types for structured output
export interface BrandVisibilityResponse {
	mentioned: boolean;
	position: 'primary' | 'secondary' | 'not_mentioned';
	context: string;
	confidence: 'high' | 'medium' | 'low';
}

export interface CompetitorAdvantageResponse {
	winner: string;
	reasons: [string, string, string];
}

export interface PositioningFixResponse {
	positioningFix: string;
	contentSuggestion: string;
	messagingFix: string;
}

// Confidence result wrapper
export interface ConfidenceResult<T> {
	result: T;
	confidence: 'high' | 'medium' | 'low';
	runs: number;
	cached: boolean;
}

/**
 * Parse JSON response from LLM, handling potential markdown code blocks
 */
export function parseJSONResponse<T>(content: string): T {
	let jsonStr = content.trim();
	if (jsonStr.startsWith('```json')) {
		jsonStr = jsonStr.slice(7);
	} else if (jsonStr.startsWith('```')) {
		jsonStr = jsonStr.slice(3);
	}
	if (jsonStr.endsWith('```')) {
		jsonStr = jsonStr.slice(0, -3);
	}
	return JSON.parse(jsonStr.trim());
}

/**
 * Cache entry interface for Convex storage
 */
export interface CacheEntry {
	key: string;
	value: string;
	createdAt: number;
	ttlSeconds: number;
}
