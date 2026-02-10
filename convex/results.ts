import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { internalQuery, mutation, type QueryCtx, query } from './_generated/server';
import { requireProjectOwner } from './lib/auth';

type ResultDoc = Doc<'results'>;
type ProjectDoc = Doc<'projects'>;

type DashboardSummary = {
	project: ProjectDoc;
	visibilityScore: number;
	totalQueries: number;
	primaryMentions: number;
	secondaryMentions: number;
	notMentioned: number;
	topWins: Array<{
		query: string;
		context: string;
		confidence: 'high' | 'medium' | 'low';
	}>;
	topMisses: Array<{
		query: string;
		competitorMentioned: string | undefined;
		reasons: string[];
	}>;
	recommendedFixes: Array<{
		query: string;
		positioningFix: string | undefined;
		contentSuggestion: string | undefined;
		messagingFix: string | undefined;
	}>;
};

async function getLatestScanResults(
	ctx: QueryCtx,
	projectId: Id<'projects'>,
): Promise<ResultDoc[]> {
	const latestResult = await ctx.db
		.query('results')
		.withIndex('by_project_createdAt', (q) => q.eq('projectId', projectId))
		.order('desc')
		.first();

	if (!latestResult) {
		return [];
	}

	return ctx.db
		.query('results')
		.withIndex('by_project_and_scan', (q) =>
			q.eq('projectId', projectId).eq('scanId', latestResult.scanId),
		)
		.collect();
}

async function buildDashboardSummary(
	ctx: QueryCtx,
	project: ProjectDoc,
	projectId: Id<'projects'>,
): Promise<DashboardSummary> {
	const latestResults = await getLatestScanResults(ctx, projectId);

	if (latestResults.length === 0) {
		return {
			project,
			visibilityScore: 0,
			totalQueries: 0,
			primaryMentions: 0,
			secondaryMentions: 0,
			notMentioned: 0,
			topWins: [],
			topMisses: [],
			recommendedFixes: [],
		};
	}

	const totalQueries = latestResults.length;
	const primaryMentions = latestResults.filter((r) => r.position === 'primary').length;
	const secondaryMentions = latestResults.filter((r) => r.position === 'secondary').length;
	const notMentioned = latestResults.filter((r) => r.position === 'not_mentioned').length;

	const visibilityScore = Math.round(
		((primaryMentions * 2 + secondaryMentions * 1) / (totalQueries * 2)) * 100,
	);

	const queries = await ctx.db
		.query('intentQueries')
		.withIndex('by_project', (q) => q.eq('projectId', projectId))
		.collect();

	const queryMap = new Map(queries.map((q) => [q._id, q.query]));

	const topWins = latestResults
		.filter((r) => r.position === 'primary')
		.slice(0, 3)
		.map((r) => ({
			query: queryMap.get(r.queryId) ?? '',
			context: r.context,
			confidence: r.confidence,
		}));

	const topMisses = latestResults
		.filter((r) => r.position === 'not_mentioned')
		.slice(0, 3)
		.map((r) => ({
			query: queryMap.get(r.queryId) ?? '',
			competitorMentioned: r.competitorMentioned,
			reasons: r.competitorReasons ?? [],
		}));

	const recommendedFixes = latestResults
		.filter((r) => r.position === 'not_mentioned' && r.positioningFix)
		.slice(0, 3)
		.map((r) => ({
			query: queryMap.get(r.queryId) ?? '',
			positioningFix: r.positioningFix,
			contentSuggestion: r.contentSuggestion,
			messagingFix: r.messagingFix,
		}));

	return {
		project,
		visibilityScore,
		totalQueries,
		primaryMentions,
		secondaryMentions,
		notMentioned,
		topWins,
		topMisses,
		recommendedFixes,
	};
}

/**
 * Results Queries
 */
export const getLatestByScan = query({
	args: { projectId: v.id('projects'), scanId: v.string() },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);
		return ctx.db
			.query('results')
			.withIndex('by_project_and_scan', (q) =>
				q.eq('projectId', args.projectId).eq('scanId', args.scanId),
			)
			.collect();
	},
});

export const getLatestByProject = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);
		return getLatestScanResults(ctx, args.projectId);
	},
});

export const getDashboardSummary = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		const { project } = await requireProjectOwner(ctx, args.projectId);
		return buildDashboardSummary(ctx, project, args.projectId);
	},
});

export const getDashboardSummaryForProject = internalQuery({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		const project = await ctx.db.get(args.projectId);
		if (!project) {
			return null;
		}

		return buildDashboardSummary(ctx, project, args.projectId);
	},
});

/**
 * Competitor Head-to-Head Comparison
 * Shows direct "You vs Competitor X" breakdown - KEY DIFFERENTIATOR from Okara
 */
