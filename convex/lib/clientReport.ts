/**
 * Client report shaping (Phase 10 — Agency reports).
 *
 * Agencies package a project's diagnostics into a client-ready report that can be
 * shared via an unguessable link (no login) or exported as a white-label HTML file.
 *
 * Everything decidable lives here, pure and dependency-free:
 *   - `buildClientReport` assembles the client-safe payload from already-redacted
 *     inputs (score, competitor wins, slim evidence, actions), honoring the
 *     include toggles. It NEVER reads raw transcripts/system prompts/API metadata —
 *     the only fields a client sees are the ones named in `ClientReport`.
 *   - `isReportAccessible` is the share-link access gate (revoked / expired).
 *   - `buildShareToken` hex-encodes injected random bytes (randomness supplied by
 *     the Convex shell so this stays unit-testable).
 *   - `renderReportHtml` produces a self-contained, branded HTML document, escaping
 *     every dynamic value so report text can never inject markup.
 *
 * The Convex shell (`clientReports.ts`) only does auth/plan gating, token
 * generation, DB I/O, and serves the public share query.
 */

import type { Position } from './consensus';

export interface ClientReportBranding {
	reportTitle: string;
	projectName: string;
	agencyName?: string;
}

export interface ClientReportOptions {
	includeEvidence: boolean;
	includeActions: boolean;
}

export interface ClientReportScore {
	visibilityScore: number;
	totalQueries: number;
	primaryMentions: number;
	secondaryMentions: number;
	notMentioned: number;
}

export interface ClientReportCompetitorWin {
	competitor: string;
	wins: number;
	reasons: string[];
}

/** Client-safe evidence row — typed fields only, never raw transcripts. */
export interface ClientReportEvidenceItem {
	query: string;
	position: Position;
	competitorMentioned?: string;
	context: string;
}

export interface ClientReportAction {
	title: string;
	type: string;
	status: string;
}

export interface ClientReportInput {
	branding: ClientReportBranding;
	options: ClientReportOptions;
	score: ClientReportScore;
	competitorWins: ClientReportCompetitorWin[];
	evidence: ClientReportEvidenceItem[];
	actions: ClientReportAction[];
	generatedAt: number;
}

export interface ClientReport {
	reportTitle: string;
	projectName: string;
	agencyName?: string;
	generatedAt: number;
	score: ClientReportScore;
	competitorWins: ClientReportCompetitorWin[];
	evidence: ClientReportEvidenceItem[];
	actions: ClientReportAction[];
}

/** Stored share-link fields the access gate reads from. */
export interface ShareAccessInput {
	revoked: boolean;
	expiresAt?: number;
}

/**
 * Assemble the client-safe report. Evidence/actions are omitted (emptied) when the
 * agency disabled them for this link. Score and competitor wins are always shown.
 */
export function buildClientReport(input: ClientReportInput): ClientReport {
	return {
		reportTitle: input.branding.reportTitle,
		projectName: input.branding.projectName,
		agencyName: input.branding.agencyName,
		generatedAt: input.generatedAt,
		score: input.score,
		competitorWins: input.competitorWins,
		evidence: input.options.includeEvidence ? input.evidence : [],
		actions: input.options.includeActions ? input.actions : [],
	};
}

/** A share link is readable only while it is neither revoked nor past its expiry. */
export function isReportAccessible(share: ShareAccessInput, now: number): boolean {
	if (share.revoked) return false;
	if (share.expiresAt != null && share.expiresAt <= now) return false;
	return true;
}

