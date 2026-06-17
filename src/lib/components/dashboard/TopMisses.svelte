<script lang="ts">
import { XCircle } from 'lucide-svelte';

type Miss = {
	queryId: string;
	query: string;
	competitorMentioned?: string;
	reasons: string[];
};

type Props = {
	misses: Miss[];
	onSelect?: (queryId: string) => void;
};

const { misses, onSelect }: Props = $props();
</script>

<div class="top-misses">
    <h3 class="section-title">
        <XCircle size={20} class="title-icon" />
        Top Misses
    </h3>

    {#if misses.length === 0}
        <p class="no-data">
            Great news! You're being mentioned everywhere. Run a scan to verify.
        </p>
    {:else}
        <ul class="misses-list">
            {#each misses as miss}
                <li>
                    <button
                        type="button"
                        class="miss-item"
                        class:clickable={!!onSelect}
                        onclick={() => onSelect?.(miss.queryId)}
                        disabled={!onSelect}
                    >
                        <div class="miss-header">
                            <span class="miss-query">{miss.query}</span>
                        </div>
                        {#if miss.competitorMentioned}
                            <p class="competitor-note">
                                <strong>{miss.competitorMentioned}</strong> mentioned
                                instead
                            </p>
                        {/if}
                        {#if miss.reasons.length > 0}
                            <ul class="reasons-list">
                                {#each miss.reasons.slice(0, 2) as reason}
                                    <li class="reason">{reason}</li>
                                {/each}
                            </ul>
                        {/if}
                        {#if onSelect}
                            <span class="evidence-link">View evidence →</span>
                        {/if}
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .top-misses {
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
        margin-bottom: var(--space-4);
        color: var(--color-signal-miss);
    }

    :global(.title-icon) {
        color: var(--color-signal-miss);
    }

    .no-data {
        color: var(--text-muted);
        font-size: var(--text-sm);
    }

    .misses-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .miss-item {
        display: block;
        width: 100%;
        text-align: left;
        font: inherit;
        padding: var(--space-4);
        background: #faf2e3;
        border: none;
        border-left: 3px solid var(--color-signal-miss);
        border-radius: var(--radius-sm);
    }

    .miss-item.clickable {
        cursor: pointer;
        transition: background 0.15s ease;
    }

    .miss-item.clickable:hover {
        background: #f4e7cf;
    }

    .miss-item:disabled {
        cursor: default;
    }

    .evidence-link {
        display: inline-block;
        margin-top: var(--space-2);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--color-signal-miss);
    }

    .miss-header {
        margin-bottom: var(--space-2);
    }

    .miss-query {
        font-weight: 500;
        font-size: var(--text-sm);
        color: var(--text-primary);
    }

    .competitor-note {
        font-size: var(--text-sm);
        color: #92400e;
        margin-bottom: var(--space-2);
    }

    .reasons-list {
        list-style: disc;
        padding-left: var(--space-4);
        font-size: var(--text-sm);
        color: var(--text-secondary);
    }

    .reason {
        margin-bottom: var(--space-1);
    }
</style>
