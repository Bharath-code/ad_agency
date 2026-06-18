<script lang="ts">
import { Check, Copy, Download, Link2, Lock, Plus, Trash2 } from 'lucide-svelte';
import { api } from '$convex/_generated/api';
import type { Doc, Id } from '$convex/_generated/dataModel';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Modal from '$lib/components/ui/modal.svelte';
import { convex } from '$lib/stores/auth';
import { toasts } from '$lib/stores/toast';

type ReportRow = Doc<'clientReports'>;

let { projectId, entitled }: { projectId: Id<'projects'>; entitled: boolean } = $props();

let reports = $state<ReportRow[]>([]);
let showCreate = $state(false);
let creating = $state(false);
let copiedToken = $state<string | null>(null);

let title = $state('');
let agencyName = $state('');
let includeEvidence = $state(true);
let includeActions = $state(true);
let expiresDays = $state('');

async function load() {
	if (!entitled) return;
	try {
		reports = await convex.query(api.clientReports.list, { projectId });
	} catch (error) {
		console.error('Failed to load client reports:', error);
	}
}

$effect(() => {
	load();
});

function shareUrl(token: string): string {
	const origin = typeof window !== 'undefined' ? window.location.origin : '';
	return `${origin}/r/${token}`;
}

async function createReport() {
	if (!title.trim()) return;
	creating = true;
	try {
		const days = Number.parseInt(expiresDays, 10);
		const expiresAt =
			Number.isFinite(days) && days > 0 ? Date.now() + days * 24 * 60 * 60 * 1000 : undefined;
		await convex.mutation(api.clientReports.create, {
			projectId,
			reportTitle: title.trim(),
			agencyName: agencyName.trim() || undefined,
			includeEvidence,
			includeActions,
			expiresAt,
		});
		title = '';
		agencyName = '';
		expiresDays = '';
		includeEvidence = true;
		includeActions = true;
		showCreate = false;
		await load();
		toasts.success('Client report link created.');
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to create report';
		toasts.error(message);
	} finally {
		creating = false;
	}
}

async function copyLink(token: string) {
	try {
		await navigator.clipboard.writeText(shareUrl(token));
		copiedToken = token;
		setTimeout(() => {
			if (copiedToken === token) copiedToken = null;
		}, 2000);
	} catch {
		toasts.error('Could not copy link.');
	}
}

async function revoke(reportId: Id<'clientReports'>) {
	try {
		await convex.mutation(api.clientReports.revoke, { reportId });
		await load();
		toasts.success('Share link revoked.');
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to revoke';
		toasts.error(message);
	}
}

