<script lang="ts">
import { onMount } from 'svelte';
import { page } from '$app/stores';
import { api } from '$convex/_generated/api';
import type { ClientReport } from '$convex/lib/clientReport';
import { convex } from '$lib/stores/auth';
import Spinner from '$lib/components/ui/spinner.svelte';

let loading = $state(true);
let report = $state<ClientReport | null>(null);

const POSITION_LABEL: Record<string, string> = {
	primary: 'Recommended',
	secondary: 'Mentioned',
	not_mentioned: 'Not mentioned',
};

onMount(async () => {
	const token = $page.params.token;
	if (!token) {
		loading = false;
		return;
	}
	try {
		report = await convex.query(api.clientReports.getShared, { token });
	} catch (error) {
		console.error('Failed to load shared report:', error);
		report = null;
	} finally {
		loading = false;
	}
});

function formatDate(ts: number): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(ts));
}
</script>

<svelte:head>
	<title>{report ? `${report.reportTitle} — ${report.projectName}` : 'PromptLens report'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="report-page">
	{#if loading}
		<div class="centered"><Spinner size="lg" /></div>
	{:else if !report}
		<div class="centered unavailable">
			<h1>Report unavailable</h1>
			<p>This report link is no longer active. Ask your agency for an updated link.</p>
		</div>
	{:else}
		<article class="report">
			<header class="report-header">
				<p class="brand">{report.agencyName ?? 'PromptLens'}</p>
				<h1>{report.reportTitle}</h1>
				<p class="meta">{report.projectName} · Generated {formatDate(report.generatedAt)}</p>
			</header>

			<section class="score-block">
				<div class="score">
					<span class="score-num">{report.score.visibilityScore}</span>
					<span class="score-of">/ 100 AI visibility</span>
				</div>
				<ul class="stats">
					<li><strong>{report.score.primaryMentions}</strong><span>Recommended</span></li>
					<li><strong>{report.score.secondaryMentions}</strong><span>Mentioned</span></li>
					<li><strong>{report.score.notMentioned}</strong><span>Not mentioned</span></li>
					<li><strong>{report.score.totalQueries}</strong><span>Buyer prompts</span></li>
				</ul>
			</section>

			<section>
				<h2>Competitor wins</h2>
				{#if report.competitorWins.length === 0}
					<p class="empty">No competitor wins in the latest scan.</p>
				{:else}
					<ul class="competitor-list">
						{#each report.competitorWins as c (c.competitor)}
							<li>
								<div class="comp-head">
									<span class="comp-name">{c.competitor}</span>
									<span class="comp-wins">{c.wins} {c.wins === 1 ? 'win' : 'wins'}</span>
								</div>
								{#if c.reasons.length > 0}
									<ul class="reasons">
										{#each c.reasons as reason, i (i)}
											<li>{reason}</li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			{#if report.evidence.length > 0}
				<section>
					<h2>Evidence</h2>
					<div class="evidence-table">
						<div class="ev-row ev-head">
							<span>Buyer prompt</span><span>Standing</span><span>Winner</span>
						</div>
						{#each report.evidence as e, i (i)}
							<div class="ev-row">
								<span>{e.query}</span>
								<span class="standing" class:miss={e.position === 'not_mentioned'}>
									{POSITION_LABEL[e.position] ?? e.position}
								</span>
								<span>{e.competitorMentioned ?? '—'}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if report.actions.length > 0}
				<section>
					<h2>Recommended actions</h2>
					<ul class="actions">
						{#each report.actions as a, i (i)}
							<li>
								<span class="tag">{a.type}</span>
								<span class="action-title">{a.title}</span>
								<span class="action-status">{a.status}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<footer>Prepared with PromptLens · AI recommendation diagnostics</footer>
		</article>
	{/if}
</div>

<style>
	.report-page {
		min-height: 100vh;
		background: var(--color-background, #faf9f5);
		color: var(--color-foreground, #1c1b16);
		padding: var(--space-8, 2rem) var(--space-4, 1rem);
		font-family: 'Instrument Sans', sans-serif;
	}

	.centered {
		max-width: 820px;
		margin: 0 auto;
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3, 0.75rem);
		text-align: center;
	}

	.unavailable h1 {
		font-family: 'Fraunces', serif;
		margin: 0;
	}

	.unavailable p {
		color: var(--color-slate-500, #6b6860);
	}

	.report {
		max-width: 820px;
		margin: 0 auto;
		background: #fff;
		border: 1px solid var(--color-slate-200, #e7e4da);
		border-radius: 12px;
		padding: clamp(1.5rem, 4vw, 3rem);
		box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.06));
	}

	.report-header {
		border-bottom: 2px solid var(--color-primary, #0c5d4d);
		padding-bottom: 1rem;
		margin-bottom: 2rem;
	}

	.brand {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-primary, #0c5d4d);
		font-weight: 700;
		margin: 0;
	}

	.report-header h1 {
		font-family: 'Fraunces', serif;
		font-size: clamp(1.6rem, 4vw, 2rem);
		margin: 0.5rem 0 0.25rem;
	}

	.meta {
		color: var(--color-slate-500, #6b6860);
		font-size: 0.875rem;
		margin: 0;
	}

	.score-block {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.score {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.score-num {
		font-family: 'JetBrains Mono', monospace;
		font-size: 3rem;
		font-weight: 700;
		color: var(--color-primary, #0c5d4d);
	}

	.score-of {
		color: var(--color-slate-500, #6b6860);
		font-size: 0.875rem;
	}

	.stats {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.stats li {
		text-align: center;
	}

	.stats strong {
		display: block;
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.25rem;
	}

	.stats span {
		font-size: 0.75rem;
		color: var(--color-slate-500, #6b6860);
	}

	section {
		margin: 2rem 0;
	}

	h2 {
		font-family: 'Fraunces', serif;
		font-size: 1.25rem;
		border-bottom: 1px solid var(--color-slate-200, #e7e4da);
		padding-bottom: 0.5rem;
	}

	.empty {
		color: var(--color-slate-500, #6b6860);
		font-style: italic;
		font-size: 0.9rem;
	}

	.competitor-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.competitor-list > li {
		padding: 1rem 0;
		border-bottom: 1px solid var(--color-slate-200, #e7e4da);
	}

	.comp-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.comp-name {
		font-weight: 600;
	}

	.comp-wins {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		color: var(--color-signal-miss, #b45309);
	}

	.reasons {
		margin: 0.5rem 0 0;
		padding-left: 1.1rem;
		color: var(--color-slate-600, #57534e);
		font-size: 0.875rem;
	}

	.evidence-table {
		font-size: 0.875rem;
	}

	.ev-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-slate-200, #e7e4da);
	}

	.ev-head {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-slate-500, #6b6860);
	}

	.standing {
		color: var(--color-primary, #0c5d4d);
		font-weight: 600;
	}

	.standing.miss {
		color: var(--color-signal-miss, #b45309);
	}

	.actions {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.actions li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--color-slate-200, #e7e4da);
		font-size: 0.9rem;
	}

	.tag {
		background: var(--color-primary, #0c5d4d);
		color: #fff;
		border-radius: 4px;
		font-size: 0.65rem;
		padding: 2px 8px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.action-title {
		flex: 1;
	}

	.action-status {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-slate-500, #6b6860);
	}

	footer {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-slate-200, #e7e4da);
		color: var(--color-slate-500, #6b6860);
		font-size: 0.75rem;
		text-align: center;
	}
</style>
