import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { AnalysisPrompt, AnalysisResult, LLMProvider } from './types';

/**
 * OpenAI Provider using Vercel AI SDK
 */
export function createOpenAIProvider(apiKey: string): LLMProvider {
	const openai = createOpenAI({ apiKey });

	return {
		name: 'openai',
		costPerCall: 0.0015, // Estimated cost per call in USD

		async analyze(prompt: AnalysisPrompt): Promise<AnalysisResult> {
			const startTime = Date.now();

			const { text, usage } = await generateText({
				model: openai('gpt-4o-mini'),
				system: prompt.systemPrompt,
				prompt: prompt.userPrompt,
				temperature: prompt.temperature ?? 0.3,
				maxOutputTokens: prompt.maxTokens ?? 500,
			});
			const normalizedUsage = usage as
				| {
						inputTokens?: number;
						outputTokens?: number;
						promptTokens?: number;
						completionTokens?: number;
				  }
				| undefined;

			return {
				content: text,
				provider: 'openai',
				latencyMs: Date.now() - startTime,
				tokenUsage: {
					input: normalizedUsage?.inputTokens ?? normalizedUsage?.promptTokens ?? 0,
					output: normalizedUsage?.outputTokens ?? normalizedUsage?.completionTokens ?? 0,
				},
			};
		},

		async isHealthy(): Promise<boolean> {
			try {
				// Simple health check - try a minimal completion
				await generateText({
					model: openai('gpt-4o-mini'),
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