/** Lowercase hex encoding of random bytes → an unguessable share slug. */
export function buildShareToken(bytes: ArrayLike<number>): string {
	let out = '';
	for (let i = 0; i < bytes.length; i++) {
		out += (bytes[i] & 0xff).toString(16).padStart(2, '0');
	}
	return out;
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const POSITION_LABEL: Record<Position, string> = {
	primary: 'Recommended',
	secondary: 'Mentioned',
	not_mentioned: 'Not mentioned',
};

function formatDate(ts: number): string {
	return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Render a self-contained, white-label HTML document for the report. Inline styles
 * mirror the evergreen design tokens (evergreen = win, amber = miss) so the file
 * prints/sends with no external assets. Every dynamic value is HTML-escaped.
 */
export function renderReportHtml(report: ClientReport): string {
	const brand = report.agencyName ? escapeHtml(report.agencyName) : 'PromptLens';
	const title = escapeHtml(report.reportTitle);
	const project = escapeHtml(report.projectName);
	const s = report.score;

	const competitorRows =
		report.competitorWins.length > 0
			? report.competitorWins
					.map(
						(c) => `<tr>
				<td>${escapeHtml(c.competitor)}</td>
				<td class="num">${c.wins}</td>
				<td>${c.reasons.map((r) => escapeHtml(r)).join('; ') || '&mdash;'}</td>
			</tr>`,
					)
					.join('\n')
			: '<tr><td colspan="3" class="empty">No competitor wins in the latest scan.</td></tr>';

	const evidenceSection =
		report.evidence.length > 0
			? `<section>
		<h2>Evidence</h2>
		<table>
			<thead><tr><th>Buyer prompt</th><th>Standing</th><th>Winner</th></tr></thead>
			<tbody>
			${report.evidence
				.map(
					(e) => `<tr>
				<td>${escapeHtml(e.query)}</td>
				<td>${escapeHtml(POSITION_LABEL[e.position])}</td>
				<td>${e.competitorMentioned ? escapeHtml(e.competitorMentioned) : '&mdash;'}</td>
			</tr>`,
				)
				.join('\n')}
			</tbody>
		</table>
	</section>`
			: '';

	const actionsSection =
		report.actions.length > 0
			? `<section>
		<h2>Recommended actions</h2>
		<ul class="actions">
			${report.actions
				.map(
					(a) =>
						`<li><span class="tag">${escapeHtml(a.type)}</span> ${escapeHtml(a.title)} <span class="status">${escapeHtml(a.status)}</span></li>`,
				)
				.join('\n')}
		</ul>
	</section>`
			: '';

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} — ${project}</title>
<style>
	:root { --ink:#1c1b16; --paper:#faf9f5; --evergreen:#0c5d4d; --amber:#b45309; --line:#e7e4da; }
	* { box-sizing: border-box; }
	body { margin:0; background:var(--paper); color:var(--ink);
		font-family:'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; line-height:1.5; }
	.wrap { max-width:820px; margin:0 auto; padding:48px 32px; }
	header { border-bottom:2px solid var(--evergreen); padding-bottom:16px; margin-bottom:32px; }
	.brand { font-size:13px; letter-spacing:.08em; text-transform:uppercase; color:var(--evergreen); font-weight:700; }
	h1 { font-size:30px; margin:8px 0 4px; }
	.muted { color:#6b6860; font-size:14px; margin:0; }
	.score { display:flex; align-items:baseline; gap:12px; margin:24px 0; }
	.score .big { font-size:48px; font-weight:700; color:var(--evergreen); }
	.stats { display:flex; gap:24px; flex-wrap:wrap; margin:0 0 8px; padding:0; list-style:none; }
	.stats li { font-size:14px; color:#6b6860; }
	.stats strong { color:var(--ink); font-size:18px; display:block; }
	section { margin:32px 0; }
	h2 { font-size:18px; border-bottom:1px solid var(--line); padding-bottom:8px; }
	table { width:100%; border-collapse:collapse; font-size:14px; }
	th, td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
	th { font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:#6b6860; }
	td.num { font-variant-numeric:tabular-nums; font-weight:600; }
	td.empty { color:#6b6860; font-style:italic; }
	.actions { list-style:none; padding:0; margin:0; }
	.actions li { padding:10px 0; border-bottom:1px solid var(--line); font-size:14px; }
	.tag { display:inline-block; background:var(--evergreen); color:#fff; border-radius:4px;
		font-size:11px; padding:2px 8px; text-transform:uppercase; letter-spacing:.04em; }
	.status { color:#6b6860; font-size:12px; text-transform:uppercase; letter-spacing:.04em; }
	footer { margin-top:48px; border-top:1px solid var(--line); padding-top:16px; color:#6b6860; font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
	<header>
		<div class="brand">${brand}</div>
		<h1>${title}</h1>
		<p class="muted">${project} · Generated ${formatDate(report.generatedAt)}</p>
	</header>

	<section>
		<h2>AI visibility score</h2>
		<div class="score"><span class="big">${s.visibilityScore}</span><span class="muted">out of 100</span></div>
		<ul class="stats">
			<li><strong>${s.primaryMentions}</strong>Recommended</li>
			<li><strong>${s.secondaryMentions}</strong>Mentioned</li>
			<li><strong>${s.notMentioned}</strong>Not mentioned</li>
			<li><strong>${s.totalQueries}</strong>Buyer prompts</li>
		</ul>
	</section>

	<section>
		<h2>Competitor wins</h2>
		<table>
			<thead><tr><th>Competitor</th><th class="num">Wins</th><th>Why they win</th></tr></thead>
			<tbody>
			${competitorRows}
			</tbody>
		</table>
	</section>

	${evidenceSection}
	${actionsSection}

	<footer>Prepared with PromptLens · AI recommendation diagnostics</footer>
</div>
</body>
</html>`;
}
