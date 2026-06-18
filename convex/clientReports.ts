import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { type QueryCtx, mutation, query } from './_generated/server';
import { requireProjectOwner, requireUser } from './lib/auth';
import {
	type ClientReport,
	type ClientReportCompetitorWin,
	type ClientReportEvidenceItem,
	buildClientReport,
	buildShareToken,
	isReportAccessible,
	renderReportHtml,
} from './lib/clientReport';
import { buildCompetitorWinLoss } from './lib/competitorWinLoss';
import { hasFeature } from './lib/entitlements';
import { calculateVisibilityScore } from './lib/utils';

type ReportDoc = Doc<'clientReports'>;

/** Rows of the latest scan for a project (empty when never scanned). */
async function getLatestScanResults(
	ctx: QueryCtx,
	projectId: Id<'projects'>,
): Promise<Doc<'results'>[]> {
	const latest = await ctx.db
		.query('results')
		.withIndex('by_project_createdAt', (q) => q.eq('projectId', projectId))
		.order('desc')
		.first();
	if (!latest) return [];
	return ctx.db
		.query('results')
		.withIndex('by_project_and_scan', (q) =>
			q.eq('projectId', projectId).eq('scanId', latest.scanId),
		)
		.collect();
}

/**
 * Compose the client-safe report payload from typed sources only. Used by both the
 * public share query and the white-label export, so neither can drift from the
 * other or leak raw transcripts (`buildClientReport` only sees redacted fields).
 */
async function composeReport(ctx: QueryCtx, report: ReportDoc): Promise<ClientReport | null> {
	const project = await ctx.db.get(report.projectId);
	if (!project) return null;

	const latestResults = await getLatestScanResults(ctx, report.projectId);

	const queries = await ctx.db
		.query('intentQueries')
		.withIndex('by_project', (q) => q.eq('projectId', report.projectId))
		.collect();
	const queryMap = new Map<string, string>(queries.map((q) => [q._id, q.query]));

	const totalQueries = latestResults.length;
	const primaryMentions = latestResults.filter((r) => r.position === 'primary').length;
	const secondaryMentions = latestResults.filter((r) => r.position === 'secondary').length;
	const notMentioned = latestResults.filter((r) => r.position === 'not_mentioned').length;

	const winLoss = buildCompetitorWinLoss(latestResults, queryMap);
	const competitorWins: ClientReportCompetitorWin[] = (winLoss?.competitors ?? []).map((c) => ({
		competitor: c.name,
		wins: c.wins,
		reasons: c.reasons.map((r) => r.reason),
	}));

	const evidence: ClientReportEvidenceItem[] = latestResults.map((r) => ({
		query: queryMap.get(r.queryId) ?? '',
		position: r.position,
		competitorMentioned: r.competitorMentioned,
		context: r.context,
	}));

	const actionRows = await ctx.db
		.query('actionItems')
		.withIndex('by_project', (q) => q.eq('projectId', report.projectId))
		.collect();
	const actions = actionRows
		.filter((a) => a.status === 'planned' || a.status === 'shipped')
		.map((a) => ({ title: a.title, type: a.type, status: a.status }));

	return buildClientReport({
		branding: {
			reportTitle: report.reportTitle,
			projectName: project.name,
			agencyName: report.agencyName,
		},
		options: {
			includeEvidence: report.includeEvidence,
			includeActions: report.includeActions,
		},
		score: {
			visibilityScore: calculateVisibilityScore({
				primaryMentions,
				secondaryMentions,
				totalQueries,
			}),
			totalQueries,
			primaryMentions,
			secondaryMentions,
			notMentioned,
		},
		competitorWins,
		evidence,
		actions,
		generatedAt: Date.now(),
	});
}

/** Verify the caller owns the report (via its project) and return both. */
async function requireReportOwner(ctx: QueryCtx, reportId: Id<'clientReports'>) {
	const user = await requireUser(ctx);
	const report = await ctx.db.get(reportId);
	if (!report) throw new Error('Report not found');
	const project = await ctx.db.get(report.projectId);
	if (!project || project.userId !== user._id) {
		throw new Error('Unauthorized access to report');
	}
	return { user, report };
}

