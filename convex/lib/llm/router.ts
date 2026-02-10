import type { AnalysisPrompt, AnalysisResult, LLMProvider } from './types';

/**
 * Provider Router with automatic failover
 */
export class ProviderRouter {
	private providers: LLMProvider[];
	private primaryIndex = 0;

	constructor(providers: LLMProvider[]) {
		this.providers = providers;
	}

	async analyze(prompt: AnalysisPrompt): Promise<AnalysisResult> {
		const errors: Error[] = [];

		for (let i = 0; i < this.providers.length; i++) {
			const provider = this.providers[(this.primaryIndex + i) % this.providers.length];

			try {
				const isHealthy = await provider.isHealthy();
				if (!isHealthy) {
					console.warn(`Provider ${provider.name} is unhealthy, trying next...`);
					continue;
				}

				return await provider.analyze(prompt);
			} catch (error) {
				console.error(`Provider ${provider.name} failed:`, error);
				errors.push(error instanceof Error ? error : new Error(String(error)));
			}
		}

		throw new Error(`All LLM providers failed. Errors: ${errors.map((e) => e.message).join('; ')}`);
	}

	getPrimaryProviderName(): string {
		return this.providers[this.primaryIndex]?.name ?? 'unknown';
	}

	getAllProviders(): LLMProvider[] {
		return this.providers;
	}
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	baseDelayMs = 1000,
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (attempt < maxRetries - 1) {
				const delay = baseDelayMs * 2 ** attempt;
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError ?? new Error('Retry failed with unknown error');
}

/**
 * Create a cache key for LLM responses
 */
export function createCacheKey(type: string, ...parts: string[]): string {
	const normalizedParts = parts.map((p) => p.toLowerCase().replace(/\s+/g, ' ').trim());
	return `llm_cache:${type}:${normalizedParts.join(':')}`;
}
