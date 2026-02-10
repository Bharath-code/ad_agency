import { internal } from '../_generated/api';
import type { Id } from '../_generated/dataModel';
import type { ActionCtx, MutationCtx, QueryCtx } from '../_generated/server';

/**
 * Get authorized user for Queries and Mutations
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();
	const email = identity?.email;
	if (!email) {
		throw new Error('Unauthenticated call');
	}

	const user = await ctx.db
		.query('users')
		.withIndex('by_email', (q) => q.eq('email', email))
		.first();

	if (!user) {
		throw new Error('User not found');
	}

	return user;
}

/**
 * Get authorized user for Actions (uses runQuery)
 */
export async function requireUserForAction(ctx: ActionCtx) {
	const identity = await ctx.auth.getUserIdentity();
	const email = identity?.email;
	if (!email) {
		throw new Error('Unauthenticated call');
	}

	const user = await ctx.runQuery(internal.users.getByEmail, { email });

	if (!user) {
		throw new Error('User not found');
	}

	return user;
}

/**
 * Verify project ownership for Queries/Mutations
 */
export async function requireProjectOwner(ctx: QueryCtx | MutationCtx, projectId: Id<'projects'>) {
	const user = await requireUser(ctx);
	const project = await ctx.db.get(projectId);

	if (!project) {
		throw new Error('Project not found');
	}

	if (project.userId !== user._id) {
		throw new Error('Unauthorized access to project');
	}

	return { user, project };
}
