<script lang="ts">
import type { ActionQueueView, ActionStatus, ActionType } from "$convex/lib/actionQueue";
import {
	ArrowDownRight,
	ArrowUpRight,
	ClipboardList,
	Clock,
	Minus,
	Search,
} from "lucide-svelte";

type QueueItem = ActionQueueView["items"][number];

type Props = {
	data: ActionQueueView | null;
	onUpdateStatus: (actionId: string, status: ActionStatus) => void;
	onSelectEvidence?: (queryId: string) => void;
};

const { data, onUpdateStatus, onSelectEvidence }: Props = $props();

const TYPE_LABELS: Record<ActionType, string> = {
	positioning: "Positioning",
	content: "Content",
	proof: "Proof",
	comparison: "Comparison",
	source: "Source",
};

const STATUS_OPTIONS: ActionStatus[] = ["planned", "shipped", "ignored", "archived"];

function handleStatusChange(actionId: string, event: Event) {
	const target = event.currentTarget as HTMLSelectElement;
	onUpdateStatus(actionId, target.value as ActionStatus);
}

function positionLabel(p: "primary" | "secondary" | "not_mentioned" | null) {
	if (p === "primary") return "recommended";
	if (p === "secondary") return "mentioned";
	if (p === "not_mentioned") return "not mentioned";
	return "—";
}
</script>

<div class="queue">
	<h3 class="section-title">
		<ClipboardList size={20} class="title-icon" />
		Action Queue
	</h3>

	{#if !data || data.items.length === 0}
		<div class="empty">
			<p>
				No actions yet. Open any missed prompt's evidence and turn a
				recommended fix into a tracked action.
			</p>
		</div>
	{:else}
		{#if data.topPriority.length > 0}
			<div class="block">
				<h4 class="block-label">Top priorities</h4>
				<ol class="top-list">
					{#each data.topPriority as item, i}
						<li class="top-item">
							<span class="rank">{i + 1}</span>
							<div class="top-body">
								<span class="type-tag type--{item.type}">{TYPE_LABELS[item.type]}</span>
								{#if onSelectEvidence}
									<button
										type="button"
										class="top-prompt"
										onclick={() => onSelectEvidence?.(item.queryId)}
									>
										{item.queryText}
										<Search size={12} />
									</button>
								{:else}
									<span class="top-prompt static">{item.queryText}</span>
								{/if}
							</div>
						</li>
					{/each}
				</ol>
			</div>
		{/if}

		<div class="block">
			<h4 class="block-label">
				All actions
				<span class="counts">
					{data.counts.planned} planned · {data.counts.shipped} shipped
				</span>
			</h4>
			<ul class="action-list">
				{#each data.items as item}
					<li class="action-row" class:dimmed={item.status === "archived" || item.status === "ignored"}>
						<div class="action-main">
							<span class="type-tag type--{item.type}">{TYPE_LABELS[item.type]}</span>
							{#if onSelectEvidence}
								<button
									type="button"
									class="action-prompt"
									onclick={() => onSelectEvidence?.(item.queryId)}
								>
									{item.title}
								</button>
							{:else}
								<span class="action-prompt static">{item.title}</span>
							{/if}
						</div>

						<div class="action-controls">
							{#if item.status === "shipped"}
								{#if item.movement.direction === "improved"}
									<span class="move move--up">
										<ArrowUpRight size={13} />
										{positionLabel(item.movement.from)} → {positionLabel(item.movement.to)}
									</span>
								{:else if item.movement.direction === "declined"}
									<span class="move move--down">
										<ArrowDownRight size={13} />
										{positionLabel(item.movement.from)} → {positionLabel(item.movement.to)}
									</span>
								{:else if item.movement.direction === "unchanged"}
									<span class="move move--flat">
										<Minus size={13} /> no change
									</span>
								{:else}
									<span class="move move--pending">
										<Clock size={13} /> awaiting re-scan
									</span>
								{/if}
							{/if}

							<select
								class="status-select status--{item.status}"
								value={item.status}
								onchange={(e) => handleStatusChange(item._id, e)}
							>
								{#each STATUS_OPTIONS as status}
									<option value={status}>{status}</option>
								{/each}
							</select>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.queue {
		background: var(--bg-primary);
		border: var(--border-base);
		border-radius: var(--radius-md);
		padding: var(--space-6);
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-base);
		font-weight: 600;
		margin-bottom: var(--space-6);
		color: var(--text-primary);
	}

	:global(.title-icon) {
		color: var(--color-primary);
	}

	.empty {
		text-align: center;
		color: var(--text-muted);
		padding: var(--space-8);
		background: var(--bg-secondary);
		border-radius: var(--radius-sm);
	}

	.block + .block {
		margin-top: var(--space-6);
	}

	.block-label {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-secondary);
		margin: 0 0 var(--space-3) 0;
	}

	.counts {
		font-family: var(--font-mono, monospace);
		font-size: 11px;
		text-transform: none;
		letter-spacing: 0;
		color: var(--text-muted);
	}

	.top-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.top-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--border-soft);
		border-radius: var(--radius-sm);
		background: var(--bg-surface);
	}

	.rank {
		font-family: var(--font-mono, monospace);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--color-primary);
		min-width: 1.2rem;
		text-align: center;
	}

	.top-body {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.type-tag {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: 999px;
		background: rgba(12, 93, 77, 0.1);
		color: var(--color-primary);
	}

	.top-prompt,
	.action-prompt {
		font-size: var(--text-sm);
		color: var(--text-primary);
		background: transparent;
		border: none;
		padding: 0;
		text-align: left;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	button.top-prompt,
	button.action-prompt {
		cursor: pointer;
	}

	button.top-prompt:hover,
	button.action-prompt:hover {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.action-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.action-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--border-soft);
		flex-wrap: wrap;
	}

	.action-row:last-child {
		border-bottom: none;
	}

	.action-row.dimmed {
		opacity: 0.55;
	}

	.action-main {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 1;
		min-width: 200px;
	}

	.action-controls {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.move {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 11px;
		font-family: var(--font-mono, monospace);
	}

	.move--up {
		color: var(--color-primary);
	}

	.move--down {
		color: var(--color-signal-miss);
	}

	.move--flat,
	.move--pending {
		color: var(--text-muted);
	}

	.status-select {
		font-size: 12px;
		text-transform: capitalize;
		border: 1px solid var(--border-soft);
		border-radius: var(--radius-sm);
		padding: 3px 6px;
		background: var(--bg-surface);
		color: var(--text-secondary);
		cursor: pointer;
	}

	.status-select.status--shipped {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	@media (max-width: 640px) {
		.action-row {
			align-items: flex-start;
		}
	}
</style>
