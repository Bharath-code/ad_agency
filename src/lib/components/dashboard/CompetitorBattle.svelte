<script lang="ts">
import { AlertTriangle, Swords, Trophy } from 'lucide-svelte';

type Competitor = {
	name: string;
	wins: number;
	winRate: number;
	topReasons: string[];
	queriesWon: string[];
};

type BrandStats = {
	primaryMentions: number;
	secondaryMentions: number;
	notMentioned: number;
	winRate: number;
};

type Props = {
	data: {
		totalQueries: number;
		brand: BrandStats;
		competitors: Competitor[];
	} | null;
};

const { data }: Props = $props();
</script>

<div class="competitor-battle">
    <h3 class="section-title">
        <Swords size={20} class="title-icon" />
        Head-to-Head Comparisons
    </h3>

    {#if !data || data.competitors.length === 0}
        <div class="empty-battle">
            <p>
                No competitor data found. Add competitors to your project to see
                head-to-head analytics.
            </p>
        </div>
    {:else}
        <div class="battle-grid">
            {#each data.competitors as competitor}
                <div class="battle-card">
                    <div class="battle-header">
                        <div class="vs-badge">VS</div>
                        <h4>{competitor.name}</h4>
                        <div class="win-rate">
                            <span class="label">Their Win Rate</span>
                            <span
                                class="value {competitor.winRate > 50
                                    ? 'danger'
                                    : 'warning'}"
                            >
                                {competitor.winRate}%
                            </span>
                        </div>
                    </div>

                    <div class="battle-body">
                        {#if competitor.topReasons.length > 0}
                            <div class="reasons-section">
                                <h5>
                                    <AlertTriangle size={14} /> Why they win
                                </h5>
                                <ul>
                                    {#each competitor.topReasons as reason}
                                        <li>{reason}</li>
                                    {/each}
                                </ul>
                            </div>
                        {/if}

                        {#if competitor.queriesWon.length > 0}
                            <div class="queries-section">
                                <h5>
                                    <Trophy size={14} /> Queries they dominate
                                </h5>
                                <div class="query-tags">
                                    {#each competitor.queriesWon as query}
                                        <span class="query-tag">{query}</span>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .competitor-battle {
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

    .empty-battle {
        text-align: center;
        color: var(--text-muted);
        padding: var(--space-8);
        background: var(--bg-secondary);
        border-radius: var(--radius-sm);
    }

    .battle-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-4);
    }

    .battle-card {
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-sm);
        padding: var(--space-4);
        background: var(--bg-surface);
    }

    .battle-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-4);
        padding-bottom: var(--space-3);
        border-bottom: 1px solid var(--border-soft);
    }

    .vs-badge {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-muted);
        background: var(--bg-secondary);
        padding: 2px 6px;
        border-radius: 4px;
        margin-right: 8px;
    }

    .battle-header h4 {
        margin: 0;
        flex: 1;
        font-size: var(--text-lg);
        font-weight: 600;
    }

    .win-rate {
        text-align: right;
    }

    .win-rate .label {
        display: block;
        font-size: 10px;
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.5px;
    }

    .win-rate .value {
        font-weight: 700;
        font-size: var(--text-lg);
    }

    .win-rate .value.danger {
        color: #ef4444;
    }
    .win-rate .value.warning {
        color: #f59e0b;
    }

    .battle-body h5 {
        font-size: 12px;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin: 0 0 var(--space-2) 0;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .reasons-section {
        margin-bottom: var(--space-4);
    }

    .reasons-section ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .reasons-section li {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-bottom: var(--space-2);
        position: relative;
        padding-left: 12px;
    }

    .reasons-section li::before {
        content: "•";
        position: absolute;
        left: 0;
        color: var(--text-muted);
    }

    .query-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .query-tag {
        font-size: 11px;
        background: var(--bg-secondary);
        padding: 2px 8px;
        border-radius: 4px;
        color: var(--text-secondary);
    }
</style>
