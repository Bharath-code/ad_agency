'use node';

import { v } from 'convex/values';
import { internal } from './_generated/api';
import { action, internalAction } from './_generated/server';
import { weeklyReportTemplate, welcomeEmailTemplate } from './lib/emailTemplates';
import { sendEmail } from './lib/resend';
import { buildWeeklyReport } from './lib/weeklyReport';

/**
 * Send weekly visibility report email
 */
export const sendWeeklyReport = internalAction({
	args: {
		userId: v.id('users'),
		projectId: v.id('projects'),
	},
	handler: async (ctx, args) => {
		const user = await ctx.runQuery(internal.users.getById, { userId: args.userId });
		if (!user) {
			throw new Error('User not found');
		}

		const project = await ctx.runQuery(internal.projects.getById, { projectId: args.projectId });
		if (!project) {
			throw new Error('Project not found');
		}

		const summary = await ctx.runQuery(internal.results.getDashboardSummaryForProject, {
			projectId: args.projectId,
		});
		if (!summary) {
			throw new Error('Project summary unavailable');
		}

		const previousReport = await ctx.runQuery(internal.weeklyReports.getLatest, {
			projectId: args.projectId,
		});

		const report = buildWeeklyReport(summary, previousReport);

		const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';

		const html = weeklyReportTemplate({
			projectName: project.name,
			previousScore: report.previousScore,
			currentScore: report.currentScore,
			scoreChange: report.scoreChange,
			topWins: report.topWins,
			topMisses: report.topMisses,
			topFixes: report.topFixes,
			dashboardUrl: `${baseUrl}/app/projects/${args.projectId}`,
		});

		const persist = (status: 'sent' | 'failed', emailError?: string) =>
			ctx.runMutation(internal.weeklyReports.create, {
				projectId: args.projectId,
				userId: args.userId,
				previousScore: report.previousScore,
				currentScore: report.currentScore,
				scoreChange: report.scoreChange,
				newCompetitorMentions: report.newCompetitorMentions,
				topFixes: report.topFixes,
				status,
				emailError,
			});

		try {
			await sendEmail({
				to: user.email,
				subject: `Weekly Visibility Report: ${project.name} - Score ${report.currentScore}`,
				html,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			await persist('failed', message);
			throw error;
		}

		await persist('sent');
		return { success: true };
	},
});

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = action({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		const email = identity?.email;
		if (!email) {
			throw new Error('Not authenticated');
		}

		const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5173';

		const html = welcomeEmailTemplate(identity.name || '', `${baseUrl}/app/dashboard`);

		await sendEmail({
			to: email,
			subject: 'Welcome to PromptLens!',
			html,
		});

		return { success: true };
	},
});

/**
 * Process weekly reports for all eligible users
 * Scheduled by cron job
 */
export const processAllWeeklyReports = internalAction({
	args: {},
	handler: async (ctx) => {
		const paidUsers = await ctx.runQuery(internal.users.listPaid);
		console.log(`Processing weekly reports for ${paidUsers.length} paid users`);

		let processedCount = 0;

		for (const user of paidUsers) {
			const projects = await ctx.runQuery(internal.projects.listByUserId, {
				userId: user._id,
			});

			for (const project of projects) {
				try {
					await ctx.runAction(internal.emails.sendWeeklyReport, {
						userId: user._id,
						projectId: project._id,
					});
					processedCount++;
				} catch (error) {
					console.error(`Failed to send report for project ${project._id}:`, error);
				}
			}
		}

		return { processed: processedCount };
	},
});