export const getCompetitorComparison = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);

		const latestResults = await getLatestScanResults(ctx, args.projectId);
		if (latestResults.length === 0) return null;

		const queries = await ctx.db
			.query('intentQueries')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();
		const queryMap = new Map(queries.map((q) => [q._id, q.query]));

		const competitorStats: Record<
			string,
			{
				wins: number;
				reasons: string[];
				queries: string[];
			}
		> = {};

		const brandStats = {
			primaryMentions: 0,
			secondaryMentions: 0,
			notMentioned: 0,
			winningQueries: [] as string[],
		};

		for (const result of latestResults) {
			const queryText = queryMap.get(result.queryId) ?? '';

			if (result.position === 'primary') {
				brandStats.primaryMentions++;
				brandStats.winningQueries.push(queryText);
			} else if (result.position === 'secondary') {
				brandStats.secondaryMentions++;
			} else {
				brandStats.notMentioned++;

				if (result.competitorMentioned) {
					if (!competitorStats[result.competitorMentioned]) {
						competitorStats[result.competitorMentioned] = {
							wins: 0,
							reasons: [],
							queries: [],
						};
					}
					competitorStats[result.competitorMentioned].wins++;
					competitorStats[result.competitorMentioned].queries.push(queryText);
					if (result.competitorReasons) {
						competitorStats[result.competitorMentioned].reasons.push(...result.competitorReasons);
					}
				}
			}
		}

		const competitors = Object.entries(competitorStats)
			.map(([name, stats]) => ({
				name,
				wins: stats.wins,
				winRate: Math.round((stats.wins / latestResults.length) * 100),
				topReasons: [...new Set(stats.reasons)].slice(0, 3),
				queriesWon: stats.queries.slice(0, 3),
			}))
			.sort((a, b) => b.wins - a.wins);

		return {
			totalQueries: latestResults.length,
			brand: {
				...brandStats,
				winRate: Math.round(
					((brandStats.primaryMentions + brandStats.secondaryMentions) / latestResults.length) *
						100,
				),
			},
			competitors,
		};
	},
});

/**
 * Historical Trends
 * Track visibility over time - data moat feature
 */
export const getHistoricalTrends = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);

		const results = await ctx.db
			.query('results')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		if (results.length === 0) return [];

		const scanGroups: Record<string, typeof results> = {};
		for (const result of results) {
			if (!scanGroups[result.scanId]) {
				scanGroups[result.scanId] = [];
			}
			scanGroups[result.scanId].push(result);
		}

		return Object.entries(scanGroups)
			.map(([scanId, scanResults]) => {
				const totalQueries = scanResults.length;
				const primaryMentions = scanResults.filter((r) => r.position === 'primary').length;
				const secondaryMentions = scanResults.filter((r) => r.position === 'secondary').length;

				const score = Math.round(
					((primaryMentions * 2 + secondaryMentions * 1) / (totalQueries * 2)) * 100,
				);

				const createdAt = Math.min(...scanResults.map((r) => r.createdAt));

				return {
					scanId,
					date: new Date(createdAt).toISOString().split('T')[0],
					timestamp: createdAt,
					score,
					totalQueries,
					primaryMentions,
					secondaryMentions,
					notMentioned: totalQueries - primaryMentions - secondaryMentions,
				};
			})
			.sort((a, b) => a.timestamp - b.timestamp);
	},
});

/**
 * Get results with raw responses for transcript view
 */
export const getResultsWithTranscripts = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);

		const latestResults = await getLatestScanResults(ctx, args.projectId);
		if (latestResults.length === 0) return [];

		const queries = await ctx.db
			.query('intentQueries')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();
		const queryMap = new Map(queries.map((q) => [q._id, q.query]));

		return latestResults.map((result) => ({
			...result,
			queryText: queryMap.get(result.queryId) ?? '',
		}));
	},
});

/**
 * Results Mutations
 */
export const saveResult = mutation({
	args: {
		projectId: v.id('projects'),
		queryId: v.id('intentQueries'),
		scanId: v.string(),
		model: v.optional(v.string()),
		mentioned: v.boolean(),
		position: v.union(v.literal('primary'), v.literal('secondary'), v.literal('not_mentioned')),
		context: v.string(),
		confidence: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
		rawResponse: v.optional(v.string()),
		competitorMentioned: v.optional(v.string()),
		competitorReasons: v.optional(v.array(v.string())),
		positioningFix: v.optional(v.string()),
		contentSuggestion: v.optional(v.string()),
		messagingFix: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);

		return ctx.db.insert('results', {
			...args,
			createdAt: Date.now(),
		});
	},
});
