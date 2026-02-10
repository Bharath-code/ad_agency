'use node';

import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { action } from './_generated/server';
import { requireUserForAction } from './lib/auth';
import { PLAN_LIMITS } from './lib/dodo';
import { createClaudeProvider } from './lib/llm/claude';
import { createOpenAIProvider } from './lib/llm/openai';
import { ProviderRouter } from './lib/llm/router';
import {
	type BrandVisibilityResponse,
	type CompetitorAdvantageResponse,
	type ConfidenceResult,
	type PositioningFixResponse,
	parseJSONResponse,
} from './lib/llm/types';
import {
	getBrandVisibilityPrompt,
	getCompetitorAdvantagePrompt,
	getPositioningFixPrompt,
	LLM_CONFIG,
	SYSTEM_PROMPT,
} from './lib/prompts';

function deriveConfidence(
	totalRunsPlanned: number,
	successfulRuns: number,
	consensusRatio: number,
): 'high' | 'medium' | 'low' {
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

async function analyzeWithConfidence(
	router: ProviderRouter,
	queryText: string,
	productName: string,
	productDescription: string,
): Promise<ConfidenceResult<BrandVisibilityResponse>> {
	const runConfigs = [{ temperature: 0.2 }, { temperature: 0.3 }, { temperature: 0.4 }];

	const runs = await Promise.all(
		runConfigs.map(async (config) => {
			try {
				const result = await router.analyze({
					systemPrompt: SYSTEM_PROMPT,
					userPrompt: getBrandVisibilityPrompt(queryText, productName, productDescription),
					temperature: config.temperature,
					maxTokens: LLM_CONFIG.maxTokens,
				});
				return parseJSONResponse<BrandVisibilityResponse>(result.content);
			} catch {
				return null;
			}
		}),
	);

	const successfulRuns = runs.filter((r): r is BrandVisibilityResponse => r !== null);

	if (successfulRuns.length === 0) {
		throw new Error('All visibility analysis runs failed');
	}

	const positionCounts = {
		primary: successfulRuns.filter((r) => r.position === 'primary').length,
		secondary: successfulRuns.filter((r) => r.position === 'secondary').length,
		not_mentioned: successfulRuns.filter((r) => r.position === 'not_mentioned').length,
	};

	const sortedPositions = Object.entries(positionCounts).sort(([, a], [, b]) => b - a);
	const consensusPosition = sortedPositions[0][0] as 'primary' | 'secondary' | 'not_mentioned';
	const consensusVotes = sortedPositions[0][1];

	const mentionedCount = successfulRuns.filter((r) => r.mentioned).length;
	const consensusRatio = consensusVotes / successfulRuns.length;
	const confidence = deriveConfidence(runConfigs.length, successfulRuns.length, consensusRatio);

	const consensusResult: BrandVisibilityResponse = {
		mentioned: mentionedCount > successfulRuns.length / 2,
		position: consensusPosition,
		context: successfulRuns[0].context,
		confidence,
	};

	return { result: consensusResult, confidence, runs: successfulRuns.length, cached: false };
}

async function analyzeCompetitorWithConfidence(
	router: ProviderRouter,
	queryText: string,
	productName: string,
	competitors: string[],
): Promise<ConfidenceResult<CompetitorAdvantageResponse>> {
	const runConfigs = [{ temperature: 0.2 }, { temperature: 0.3 }, { temperature: 0.4 }];

	const runs = await Promise.all(
		runConfigs.map(async (config) => {
			try {
				const result = await router.analyze({
					systemPrompt: SYSTEM_PROMPT,
					userPrompt: getCompetitorAdvantagePrompt(queryText, productName, competitors),
					temperature: config.temperature,
					maxTokens: LLM_CONFIG.maxTokens,
				});
				return parseJSONResponse<CompetitorAdvantageResponse>(result.content);
			} catch {
				return null;
			}
		}),
	);

	const successfulRuns = runs.filter((r): r is CompetitorAdvantageResponse => r !== null);

	if (successfulRuns.length === 0) {
		throw new Error('All competitor analysis runs failed');
	}

	const winnerCounts: Record<string, number> = {};
	const allReasons: string[] = [];

	for (const run of successfulRuns) {
		winnerCounts[run.winner] = (winnerCounts[run.winner] || 0) + 1;
		allReasons.push(...run.reasons);
	}

	const winnerResult = Object.entries(winnerCounts).sort(([, a], [, b]) => b - a)[0];
	const winner = winnerResult[0];
	const winnerVotes = winnerResult[1];

	const reasonCounts: Record<string, number> = {};
	for (const reason of allReasons) {
		const normalized = reason.toLowerCase().trim();
		reasonCounts[normalized] = (reasonCounts[normalized] || 0) + 1;
	}

	const topReasons = Object.entries(reasonCounts)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 3)
		.map(([reason]) => reason);

	while (topReasons.length < 3) {
		topReasons.push('insufficient signal');
	}

	const consensusResult: CompetitorAdvantageResponse = {
		winner,
		reasons: topReasons as [string, string, string],
	};

	const consensusRatio = winnerVotes / successfulRuns.length;
	const confidence = deriveConfidence(runConfigs.length, successfulRuns.length, consensusRatio);

	return { result: consensusResult, confidence, runs: successfulRuns.length, cached: false };
}

