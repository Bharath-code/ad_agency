import { v } from 'convex/values';
import { query } from './_generated/server';
import { requireProjectOwner } from './lib/auth';

/**
 * Intent Query Queries
 */
export const listActive = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);
		return ctx.db
			.query('intentQueries')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect();
	},
});

export const listAll = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);
		return ctx.db
			.query('intentQueries')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.collect();
	},
});
