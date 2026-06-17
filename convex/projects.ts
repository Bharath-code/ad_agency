import { v } from 'convex/values';
import { internalMutation, internalQuery, mutation, query } from './_generated/server';
import { requireProjectOwner, requireUser } from './lib/auth';
import { fillIntentQueryTemplate, INTENT_QUERY_TEMPLATES } from './lib/constants';
import type { PLAN_LIMITS } from './lib/dodo';
import { validateProjectUrl } from './lib/utils';

const MAX_USE_CASE_LENGTH = 200;

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
		url: v.optional(v.string()),
		primaryUseCase: v.optional(v.string()),
		competitors: v.array(
			v.object({
				name: v.string(),
				url: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		// Input validation
		if (args.name.length < 2 || args.name.length > 100) {
			throw new Error('Project name must be between 2 and 100 characters');
		}
		if (args.description.length < 10 || args.description.length > 500) {
			throw new Error('Description must be between 10 and 500 characters');
		}
		if (args.industry.length < 2 || args.industry.length > 50) {
			throw new Error('Industry must be between 2 and 50 characters');
		}
		if (args.competitors.length > 10) {
			throw new Error('Maximum 10 competitors allowed');
		}
		for (const comp of args.competitors) {
			if (comp.name.length < 2 || comp.name.length > 100) {
				throw new Error('Each competitor name must be between 2 and 100 characters');
			}
		}

		let normalizedUrl: string | undefined;
		if (args.url && args.url.trim().length > 0) {
			const urlResult = validateProjectUrl(args.url);
			if (!urlResult.valid) {
				throw new Error(urlResult.error ?? 'Invalid URL');
			}
			normalizedUrl = urlResult.url;
		}

		let useCase: string | undefined;
		if (args.primaryUseCase && args.primaryUseCase.trim().length > 0) {
			useCase = args.primaryUseCase.trim();
			if (useCase.length > MAX_USE_CASE_LENGTH) {
				throw new Error(`Primary use case must be ${MAX_USE_CASE_LENGTH} characters or fewer`);
			}
		}

		const user = await requireUser(ctx);
		const plan = user.plan as keyof typeof PLAN_LIMITS;

		// Count existing projects
		const existingProjects = await ctx.db
			.query('projects')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();

		const PROJECT_LIMITS = { free: 1, indie: 1, startup: 5 };
		const projectLimit = PROJECT_LIMITS[plan];

		if (existingProjects.length >= projectLimit) {
			throw new Error(
				`Project limit reached (${projectLimit}). Upgrade your plan to create more projects.`,
			);
		}

		const primaryCompetitorName = args.competitors[0]?.name ?? 'market leaders';

		// Create project
		const projectId = await ctx.db.insert('projects', {
			userId: user._id,
			name: args.name,
			description: args.description,
			industry: args.industry,
			url: normalizedUrl,
			primaryUseCase: useCase,
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
			// Replace placeholders with actual values (use case falls back to industry)
			const query = fillIntentQueryTemplate(template.query, {
				product: args.name,
				industry: args.industry,
				useCase: useCase ?? args.industry,
				competitor: primaryCompetitorName,
			});

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
		url: v.optional(v.string()),
		primaryUseCase: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { projectId, url, primaryUseCase, ...rest } = args;
		await requireProjectOwner(ctx, projectId);

		const updates: Record<string, string | undefined> = { ...rest };

		// URL: empty string clears it; otherwise validate + normalize.
		if (url !== undefined) {
			const trimmed = url.trim();
			if (trimmed.length === 0) {
				updates.url = undefined;
			} else {
				const urlResult = validateProjectUrl(url);
				if (!urlResult.valid) {
					throw new Error(urlResult.error ?? 'Invalid URL');
				}
				updates.url = urlResult.url;
			}
		}

		if (primaryUseCase !== undefined) {
			const trimmed = primaryUseCase.trim();
			if (trimmed.length > MAX_USE_CASE_LENGTH) {
				throw new Error(`Primary use case must be ${MAX_USE_CASE_LENGTH} characters or fewer`);
			}
			updates.primaryUseCase = trimmed.length === 0 ? undefined : trimmed;
		}

		// Filter out keys not explicitly provided (undefined from spread of absent args).
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([key]) => args[key as keyof typeof args] !== undefined),
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

/**
 * Update visibility score (authenticated, verifies ownership)
 */
export const updateVisibilityScore = mutation({
	args: {
		projectId: v.id('projects'),
		score: v.number(),
	},
	handler: async (ctx, args) => {
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

export const updateVisibilityScoreInternal = internalMutation({
	args: {
		projectId: v.id('projects'),
		score: v.number(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.projectId, {
			visibilityScore: args.score,
			lastScanAt: Date.now(),
		});
	},
});
