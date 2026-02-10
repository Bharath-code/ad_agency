<script lang="ts">
import { XCircle } from 'lucide-svelte';

type Miss = {
	query: string;
	competitorMentioned?: string;
	reasons: string[];
};

type Props = {
	misses: Miss[];
};

const { misses }: Props = $props();
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
                <li class="miss-item">
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
        color: #991b1b;
    }

    :global(.title-icon) {
        color: #ef4444;
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
        padding: var(--space-4);
        background: #fef2f2;
        border-radius: var(--radius-sm);
        border-left: 3px solid #ef4444;
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
