import type { AnalysisPrompt, AnalysisResult, LLMProvider } from './types';

interface CircuitBreakerState {
	failures: number;
	lastFailureTime: number;
	isOpen: boolean;
}

const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_RESET_TIMEOUT_MS = 60 * 1000; // 1 minute
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_ATTEMPTS = 3;

/**
 * Circuit breaker for provider resilience
 */
class CircuitBreaker {
	private states: Map<string, CircuitBreakerState> = new Map();

	recordFailure(providerName: string): void {
		const state = this.getState(providerName);
		state.failures++;
		state.lastFailureTime = Date.now();
		state.isOpen = state.failures >= CIRCUIT_FAILURE_THRESHOLD;
		this.states.set(providerName, state);
	}

	recordSuccess(providerName: string): void {
		this.states.set(providerName, {
			failures: 0,
			lastFailureTime: 0,
			isOpen: false,
		});
	}

	isAvailable(providerName: string): boolean {
		const state = this.states.get(providerName);
		if (!state) return true;
		if (!state.isOpen) return true;

		// Check if circuit should be half-open
		if (Date.now() - state.lastFailureTime > CIRCUIT_RESET_TIMEOUT_MS) {
			return true;
		}
		return false;
	}

	private getState(providerName: string): CircuitBreakerState {
		return (
			this.states.get(providerName) ?? {
				failures: 0,
				lastFailureTime: 0,
				isOpen: false,
			}
		);
	}
}

const circuitBreaker = new CircuitBreaker();

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries = RETRY_MAX_ATTEMPTS,
	baseDelayMs = RETRY_BASE_DELAY_MS,
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
 * Provider Router with automatic failover, circuit breaker, and retry
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

			// Check circuit breaker
			if (!circuitBreaker.isAvailable(provider.name)) {
				console.warn(`Circuit open for provider ${provider.name}, skipping...`);
				continue;
			}

			try {
				const isHealthy = await provider.isHealthy();
				if (!isHealthy) {
					circuitBreaker.recordFailure(provider.name);
					console.warn(`Provider ${provider.name} is unhealthy, trying next...`);
					continue;
				}

				const result = await withRetry(async () => {
					return await provider.analyze(prompt);
				});

				circuitBreaker.recordSuccess(provider.name);
				return result;
			} catch (error) {
				console.error(`Provider ${provider.name} failed:`, error);
				circuitBreaker.recordFailure(provider.name);
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
