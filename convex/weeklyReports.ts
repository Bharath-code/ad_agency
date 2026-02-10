import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';

/**
 * Get latest weekly report for a project
 */
export const getLatest = internalQuery({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		return ctx.db
			.query('weeklyReports')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.order('desc')
			.first();
	},
});

/**
 * Create a new weekly report
 */
export const create = internalMutation({
	args: {
		projectId: v.id('projects'),
		userId: v.id('users'),
		previousScore: v.number(),
		currentScore: v.number(),
		scoreChange: v.number(),
		newCompetitorMentions: v.array(v.string()),
		topFixes: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		return ctx.db.insert('weeklyReports', {
			projectId: args.projectId,
			userId: args.userId,
			previousScore: args.previousScore,
			currentScore: args.currentScore,
			scoreChange: args.scoreChange,
			newCompetitorMentions: args.newCompetitorMentions,
			topFixes: args.topFixes,
			emailSentAt: Date.now(),
			createdAt: Date.now(),
		});
	},
});

/**
 * Get all reports for a project
 */
export const list = internalQuery({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		return ctx.db
			.query('weeklyReports')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.order('desc')
			.take(10);
	},
});
