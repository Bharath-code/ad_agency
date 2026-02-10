import { v } from 'convex/values';
import { internal } from './_generated/api';
import { action, internalMutation, query } from './_generated/server';
import { createCheckoutSession, PLAN_LIMITS, PRODUCT_IDS } from './lib/dodo';

/**
 * Create checkout session for subscription upgrade
 */
export const createCheckout = action({
	args: {
		plan: v.union(v.literal('indie'), v.literal('startup')),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		const email = identity?.email;
		if (!identity || !email) {
			throw new Error('Not authenticated');
		}

		// Get user from database
		const user = await ctx.runQuery(internal.users.getByEmail, {
			email,
		});

		if (!user) {
			throw new Error('User not found');
		}

		const productId = PRODUCT_IDS[args.plan];
		const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';

		const session = await createCheckoutSession({
			customerEmail: email,
			customerName: identity.name,
			productId,
			successUrl: `${baseUrl}/app/billing?success=true`,
			cancelUrl: `${baseUrl}/app/billing?canceled=true`,
		});

		return {
			checkoutUrl: session.checkout_url,
			sessionId: session.session_id,
		};
	},
});

/**
 * Handle webhook events from DodoPayments
 */
export const handleWebhook = internalMutation({
	args: {
		eventType: v.string(),
		subscriptionId: v.optional(v.string()),
		customerEmail: v.optional(v.string()),
		planId: v.optional(v.string()),
		status: v.optional(v.string()),
		currentPeriodEnd: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const customerEmail = args.customerEmail;
		if (!customerEmail) {
			console.error('Webhook missing customer email');
			return;
		}

		// Find user by email
		const user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', customerEmail))
			.first();

		if (!user) {
			console.error('User not found for webhook:', customerEmail);
			return;
		}

		switch (args.eventType) {
			case 'subscription.created':
			case 'subscription.updated': {
				// Determine plan from product ID
				const plan = args.planId === PRODUCT_IDS.startup ? 'startup' : 'indie';

				// Check for existing subscription
				const existing = await ctx.db
					.query('subscriptions')
					.withIndex('by_user', (q) => q.eq('userId', user._id))
					.first();

				if (existing) {
					await ctx.db.patch(existing._id, {
						plan,
						status: 'active',
						currentPeriodEnd: args.currentPeriodEnd || Date.now() + 30 * 24 * 60 * 60 * 1000,
					});
				} else {
					await ctx.db.insert('subscriptions', {
						userId: user._id,
						dodoSubscriptionId: args.subscriptionId || '',
						plan,
						status: 'active',
						currentPeriodEnd: args.currentPeriodEnd || Date.now() + 30 * 24 * 60 * 60 * 1000,
						createdAt: Date.now(),
					});
				}

				// Update user plan
				await ctx.db.patch(user._id, { plan });
				break;
			}

			case 'subscription.cancelled': {
				const subscription = await ctx.db
					.query('subscriptions')
					.withIndex('by_user', (q) => q.eq('userId', user._id))
					.first();

				if (subscription) {
					await ctx.db.patch(subscription._id, { status: 'canceled' });
				}

				// Downgrade to free
				await ctx.db.patch(user._id, { plan: 'free' });
				break;
			}
		}
	},
});

/**
 * Get user's current subscription
 */
export const getSubscription = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		const email = identity?.email;
		if (!email) {
			return null;
		}

		const user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', email))
			.first();

		if (!user) {
			return null;
		}

		const subscription = await ctx.db
			.query('subscriptions')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.first();

		return {
			plan: user.plan,
			subscription,
			limits: PLAN_LIMITS[user.plan],
			scansUsed: user.scansUsed,
			canScan: user.plan === 'free' ? user.scansUsed < PLAN_LIMITS.free.scans : true,
		};
	},
});

/**
 * Cancel subscription
 */
export const cancelSubscription = action({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		const email = identity?.email;
		if (!email) {
			throw new Error('Not authenticated');
		}

		// In production, call DodoPayments API to cancel
		// For now, just mark as canceled in our database
		await ctx.runMutation(internal.payments.handleWebhook, {
			eventType: 'subscription.cancelled',
			customerEmail: email,
		});

		return { success: true };
	},
});
