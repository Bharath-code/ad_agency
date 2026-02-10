<script lang="ts">
import { CheckCircle } from 'lucide-svelte';

type Win = {
	query: string;
	context: string;
	confidence: 'high' | 'medium' | 'low';
};

type Props = {
	wins: Win[];
};

const { wins }: Props = $props();
</script>

<div class="top-wins">
    <h3 class="section-title">
        <CheckCircle size={20} class="title-icon" />
        Top Wins
    </h3>

    {#if wins.length === 0}
        <p class="no-data">
            No wins yet. Run a scan to see where you're mentioned.
        </p>
    {:else}
        <ul class="wins-list">
            {#each wins as win}
                <li class="win-item">
                    <div class="win-header">
                        <span class="win-query">{win.query}</span>
                        <span
                            class="confidence-dot confidence--{win.confidence}"
                        ></span>
                    </div>
                    <p class="win-context">{win.context}</p>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .top-wins {
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
        color: #166534;
    }

    :global(.title-icon) {
        color: #22c55e;
    }

    .no-data {
        color: var(--text-muted);
        font-size: var(--text-sm);
    }

    .wins-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .win-item {
        padding: var(--space-4);
        background: #f0fdf4;
        border-radius: var(--radius-sm);
        border-left: 3px solid #22c55e;
    }

    .win-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-2);
    }

    .win-query {
        font-weight: 500;
        font-size: var(--text-sm);
        color: var(--text-primary);
    }

    .confidence-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .confidence--high {
        background: #22c55e;
    }
    .confidence--medium {
        background: #f59e0b;
    }
    .confidence--low {
        background: #ef4444;
    }

    .win-context {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.5;
    }
</style>
