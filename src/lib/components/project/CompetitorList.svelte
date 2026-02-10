<script lang="ts">
import { ExternalLink, Plus, Trash2 } from 'lucide-svelte';
import * as Badge from '$lib/components/ui/badge/index.js';

type Competitor = {
	_id: string;
	name: string;
	url?: string;
	mentionScore?: number;
};

type Props = {
	competitors: Competitor[];
	readonly?: boolean;
	onAdd?: () => void;
	onRemove?: (id: string) => void;
	class?: string;
};

const {
	competitors = [],
	readonly = false,
	onAdd,
	onRemove,
	class: className = '',
}: Props = $props();
</script>

<div class="competitor-list {className}">
    <header class="list-header">
        <h3>Competitors ({competitors.length})</h3>
        {#if !readonly && onAdd}
            <button class="btn-saas btn-saas-secondary btn-sm" onclick={onAdd}>
                <Plus size={16} />
                Add
            </button>
        {/if}
    </header>

    {#if competitors.length === 0}
        <div class="empty-state">
            <p>No competitors added yet</p>
        </div>
    {:else}
        <ul class="competitors">
            {#each competitors as competitor}
                <li class="competitor-item">
                    <div class="competitor-info">
                        <span class="competitor-name">{competitor.name}</span>
                        {#if competitor.url}
                            <a
                                href={competitor.url}
                                target="_blank"
                                rel="noopener"
                                class="competitor-link"
                                aria-label="Visit {competitor.name} website"
                            >
                                <ExternalLink size={14} />
                            </a>
                        {/if}
                    </div>

                    <div class="competitor-actions">
                        {#if competitor.mentionScore !== undefined}
                            <Badge.Root
                                variant={competitor.mentionScore > 50
                                    ? "success"
                                    : competitor.mentionScore > 25
                                      ? "warning"
                                      : "error"}
                            >
                                {competitor.mentionScore}%
                            </Badge.Root>
                        {/if}

                        {#if !readonly && onRemove}
                            <button
                                class="remove-btn"
                                onclick={() => onRemove?.(competitor._id)}
                                aria-label="Remove {competitor.name}"
                            >
                                <Trash2 size={16} />
                            </button>
                        {/if}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .competitor-list {
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-md);
    }

    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4) var(--space-6);
        border-bottom: var(--border-soft);
    }

    .list-header h3 {
        font-size: var(--text-base);
        font-weight: 600;
        margin: 0;
    }

    .btn-sm {
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-xs);
        gap: var(--space-1);
    }

    .empty-state {
        padding: var(--space-8);
        text-align: center;
        color: var(--text-muted);
        font-size: var(--text-sm);
    }

    .competitors {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .competitor-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4) var(--space-6);
        border-bottom: var(--border-soft);
        transition: background 0.1s ease;
    }

    .competitor-item:last-child {
        border-bottom: none;
    }

    .competitor-item:hover {
        background: var(--bg-secondary);
    }

    .competitor-info {
        display: flex;
        align-items: center;
        gap: var(--space-2);
    }

    .competitor-name {
        font-weight: 500;
    }

    .competitor-link {
        color: var(--text-muted);
        transition: color 0.15s ease;
    }

    .competitor-link:hover {
        color: var(--color-brand);
    }

    .competitor-actions {
        display: flex;
        align-items: center;
        gap: var(--space-3);
    }

    .remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.15s ease;
        opacity: 0;
    }

    .competitor-item:hover .remove-btn {
        opacity: 1;
    }

    .remove-btn:hover {
        background: #fee2e2;
        color: #991b1b;
    }
</style>
