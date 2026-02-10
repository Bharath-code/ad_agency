import { v } from 'convex/values';
import { internalMutation, internalQuery, mutation, query } from './_generated/server';
import { requireUser } from './lib/auth';

/**
 * Get current authenticated user
 */
export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		const email = identity?.email;
		if (!email) {
			return null;
		}

		// Find user by Clerk's subject ID
		const user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', email))
			.first();

		return user;
	},
});

export const getUser = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		const user = await requireUser(ctx);
		if (user._id !== args.userId) {
			throw new Error('Unauthorized access to user');
		}
		return user;
	},
});

/**
 * Create or get user after Clerk authentication
 */
export const createOrGetUser = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		const email = identity?.email;
		if (!identity || !email) {
			throw new Error('Not authenticated');
		}

		// Check if user already exists
		const existing = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', email))
			.first();

		if (existing) {
			return existing._id;
		}

		// Create new user with free plan
		return ctx.db.insert('users', {
			email,
			name: identity.name,
			avatarUrl: identity.pictureUrl,
			plan: 'free',
			scansUsed: 0,
			createdAt: Date.now(),
		});
	},
});

export const updateUserPlan = internalMutation({
	args: {
		userId: v.id('users'),
		plan: v.union(v.literal('free'), v.literal('indie'), v.literal('startup')),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.userId, { plan: args.plan });
	},
});

export const incrementScansUsed = internalMutation({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) throw new Error('User not found');

		await ctx.db.patch(args.userId, {
			scansUsed: user.scansUsed + 1,
		});
	},
});

/**
 * Get user by email (internal use for webhooks)
 */
export const getByEmail = internalQuery({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		return ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.first();
	},
});

export const getById = internalQuery({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		return ctx.db.get(args.userId);
	},
});

/**
 * List all users on paid plans (indie or startup)
 */
export const listPaid = internalQuery({
	args: {},
	handler: async (ctx) => {
		const [indieUsers, startupUsers] = await Promise.all([
			ctx.db
				.query('users')
				.withIndex('by_plan', (q) => q.eq('plan', 'indie'))
				.collect(),
			ctx.db
				.query('users')
				.withIndex('by_plan', (q) => q.eq('plan', 'startup'))
				.collect(),
		]);

		return [...indieUsers, ...startupUsers];
	},
});