async function generateFixesWithConfidence(
	router: ProviderRouter,
	queryText: string,
	productName: string,
	productDescription: string,
	competitorWinner: string,
	competitorReasons: string[],
): Promise<ConfidenceResult<PositioningFixResponse>> {
	const runConfigs = [{ temperature: 0.2 }, { temperature: 0.3 }, { temperature: 0.4 }];

	const runs = await Promise.all(
		runConfigs.map(async (config) => {
			try {
				const result = await router.analyze({
					systemPrompt: SYSTEM_PROMPT,
					userPrompt: getPositioningFixPrompt(
						queryText,
						productName,
						productDescription,
						competitorWinner,
						competitorReasons,
					),
					temperature: config.temperature,
					maxTokens: LLM_CONFIG.maxTokens,
				});
				return parseJSONResponse<PositioningFixResponse>(result.content);
			} catch {
				return null;
			}
		}),
	);

	const successfulRuns = runs.filter((r): r is PositioningFixResponse => r !== null);

	if (successfulRuns.length === 0) {
		throw new Error('All fix generation runs failed');
	}

	const aggregateField = (field: keyof PositioningFixResponse) => {
		const counts = new Map<string, { votes: number; value: string }>();
		for (const run of successfulRuns) {
			const value = run[field]?.trim();
			if (!value) {
				continue;
			}

			const key = value.toLowerCase();
			const existing = counts.get(key);
			if (existing) {
				existing.votes += 1;
			} else {
				counts.set(key, { votes: 1, value });
			}
		}

		const topMatch = [...counts.values()].sort((a, b) => b.votes - a.votes)[0];
		return {
			value: topMatch?.value ?? '',
			votes: topMatch?.votes ?? 0,
		};
	};

	const positioningFix = aggregateField('positioningFix');
	const contentSuggestion = aggregateField('contentSuggestion');
	const messagingFix = aggregateField('messagingFix');

	const consensusResult: PositioningFixResponse = {
		positioningFix: positioningFix.value,
		contentSuggestion: contentSuggestion.value,
		messagingFix: messagingFix.value,
	};

	const consensusRatio =
		(positioningFix.votes + contentSuggestion.votes + messagingFix.votes) /
		(successfulRuns.length * 3);
	const confidence = deriveConfidence(runConfigs.length, successfulRuns.length, consensusRatio);

	return { result: consensusResult, confidence, runs: successfulRuns.length, cached: false };
}

export const runScan = action({
	args: { projectId: v.id('projects') },
	handler: async (
		ctx,
		args,
	): Promise<{ scanId: string; resultsCount: number; modelUsed: string; totalRuns: number }> => {
		const user = await requireUserForAction(ctx);
		const plan = user.plan as keyof typeof PLAN_LIMITS;
		const limit = PLAN_LIMITS[plan].scans;

		if (limit !== -1 && user.scansUsed >= limit) {
			throw new Error(`Scan limit reached (${limit}). Please upgrade your plan.`);
		}

		const project = await ctx.runQuery(api.projects.get, { projectId: args.projectId });
		if (!project) throw new Error('Project not found');

		const competitors = await ctx.runQuery(api.competitors.listByProject, {
			projectId: args.projectId,
		});
		const competitorNames = competitors.map((c: { name: string }) => c.name);

		const queries = await ctx.runQuery(api.intentQueries.listActive, { projectId: args.projectId });

		const scanId = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

		const openaiKey = process.env.OPENAI_API_KEY;
		const claudeKey = process.env.ANTHROPIC_API_KEY;

		if (!openaiKey) {
			throw new Error('OPENAI_API_KEY environment variable not set');
		}

		const providers = [createOpenAIProvider(openaiKey)];
		if (claudeKey) {
			providers.push(createClaudeProvider(claudeKey));
		}

		const router = new ProviderRouter(providers);

		let resultsCount = 0;
		let primaryMentions = 0;
		let secondaryMentions = 0;
		let totalRuns = 0;

		for (const query of queries) {
			try {
				const visibility = await analyzeWithConfidence(
					router,
					query.query,
					project.name,
					project.description,
				);

				totalRuns += visibility.runs;
				resultsCount++;

				if (visibility.result.position === 'primary') primaryMentions++;
				if (visibility.result.position === 'secondary') secondaryMentions++;

				let competitorData: { competitorMentioned?: string; competitorReasons?: string[] } = {};
				let fixes: { positioningFix?: string; contentSuggestion?: string; messagingFix?: string } =
					{};

				if (visibility.result.position === 'not_mentioned' && competitorNames.length > 0) {
					const competitor = await analyzeCompetitorWithConfidence(
						router,
						query.query,
						project.name,
						competitorNames,
					);

					competitorData = {
						competitorMentioned: competitor.result.winner,
						competitorReasons: competitor.result.reasons,
					};

					const fixResult = await generateFixesWithConfidence(
						router,
						query.query,
						project.name,
						project.description,
						competitor.result.winner,
						competitor.result.reasons,
					);

					fixes = fixResult.result;
				}

				await ctx.runMutation(api.results.saveResult, {
					projectId: args.projectId,
					queryId: query._id,
					scanId,
					model: router.getPrimaryProviderName(),
					mentioned: visibility.result.mentioned,
					position: visibility.result.position,
					context: visibility.result.context,
					confidence: visibility.result.confidence,
					rawResponse: JSON.stringify({ visibility, competitor: competitorData, fixes }),
					...competitorData,
					...fixes,
				});
			} catch (error) {
				console.error(`Error processing query "${query.query}":`, error);
			}
		}

		const totalQueries = queries.length;
		const visibilityScore =
			totalQueries > 0
				? Math.round(((primaryMentions * 2 + secondaryMentions * 1) / (totalQueries * 2)) * 100)
				: 0;

		await ctx.runMutation(api.projects.updateVisibilityScore, {
			projectId: args.projectId,
			score: visibilityScore,
		});

		await ctx.runMutation(internal.users.incrementScansUsed, { userId: user._id });

		return {
			scanId,
			resultsCount,
			modelUsed: router.getPrimaryProviderName(),
			totalRuns,
		};
	},
});
