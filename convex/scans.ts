'use node';

import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { action, internalAction } from './_generated/server';
import { requireUserForAction } from './lib/auth';
import {
	type AggregateVisibility,
	aggregateAcrossModels,
	consensusFromRuns,
	deriveConfidence,
	type ModelVisibility,
} from './lib/consensus';
import { PLAN_LIMITS } from './lib/dodo';
import { createClaudeProvider } from './lib/llm/claude';
import { createOpenAIProvider } from './lib/llm/openai';
import { ProviderRouter } from './lib/llm/router';
import {
	type BrandVisibilityResponse,
	type CompetitorAdvantageResponse,
	type ConfidenceResult,
	type LLMProvider,
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
import { calculateVisibilityScore } from './lib/utils';

// Cache TTL for LLM responses (7 days) - infrastructure ready for future use
const _CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;

// Each model is sampled at several temperatures; agreement across these runs is
// the per-model confidence signal.
const VISIBILITY_RUN_TEMPERATURES = [0.2, 0.3, 0.4];

/**
 * Run one model's repeated visibility passes and collapse them into a single
 * per-model verdict. Never throws — a model that fails every run is reported as
 * a failed `ModelVisibility` so the caller can keep the other models' results.
 */
async function analyzeModelVisibility(
	provider: LLMProvider,
	queryText: string,
	productName: string,
	productDescription: string,
	productContext?: { url?: string; useCase?: string },
): Promise<ModelVisibility> {
	const userPrompt = getBrandVisibilityPrompt(
		queryText,
		productName,
		productDescription,
		productContext,
	);

	const runs = await Promise.all(
		VISIBILITY_RUN_TEMPERATURES.map(async (temperature) => {
			try {
				const result = await provider.analyze({
					systemPrompt: SYSTEM_PROMPT,
					userPrompt,
					temperature,
					maxTokens: LLM_CONFIG.maxTokens,
				});
				return parseJSONResponse<BrandVisibilityResponse>(result.content);
			} catch {
				return null;
			}
		}),
	);

	return consensusFromRuns(provider.name, VISIBILITY_RUN_TEMPERATURES.length, runs);
}

/**
 * Analyze brand visibility across every selected provider and aggregate into a
 * cross-model verdict. Throws only when no provider produced any usable run.
 */
async function analyzeVisibilityAcrossModels(
	providers: LLMProvider[],
	queryText: string,
	productName: string,
	productDescription: string,
	productContext?: { url?: string; useCase?: string },
): Promise<AggregateVisibility> {
	const perModel = await Promise.all(
		providers.map((provider) =>
			analyzeModelVisibility(
				provider,
				queryText,
				productName,
				productDescription,
				productContext,
			),
		),
	);

	const aggregate = aggregateAcrossModels(perModel);

	if (aggregate.succeededModels.length === 0) {
		throw new Error('All visibility analysis runs failed across every model');
	}

	return aggregate;
}

/** Flatten an aggregate verdict into the per-model fields stored on a result row. */
function toModelResults(aggregate: AggregateVisibility) {
	return aggregate.models.map((m) => ({
		model: m.model,
		position: m.position,
		mentioned: m.mentioned,
		runCount: m.runCount,
		successfulRuns: m.successfulRuns,
		consensusRatio: m.consensusRatio,
		confidence: m.confidence,
	}));
}

async function analyzeCompetitorWithConfidence(
	router: ProviderRouter,
	queryText: string,
	productName: string,
	competitors: string[],
	forcedProvider?: LLMProvider,
): Promise<ConfidenceResult<CompetitorAdvantageResponse>> {
	const runConfigs = [{ temperature: 0.2 }, { temperature: 0.3 }, { temperature: 0.4 }];

	const runs = await Promise.all(
		runConfigs.map(async (config) => {
			try {
				const analyzeArgs = {
					systemPrompt: SYSTEM_PROMPT,
					userPrompt: getCompetitorAdvantagePrompt(queryText, productName, competitors),
					temperature: config.temperature,
					maxTokens: LLM_CONFIG.maxTokens,
				};
				const result = forcedProvider
					? await forcedProvider.analyze(analyzeArgs)
					: await router.analyze(analyzeArgs);
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
	forcedProvider?: LLMProvider,
): Promise<ConfidenceResult<PositioningFixResponse>> {
	const runConfigs = [{ temperature: 0.2 }, { temperature: 0.3 }, { temperature: 0.4 }];

	const runs = await Promise.all(
		runConfigs.map(async (config) => {
			try {
				const analyzeArgs = {
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
				};
				const result = forcedProvider
					? await forcedProvider.analyze(analyzeArgs)
					: await router.analyze(analyzeArgs);
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
	args: { projectId: v.id('projects'), model: v.optional(v.string()) },
	handler: async (
		ctx,
		args,
	): Promise<{
		scanId: string;
		resultsCount: number;
		modelUsed: string;
		totalRuns: number;
		models: string[];
		failedModels: string[];
	}> => {
		const user = await requireUserForAction(ctx);
		const plan = user.plan as keyof typeof PLAN_LIMITS;
		const limit = PLAN_LIMITS[plan].scans;

		if (limit !== -1 && user.scansUsed >= limit) {
			throw new Error(`Scan limit reached (${limit}). Please upgrade your plan.`);
		}

		const project = await ctx.runQuery(api.projects.get, { projectId: args.projectId });
		if (!project) throw new Error('Project not found');

		// Rate limiting: minimum 60 seconds between scans per project
		const SCAN_COOLDOWN_MS = 60 * 1000;
		if (project.lastScanAt && Date.now() - project.lastScanAt < SCAN_COOLDOWN_MS) {
			const remainingSec = Math.ceil(
				(SCAN_COOLDOWN_MS - (Date.now() - project.lastScanAt)) / 1000,
			);
			throw new Error(
				`Please wait ${remainingSec} seconds before scanning again. This prevents excessive API usage.`,
			);
		}

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

		// A specific model forces a single provider; otherwise run every configured
		// provider in this scan so the dashboard can compare them side by side.
		const forcedProvider =
			args.model && args.model !== 'all' ? router.getProviderByName(args.model) : undefined;
		const selectedProviders = forcedProvider ? [forcedProvider] : router.getAllProviders();
		const modelSuccessCounts = new Map<string, number>();

		for (const query of queries) {
			try {
				const visibility = await analyzeVisibilityAcrossModels(
					selectedProviders,
					query.query,
					project.name,
					project.description,
					{ url: project.url, useCase: project.primaryUseCase },
				);

				for (const model of visibility.succeededModels) {
					modelSuccessCounts.set(model, (modelSuccessCounts.get(model) ?? 0) + 1);
				}

				totalRuns += visibility.successfulRuns;
				resultsCount++;

				if (visibility.position === 'primary') primaryMentions++;
				if (visibility.position === 'secondary') secondaryMentions++;

				let competitorData: { competitorMentioned?: string; competitorReasons?: string[] } = {};
				let fixes: { positioningFix?: string; contentSuggestion?: string; messagingFix?: string } =
					{};

				if (visibility.position === 'not_mentioned' && competitorNames.length > 0) {
					const competitor = await analyzeCompetitorWithConfidence(
						router,
						query.query,
						project.name,
						competitorNames,
						forcedProvider,
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
						forcedProvider,
					);

					fixes = fixResult.result;
				}

				await ctx.runMutation(internal.results.saveResultInternal, {
					projectId: args.projectId,
					queryId: query._id,
					scanId,
					model:
						visibility.succeededModels.length > 1
							? 'consensus'
							: (visibility.succeededModels[0] ?? router.getPrimaryProviderName()),
					mentioned: visibility.mentioned,
					position: visibility.position,
					context: visibility.context,
					confidence: visibility.confidence,
					runCount: visibility.runCount,
					successfulRuns: visibility.successfulRuns,
					consensusRatio: visibility.consensusRatio,
					modelResults: toModelResults(visibility),
					rawResponse: JSON.stringify({ visibility, competitor: competitorData, fixes }),
					...competitorData,
					...fixes,
				});
			} catch (error) {
				console.error(`Error processing query "${query.query}":`, error);
			}
		}

		// A provider that never produced a usable run anywhere in the scan failed;
		// surface it so the UI can show partial results instead of hiding the gap.
		const failedModels = selectedProviders
			.map((p) => p.name)
			.filter((name) => (modelSuccessCounts.get(name) ?? 0) === 0);

		const totalQueries = queries.length;
		const visibilityScore =
			totalQueries > 0
				? Math.round(((primaryMentions * 2 + secondaryMentions * 1) / (totalQueries * 2)) * 100)
				: 0;

		await ctx.runMutation(internal.projects.updateVisibilityScoreInternal, {
			projectId: args.projectId,
			score: visibilityScore,
		});

		await ctx.runMutation(internal.users.incrementScansUsed, { userId: user._id });

		const ranModels = selectedProviders.map((p) => p.name);

		return {
			scanId,
			resultsCount,
			modelUsed: ranModels.join(', '),
			totalRuns,
			models: ranModels,
			failedModels,
		};
	},
});

export const runScanForProject = internalAction({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args): Promise<{ scanId: string; resultsCount: number; error?: string }> => {
		const project = await ctx.runQuery(internal.projects.getById, { projectId: args.projectId });
		if (!project) return { scanId: '', resultsCount: 0, error: 'Project not found' };

		const user = await ctx.runQuery(internal.users.getById, { userId: project.userId });
		if (!user) return { scanId: '', resultsCount: 0, error: 'User not found' };

		// Verify user is on a paid plan for auto-scans
		if (user.plan === 'free') {
			console.log(`Skipping auto-scan for free user ${user.email}`);
			return { scanId: '', resultsCount: 0 };
		}

		const plan = user.plan as keyof typeof PLAN_LIMITS;
		const limit = PLAN_LIMITS[plan].scans;

		if (limit !== -1 && user.scansUsed >= limit) {
			console.log(`User ${user.email} has reached scan limit (${limit}), skipping auto-scan`);
			return { scanId: '', resultsCount: 0 };
		}

		const competitors = await ctx.runQuery(internal.competitors.listByProjectInternal, {
			projectId: args.projectId,
		});
		const competitorNames = competitors.map((c: { name: string }) => c.name);

		const queries = await ctx.runQuery(internal.intentQueries.listActiveInternal, {
			projectId: args.projectId,
		});

		if (queries.length === 0) {
			console.log(`No active queries for project ${args.projectId}, skipping scan`);
			return { scanId: '', resultsCount: 0 };
		}

		const scanId = `auto_scan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

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
		const selectedProviders = router.getAllProviders();

		let resultsCount = 0;
		let primaryMentions = 0;
		let secondaryMentions = 0;

		for (const query of queries) {
			try {
				const visibility = await analyzeVisibilityAcrossModels(
					selectedProviders,
					query.query,
					project.name,
					project.description,
					{ url: project.url, useCase: project.primaryUseCase },
				);

				resultsCount++;

				if (visibility.position === 'primary') primaryMentions++;
				if (visibility.position === 'secondary') secondaryMentions++;

				let competitorData: { competitorMentioned?: string; competitorReasons?: string[] } = {};
				let fixes: { positioningFix?: string; contentSuggestion?: string; messagingFix?: string } =
					{};

				if (visibility.position === 'not_mentioned' && competitorNames.length > 0) {
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

				await ctx.runMutation(internal.results.saveResultInternal, {
					projectId: args.projectId,
					queryId: query._id,
					scanId,
					model:
						visibility.succeededModels.length > 1
							? 'consensus'
							: (visibility.succeededModels[0] ?? router.getPrimaryProviderName()),
					mentioned: visibility.mentioned,
					position: visibility.position,
					context: visibility.context,
					confidence: visibility.confidence,
					runCount: visibility.runCount,
					successfulRuns: visibility.successfulRuns,
					consensusRatio: visibility.consensusRatio,
					modelResults: toModelResults(visibility),
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

		await ctx.runMutation(internal.projects.updateVisibilityScoreInternal, {
			projectId: args.projectId,
			score: visibilityScore,
		});

		await ctx.runMutation(internal.users.incrementScansUsed, { userId: user._id });

		return { scanId, resultsCount };
	},
});


export const runAutoScansForPaidUsers = internalAction({
	args: {},
	handler: async (ctx) => {
		const paidUsers = await ctx.runQuery(internal.users.listPaid);
		console.log(`Running auto-scans for ${paidUsers.length} paid users`);

		let totalScanned = 0;
		let totalSkipped = 0;

		for (const user of paidUsers) {
			const projects = await ctx.runQuery(internal.projects.listByUserId, {
				userId: user._id,
			});

			for (const project of projects) {
				try {
					const result = await ctx.runAction(internal.scans.runScanForProject, {
						projectId: project._id,
					});

					if (result.scanId) {
						totalScanned++;
						console.log(`Scanned project ${project.name} for user ${user.email}`);
					} else {
						totalSkipped++;
					}
				} catch (error) {
					console.error(`Failed to scan project ${project._id}:`, error);
					totalSkipped++;
				}
			}
		}

		return { scanned: totalScanned, skipped: totalSkipped };
	},
});
