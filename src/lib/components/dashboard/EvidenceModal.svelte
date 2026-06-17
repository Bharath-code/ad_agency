<script lang="ts">
import type { PromptEvidence } from "$convex/lib/evidence";
import { Cpu, FileText, Target, Wrench, X } from "lucide-svelte";

type Props = {
	evidence: PromptEvidence | null;
	onClose: () => void;
};

const { evidence, onClose }: Props = $props();

function positionLabel(position: PromptEvidence["position"]) {
	if (position === "primary") return "Recommended (primary)";
	if (position === "secondary") return "Mentioned (secondary)";
	return "Not mentioned";
}

function modelLabel(model: string) {
	if (model === "consensus") return "Consensus";
	if (model === "openai") return "OpenAI";
	if (model === "claude") return "Anthropic Claude";
	if (!model || model === "unknown") return "Model";
	return model;
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") onClose();
}

const hasFixes = $derived(
	!!(
		evidence?.fixes.positioningFix ||
		evidence?.fixes.contentSuggestion ||
		evidence?.fixes.messagingFix
	),
);
</script>

<svelte:window on:keydown={onKeydown} />

{#if evidence}
	<div class="overlay">
		<button type="button" class="backdrop" aria-label="Close evidence" onclick={onClose}
		></button>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-label="Prompt evidence"
			tabindex="-1"
		>
			<header class="modal-header">
				<div class="header-text">
					<span class="eyebrow">Evidence</span>
					<h2>{evidence.queryText}</h2>
					<p class="scan-date">
						Scanned {new Date(evidence.createdAt).toLocaleString()}
					</p>
				</div>
				<button class="close-btn" onclick={onClose} aria-label="Close evidence">
					<X size={18} />
				</button>
			</header>

			<div class="modal-body">
				<section class="verdict">
					<div class="verdict-main">
						<span class="status-pill status--{evidence.position}">
							{positionLabel(evidence.position)}
						</span>
						<span class="confidence">
							{evidence.confidence} confidence
						</span>
					</div>
					<p class="verdict-context">{evidence.context}</p>
					<p class="run-meta">
						{evidence.successfulRuns}/{evidence.runCount} runs succeeded ·
						{Math.round(evidence.consensusRatio * 100)}% model agreement
					</p>
				</section>

				{#if evidence.models.length > 0}
					<section class="block">
						<h3 class="block-title"><Cpu size={15} /> Per-model breakdown</h3>
						<ul class="model-list">
							{#each evidence.models as m}
								<li class="model-row" class:failed={m.successfulRuns === 0}>
									<span class="model-name">{modelLabel(m.model)}</span>
									{#if m.successfulRuns === 0}
										<span class="model-status">no response</span>
									{:else}
										<span class="model-pos status--{m.position}">
											{positionLabel(m.position)}
										</span>
										<span class="model-meta">
											{m.confidence} · {m.successfulRuns}/{m.runCount} runs ·
											{Math.round(m.consensusRatio * 100)}%
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if evidence.competitorMentioned}
					<section class="block">
						<h3 class="block-title"><Target size={15} /> Who won instead</h3>
						<p class="competitor-name">{evidence.competitorMentioned}</p>
						{#if evidence.competitorReasons.length > 0}
							<ul class="reasons">
								{#each evidence.competitorReasons as reason}
									<li>{reason}</li>
								{/each}
							</ul>
						{/if}
					</section>
				{/if}

				{#if hasFixes}
					<section class="block">
						<h3 class="block-title"><Wrench size={15} /> Recommended fixes</h3>
						<dl class="fixes">
							{#if evidence.fixes.positioningFix}
								<dt>Positioning</dt>
								<dd>{evidence.fixes.positioningFix}</dd>
							{/if}
							{#if evidence.fixes.contentSuggestion}
								<dt>Content</dt>
								<dd>{evidence.fixes.contentSuggestion}</dd>
							{/if}
							{#if evidence.fixes.messagingFix}
								<dt>Messaging</dt>
								<dd>{evidence.fixes.messagingFix}</dd>
							{/if}
						</dl>
					</section>
				{/if}

				<p class="trust-note">
					<FileText size={12} /> Parsed verdict from the structured scan — no internal
					prompts or API metadata shown.
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(28, 27, 22, 0.45);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: var(--space-6);
		overflow-y: auto;
		z-index: var(--z-modal, 1000);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		border: none;
		padding: 0;
		background: transparent;
		cursor: pointer;
		z-index: 0;
	}

	.modal {
		position: relative;
		z-index: 1;
		background: var(--color-background, #faf9f5);
		border: 1px solid var(--color-slate-200, #e7e5de);
		border-radius: var(--radius-lg, 12px);
		box-shadow: var(--shadow-raised);
		width: 100%;
		max-width: 560px;
		margin: auto;
	}

	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-6);
		border-bottom: 1px solid var(--color-slate-200, #e7e5de);
	}

	.eyebrow {
		font-family: var(--font-mono, monospace);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-primary, #0c5d4d);
	}

	.header-text h2 {
		font-family: var(--font-serif, serif);
		font-size: 1.25rem;
		line-height: 1.3;
		margin: var(--space-1) 0;
		color: var(--color-foreground, #1c1b16);
	}

	.scan-date {
		font-size: 0.8rem;
		color: var(--color-slate-500, #78756c);
	}

	.close-btn {
		flex-shrink: 0;
		display: inline-flex;
		padding: var(--space-2);
		border: 1px solid var(--color-slate-200, #e7e5de);
		border-radius: var(--radius-md, 8px);
		background: transparent;
		color: var(--color-foreground, #1c1b16);
		cursor: pointer;
	}

	.close-btn:hover {
		background: var(--color-slate-100, #f0eee8);
	}

	.modal-body {
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.verdict-main {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.status-pill,
	.model-pos {
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
	}

	.status--primary {
		background: rgba(12, 93, 77, 0.12);
		color: var(--color-primary, #0c5d4d);
	}

	.status--secondary {
		background: rgba(12, 93, 77, 0.07);
		color: var(--color-primary, #0c5d4d);
	}

	.status--not_mentioned {
		background: rgba(176, 119, 34, 0.14);
		color: var(--color-signal-miss, #b07722);
	}

	.confidence {
		font-family: var(--font-mono, monospace);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-slate-500, #78756c);
	}

	.verdict-context {
		margin-top: var(--space-3);
		color: var(--color-foreground, #1c1b16);
		line-height: 1.5;
	}

	.run-meta,
	.model-meta {
		font-family: var(--font-mono, monospace);
		font-size: 0.72rem;
		color: var(--color-slate-500, #78756c);
	}

	.run-meta {
		margin-top: var(--space-2);
	}

	.block-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.82rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-slate-500, #78756c);
		margin-bottom: var(--space-3);
	}

	.model-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.model-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-slate-200, #e7e5de);
		border-radius: var(--radius-md, 8px);
	}

	.model-row.failed {
		opacity: 0.7;
	}

	.model-name {
		font-weight: 600;
		min-width: 6rem;
		color: var(--color-foreground, #1c1b16);
	}

	.model-status {
		font-family: var(--font-mono, monospace);
		font-size: 0.72rem;
		color: var(--color-signal-miss, #b07722);
	}

	.competitor-name {
		font-weight: 600;
		color: var(--color-foreground, #1c1b16);
		margin-bottom: var(--space-2);
	}

	.reasons {
		list-style: disc;
		padding-left: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		color: var(--color-foreground, #1c1b16);
	}

	.fixes {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2) var(--space-4);
	}

	.fixes dt {
		font-family: var(--font-mono, monospace);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-primary, #0c5d4d);
	}

	.fixes dd {
		color: var(--color-foreground, #1c1b16);
		line-height: 1.5;
	}

	.trust-note {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.75rem;
		color: var(--color-slate-500, #78756c);
		border-top: 1px solid var(--color-slate-200, #e7e5de);
		padding-top: var(--space-4);
	}

	@media (max-width: 640px) {
		.overlay {
			padding: 0;
		}

		.modal {
			max-width: 100%;
			min-height: 100%;
			border-radius: 0;
			border: none;
		}

		.fixes {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