/**
 * Create a shareable client report. Agency-tier only (clientReports feature) — the
 * gate throws an upgrade-worded error so the UI can prompt to upgrade.
 */
export const create = mutation({
	args: {
		projectId: v.id('projects'),
		reportTitle: v.string(),
		agencyName: v.optional(v.string()),
		includeEvidence: v.optional(v.boolean()),
		includeActions: v.optional(v.boolean()),
		expiresAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { user } = await requireProjectOwner(ctx, args.projectId);
		if (!hasFeature(user.plan, 'clientReports')) {
			throw new Error('Client reports require the Agency plan. Upgrade to share client reports.');
		}

		const title = args.reportTitle.trim();
		if (!title) throw new Error('Report title is required');

		const token = buildShareToken(crypto.getRandomValues(new Uint8Array(16)));
		const now = Date.now();
		return ctx.db.insert('clientReports', {
			projectId: args.projectId,
			userId: user._id,
			token,
			reportTitle: title,
			agencyName: args.agencyName?.trim() || undefined,
			includeEvidence: args.includeEvidence ?? true,
			includeActions: args.includeActions ?? true,
			revoked: false,
			expiresAt: args.expiresAt,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const update = mutation({
	args: {
		reportId: v.id('clientReports'),
		reportTitle: v.optional(v.string()),
		agencyName: v.optional(v.string()),
		includeEvidence: v.optional(v.boolean()),
		includeActions: v.optional(v.boolean()),
		expiresAt: v.optional(v.number()),
		revoked: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		await requireReportOwner(ctx, args.reportId);
		const patch: Partial<ReportDoc> = { updatedAt: Date.now() };
		if (args.reportTitle !== undefined) {
			const title = args.reportTitle.trim();
			if (!title) throw new Error('Report title is required');
			patch.reportTitle = title;
		}
		if (args.agencyName !== undefined) patch.agencyName = args.agencyName.trim() || undefined;
		if (args.includeEvidence !== undefined) patch.includeEvidence = args.includeEvidence;
		if (args.includeActions !== undefined) patch.includeActions = args.includeActions;
		if (args.expiresAt !== undefined) patch.expiresAt = args.expiresAt;
		if (args.revoked !== undefined) patch.revoked = args.revoked;
		await ctx.db.patch(args.reportId, patch);
	},
});

export const revoke = mutation({
	args: { reportId: v.id('clientReports') },
	handler: async (ctx, args) => {
		await requireReportOwner(ctx, args.reportId);
		await ctx.db.patch(args.reportId, { revoked: true, updatedAt: Date.now() });
	},
});

/** The agency's share links for a project (owner-checked). */
export const list = query({
	args: { projectId: v.id('projects') },
	handler: async (ctx, args) => {
		await requireProjectOwner(ctx, args.projectId);
		return ctx.db
			.query('clientReports')
			.withIndex('by_project', (q) => q.eq('projectId', args.projectId))
			.order('desc')
			.collect();
	},
});

/**
 * Public, login-free read of a shared report by its token. This is the share-link
 * boundary: returns the client-safe payload only while the link is neither revoked
 * nor expired, and never any raw/debug data. No auth — possession of the token is
 * the credential.
 */
export const getShared = query({
	args: { token: v.string() },
	handler: async (ctx, args): Promise<ClientReport | null> => {
		const report = await ctx.db
			.query('clientReports')
			.withIndex('by_token', (q) => q.eq('token', args.token))
			.first();
		if (!report) return null;
		if (!isReportAccessible(report, Date.now())) return null;
		return composeReport(ctx, report);
	},
});

/** White-label HTML export for download (owner + Agency-plan gated). */
export const getExport = query({
	args: { reportId: v.id('clientReports') },
	handler: async (ctx, args): Promise<string | null> => {
		const { user, report } = await requireReportOwner(ctx, args.reportId);
		if (!hasFeature(user.plan, 'clientReports')) {
			throw new Error('White-label exports require the Agency plan.');
		}
		const payload = await composeReport(ctx, report);
		if (!payload) return null;
		return renderReportHtml(payload);
	},
});