async function downloadExport(report: ReportRow) {
	try {
		const html = await convex.query(api.clientReports.getExport, { reportId: report._id });
		if (!html) {
			toasts.error('Nothing to export yet — run a scan first.');
			return;
		}
		const blob = new Blob([html], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${report.reportTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.html`;
		a.click();
		URL.revokeObjectURL(url);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Export failed';
		toasts.error(message);
	}
}

function statusLabel(report: ReportRow): { text: string; tone: 'live' | 'off' } {
	if (report.revoked) return { text: 'Revoked', tone: 'off' };
	if (report.expiresAt && report.expiresAt <= Date.now()) return { text: 'Expired', tone: 'off' };
	return { text: 'Live', tone: 'live' };
}
</script>

<section class="report-panel">
	<header class="panel-header">
		<div>
			<h3>Client reports</h3>
			<p class="panel-sub">Share a login-free, white-label report with your client.</p>
		</div>
		{#if entitled}
			<button class="btn-saas btn-saas-secondary" onclick={() => (showCreate = true)}>
				<Plus size={16} />
				New report
			</button>
		{/if}
	</header>

	{#if !entitled}
		<div class="locked">
			<Lock size={18} />
			<div>
				<p class="locked-title">Client reporting is an Agency-plan feature</p>
				<p class="locked-sub">
					Package this project into client-ready share links and white-label exports.
				</p>
			</div>
			<a class="btn-saas btn-saas-primary" href="/app/billing">View plans</a>
		</div>
	{:else if reports.length === 0}
		<p class="empty">No client reports yet. Create one to generate a shareable link.</p>
	{:else}
		<ul class="report-list">
			{#each reports as report (report._id)}
				{@const status = statusLabel(report)}
				<li class="report-row">
					<div class="row-main">
						<span class="row-title">{report.reportTitle}</span>
						<span class="status-pill" class:off={status.tone === 'off'}>{status.text}</span>
					</div>
					<div class="row-meta">
						<Link2 size={13} />
						<span class="token-url">{shareUrl(report.token)}</span>
					</div>
					<div class="row-actions">
						<button class="row-btn" onclick={() => copyLink(report.token)}>
							{#if copiedToken === report.token}
								<Check size={14} /> Copied
							{:else}
								<Copy size={14} /> Copy link
							{/if}
						</button>
						<button class="row-btn" onclick={() => downloadExport(report)}>
							<Download size={14} /> Export
						</button>
						{#if !report.revoked}
							<button class="row-btn danger" onclick={() => revoke(report._id)}>
								<Trash2 size={14} /> Revoke
							</button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<Modal open={showCreate} onclose={() => (showCreate = false)} title="New client report">
	<form
		onsubmit={(e) => {
			e.preventDefault();
			createReport();
		}}
		class="create-form"
	>
		<div class="space-y-2">
			<Label for="report-title">Report title</Label>
			<Input id="report-title" placeholder="Q2 Visibility Review" bind:value={title} required />
		</div>
		<div class="space-y-2">
			<Label for="agency-name">Agency name (white-label, optional)</Label>
			<Input id="agency-name" placeholder="BrightOps" bind:value={agencyName} />
		</div>
		<div class="space-y-2">
			<Label for="expires-days">Link expires in (days, optional)</Label>
			<Input id="expires-days" type="number" min="1" placeholder="30" bind:value={expiresDays} />
		</div>
		<label class="check-row">
			<input type="checkbox" bind:checked={includeEvidence} />
			Include per-prompt evidence
		</label>
		<label class="check-row">
			<input type="checkbox" bind:checked={includeActions} />
			Include recommended actions
		</label>
		<div class="modal-actions">
			<button type="button" class="btn-saas btn-saas-secondary" onclick={() => (showCreate = false)}>
				Cancel
			</button>
			<button type="submit" class="btn-saas btn-saas-primary" disabled={creating || !title.trim()}>
				{creating ? 'Creating…' : 'Create link'}
			</button>
		</div>
	</form>
</Modal>

<style>
	.report-panel {
		background: var(--bg-primary);
		border: var(--border-base);
		border-radius: var(--radius-md);
		padding: var(--space-6);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.panel-header h3 {
		font-size: var(--text-base);
		font-weight: 600;
		margin: 0;
	}

	.panel-sub {
		color: var(--text-muted);
		font-size: var(--text-sm);
		margin: var(--space-1) 0 0;
	}

	.locked {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		border: var(--border-soft);
		border-radius: var(--radius-md);
		background: var(--bg-secondary, transparent);
		color: var(--text-secondary);
	}

	.locked-title {
		font-weight: 600;
		font-size: var(--text-sm);
		margin: 0;
		color: var(--text-primary);
	}

	.locked-sub {
		font-size: var(--text-sm);
		color: var(--text-muted);
		margin: var(--space-1) 0 0;
	}

	.locked a {
		margin-left: auto;
		white-space: nowrap;
	}

	.empty {
		color: var(--text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.report-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.report-row {
		padding: var(--space-4) 0;
		border-top: var(--border-soft);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.report-row:first-child {
		border-top: none;
		padding-top: 0;
	}

	.row-main {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.row-title {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.status-pill {
		font-family: 'JetBrains Mono', monospace;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 2px 8px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-brand) 14%, transparent);
		color: var(--color-brand);
	}

	.status-pill.off {
		background: color-mix(in srgb, var(--color-signal-miss, #b45309) 14%, transparent);
		color: var(--color-signal-miss, #b45309);
	}

	.row-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--text-muted);
		font-size: var(--text-xs);
	}

	.token-url {
		font-family: 'JetBrains Mono', monospace;
		word-break: break-all;
	}

	.row-actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.row-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		background: none;
		border: none;
		cursor: pointer;
		font-size: var(--text-xs);
		color: var(--text-secondary);
		padding: 0;
	}

	.row-btn:hover {
		color: var(--color-brand);
	}

	.row-btn.danger:hover {
		color: var(--color-signal-miss, #b45309);
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.check-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}
</style>
