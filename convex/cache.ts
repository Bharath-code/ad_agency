import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';

export const getCache = internalQuery({
	args: { cacheKey: v.string() },
	handler: async (ctx, args) => {
		return ctx.db
			.query('llmCache')
			.withIndex('by_key', (q) => q.eq('cacheKey', args.cacheKey))
			.first();
	},
});

export const setCache = internalMutation({
	args: {
		cacheKey: v.string(),
		value: v.string(),
		ttlSeconds: v.number(),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		const existing = await ctx.db
			.query('llmCache')
			.withIndex('by_key', (q) => q.eq('cacheKey', args.cacheKey))
			.first();

		if (existing) {
			await ctx.db.delete(existing._id);
		}

		return ctx.db.insert('llmCache', {
			cacheKey: args.cacheKey,
			value: args.value,
			createdAt: now,
			ttlSeconds: args.ttlSeconds,
		});
	},
});
