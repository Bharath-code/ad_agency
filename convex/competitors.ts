import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireProjectOwner } from './lib/auth';

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
		await requireProjectOwner(ctx, args.projectId);
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
