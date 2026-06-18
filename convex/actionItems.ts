import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { type QueryCtx, mutation, query } from './_generated/server';
import { type ActionQueueView, buildActionQueue } from './lib/actionQueue';
import { requireProjectOwner, requireUser } from './lib/auth';
import type { Position } from './lib/consensus';

const actionTypeValidator = v.union(
	v.literal('positioning'),
	v.literal('content'),
	v.literal('proof'),
	v.literal('comparison'),
	v.literal('source'),
);

const statusValidator = v.union(
	v.literal('planned'),
	v.literal('shipped'),
	v.literal('ignored'),
	v.literal('archived'),
);

/** Rows of the latest scan for a project (empty when never scanned). */
async function getLatestScanResults(
	ctx: QueryCtx,
	projectId: Id<'projects'>,
): Promise<Doc<'results'>[]> {
	const latest = await ctx.db
		.query('results')
		.withIndex('by_project_createdAt', (q) => q.eq('projectId', projectId))
		.order('desc')
		.first();
	if (!latest) return [];
	return ctx.db
		.query('results')
		.withIndex('by_project_and_scan', (q) =>
			q.eq('projectId', projectId).eq('scanId', latest.scanId),
		)
		.collect();
}

/**
 * Create an action item from a missed (or weak) prompt. The prompt's current
 * standing in the latest scan is captured as the baseline so re-scans can show
 * before/after movement (AC5).
 */
export const create = mutation({
	args: {
		projectId: v.id('projects'),
		queryId: v.id('intentQueries'),
		type: actionTypeValidator,
		title: v.string(),
		detail: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);

		const intentQuery = await ctx.db.get(args.queryId);
		if (!intentQuery || intentQuery.projectId !== args.projectId) {
			throw new Error('Intent query does not belong to this project');
		}

		const title = args.title.trim();
		if (!title) {
			throw new Error('Action title is required');
		}

		// Capture the prompt's standing from the latest scan as the baseline.
		const latestResults = await getLatestScanResults(ctx, args.projectId);
		const baseline = latestResults.find((r) => r.queryId === args.queryId);

		const now = Date.now();
		return ctx.db.insert('actionItems', {
			projectId: args.projectId,
			queryId: args.queryId,
			type: args.type,
			title,
			detail: args.detail?.trim() || undefined,
			status: 'planned',
			baselinePosition: baseline?.position ?? 'not_mentioned',
			baselineScanId: baseline?.scanId,
			baselineConfidence: baseline?.confidence,
			competitorAtCreation: baseline?.competitorMentioned,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateStatus = mutation({
	args: {
		actionId: v.id('actionItems'),
		status: statusValidator,
	},
	handler: async (ctx, args) => {
		const user = await requireUser(ctx);
		const action = await ctx.db.get(args.actionId);
		if (!action) {
			throw new Error('Action not found');
		}
		const project = await ctx.db.get(action.projectId);
		if (!project || project.userId !== user._id) {
			throw new Error('Unauthorized access to action');
		}

		const now = Date.now();
		await ctx.db.patch(args.actionId, {
			status: args.status,
			updatedAt: now,
			// Stamp the first time it ships; leave prior shippedAt intact otherwise.
			shippedAt:
				args.status === 'shipped' && !action.shippedAt ? now : action.shippedAt,
		});
	},
});

/**
 * Action queue for a project: every action joined to the latest scan's standing
 * for its prompt (before/after movement), priority-scored, with the top 3
 * planned actions surfaced for the dashboard.
 */
export const list = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args): Promise<ActionQueueView> => {
		await requireProjectOwner(ctx, args.projectId);

		const actions = await ctx.db
			.query('actionItems')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		const queries = await ctx.db
			.query('intentQueries')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();
		const queryMap = new Map<string, string>(queries.map((q) => [q._id, q.query]));

		const latestResults = await getLatestScanResults(ctx, args.projectId);
		const latestScanId = latestResults[0]?.scanId ?? null;
		const currentPositionByQuery = new Map<string, Position>(
			latestResults.map((r) => [r.queryId, r.position]),
		);

		return buildActionQueue(actions, currentPositionByQuery, queryMap, latestScanId);
	},
});
