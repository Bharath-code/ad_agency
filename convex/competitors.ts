import { v } from 'convex/values';
import { internalQuery, mutation, query } from './_generated/server';
import { requireProjectOwner, requireUser } from './lib/auth';
import { PLAN_LIMITS } from './lib/dodo';

/**
 * Competitor Queries
 */
export const listByProject = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);
		return ctx.db
			.query('competitors')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();
	},
});

/**
 * Competitor Mutations
 */
export const add = mutation({
	args: {
		projectId: v.id('projects'),
		name: v.string(),
		url: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Input validation
		if (args.name.length < 2 || args.name.length > 100) {
			throw new Error('Competitor name must be between 2 and 100 characters');
		}
		if (args.url && args.url.length > 500) {
			throw new Error('URL must be less than 500 characters');
		}

		await requireProjectOwner(ctx, args.projectId);

		// Check plan limits
		const user = await requireUser(ctx);
		const plan = user.plan as keyof typeof PLAN_LIMITS;
		const limit = PLAN_LIMITS[plan].competitors;

		const existing = await ctx.db
			.query('competitors')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();

		if (existing.length >= limit) {
			throw new Error(
				`Competitor limit reached (${limit}). Upgrade your plan to add more competitors.`,
			);
		}

		return ctx.db.insert('competitors', {
			projectId: args.projectId,
			name: args.name,
			url: args.url,
		});
	},
});

export const update = mutation({
	args: {
		competitorId: v.id('competitors'),
		name: v.optional(v.string()),
		url: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const competitor = await ctx.db.get(args.competitorId);
		if (!competitor) throw new Error('Competitor not found');

		await requireProjectOwner(ctx, competitor.projectId);

		const { competitorId, ...updates } = args;

		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, v]) => v !== undefined),
		);

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(competitorId, filteredUpdates);
		}
	},
});

export const remove = mutation({
	args: { competitorId: v.id('competitors') },
	handler: async (ctx, args) => {
		const competitor = await ctx.db.get(args.competitorId);
		if (!competitor) throw new Error('Competitor not found');

		await requireProjectOwner(ctx, competitor.projectId);

		await ctx.db.delete(args.competitorId);
	},
});

export const listByProjectInternal = internalQuery({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		return ctx.db
			.query('competitors')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();
	},
});
