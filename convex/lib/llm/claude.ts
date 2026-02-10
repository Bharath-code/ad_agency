import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import type { AnalysisPrompt, AnalysisResult, LLMProvider } from './types';

export function createClaudeProvider(apiKey: string): LLMProvider {
	const anthropic = createAnthropic({ apiKey });

	return {
		name: 'claude',
		costPerCall: 0.003, // Claude 3.5 Sonnet pricing

		async analyze(prompt: AnalysisPrompt): Promise<AnalysisResult> {
			const startTime = Date.now();

			const { text, usage } = await generateText({
				model: anthropic('claude-sonnet-4-20250514'),
				system: prompt.systemPrompt,
				prompt: prompt.userPrompt,
				temperature: prompt.temperature ?? 0.3,
				maxOutputTokens: prompt.maxTokens ?? 500,
			});

			return {
				content: text,
				provider: 'claude',
				latencyMs: Date.now() - startTime,
				tokenUsage: {
					input: usage?.inputTokens ?? 0,
					output: usage?.outputTokens ?? 0,
				},
			};
		},

		async isHealthy(): Promise<boolean> {
			try {
				await generateText({
					model: anthropic('claude-sonnet-4-20250514'),
					prompt: 'Say "ok"',
					maxOutputTokens: 5,
				});
				return true;
			} catch {
				return false;
			}
		},
	};
}
