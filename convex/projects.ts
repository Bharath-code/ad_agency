import { v } from 'convex/values';
import { internalQuery, mutation, query } from './_generated/server';
import { requireProjectOwner, requireUser } from './lib/auth';
import { INTENT_QUERY_TEMPLATES } from './lib/constants';

/**
 * Project Queries
 */
export const list = query({
	args: {},
	handler: async (ctx) => {
		const user = await requireUser(ctx);
		return ctx.db
			.query('projects')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();
	},
});

export const get = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		const { project } = await requireProjectOwner(ctx, args.projectId);
		return project;
	},
});

export const getWithDetails = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		const { project } = await requireProjectOwner(ctx, args.projectId);

		const competitors = await ctx.db
			.query('competitors')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		const queries = await ctx.db
			.query('intentQueries')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		return {
			...project,
			competitors,
			queries,
		};
	},
});

/**
 * Project Mutations
 */
export const create = mutation({
	args: {
		name: v.string(),
		description: v.string(),
		industry: v.string(),
		competitors: v.array(
			v.object({
				name: v.string(),
				url: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const user = await requireUser(ctx);
		const primaryCompetitorName = args.competitors[0]?.name ?? 'market leaders';

		// Create project
		const projectId = await ctx.db.insert('projects', {
			userId: user._id,
			name: args.name,
			description: args.description,
			industry: args.industry,
			createdAt: Date.now(),
		});

		// Add competitors
		for (const competitor of args.competitors) {
			await ctx.db.insert('competitors', {
				projectId,
				name: competitor.name,
				url: competitor.url,
			});
		}

		// Seed 30 intent queries from templates
		for (const template of INTENT_QUERY_TEMPLATES) {
			// Replace placeholders with actual values
			const query = template.query
				.replace('{PRODUCT}', args.name)
				.replace('{INDUSTRY}', args.industry)
				.replace('{USE_CASE}', args.industry)
				.replace('{COMPETITOR}', primaryCompetitorName);

			await ctx.db.insert('intentQueries', {
				projectId,
				query,
				category: template.category,
				isActive: true,
			});
		}

		return projectId;
	},
});

export const update = mutation({
	args: {
		projectId: v.id('projects'),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		industry: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { projectId, ...updates } = args;
		await requireProjectOwner(ctx, projectId);

		// Filter out undefined values
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, v]) => v !== undefined),
		);

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(projectId, filteredUpdates);
		}
	},
});

export const remove = mutation({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);

		// Delete related data first
		const competitors = await ctx.db
			.query('competitors')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		for (const c of competitors) {
			await ctx.db.delete(c._id);
		}

		const queries = await ctx.db
			.query('intentQueries')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		for (const q of queries) {
			await ctx.db.delete(q._id);
		}

		const results = await ctx.db
			.query('results')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		for (const r of results) {
			await ctx.db.delete(r._id);
		}

		const reports = await ctx.db
			.query('weeklyReports')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		for (const report of reports) {
			await ctx.db.delete(report._id);
		}

		// Finally delete the project
		await ctx.db.delete(args.projectId);
	},
});

export const updateVisibilityScore = mutation({
	args: {
		projectId: v.id('projects'),
		score: v.number(),
	},
	handler: async (ctx, args) => {
		// Internal or authorized call? This is called by runScan which validates ownership
		// But for safety, we should validte here too if called directly
		// However, runScan calls it internally.
		// Wait, action calls mutation. The mutation contexts don't share verification automatically unless passed.
		// But the action verifies.
		// Ideally we verify here too.

		// Since runScan is an action, it calls this mutation using ctx.runMutation.
		// Does the mutation know it's being called by an action? No.
		// We should verify ownership here too.

		// However, runScan already does the expensive checks.
		// Let's add the check for consistency.

		await requireProjectOwner(ctx, args.projectId);

		await ctx.db.patch(args.projectId, {
			visibilityScore: args.score,
			lastScanAt: Date.now(),
		});
	},
});

/**
 * List projects by user ID (internal)
 */
export const listByUserId = internalQuery({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		return ctx.db
			.query('projects')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.collect();
	},
});

export const getById = internalQuery({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		return ctx.db.get(args.projectId);
	},
});
