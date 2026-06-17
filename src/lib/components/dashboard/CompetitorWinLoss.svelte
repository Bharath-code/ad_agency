<script lang="ts">
import { AlertTriangle, Search, Swords, Trophy } from 'lucide-svelte';

type ReasonGroup = { reason: string; count: number; queryIds: string[] };
type Competitor = {
	name: string;
	wins: number;
	winRate: number;
	reasons: ReasonGroup[];
	prompts: Array<{ queryId: string; query: string }>;
};

type Props = {
	data: {
		totalQueries: number;
		brand: {
			primaryMentions: number;
			secondaryMentions: number;
			notMentioned: number;
			winRate: number;
		};
		competitors: Competitor[];
	} | null;
	onSelectEvidence?: (queryId: string) => void;
};

const { data, onSelectEvidence }: Props = $props();

const MAX_REASONS = 4;
const MAX_PROMPTS = 4;
</script>

<div class="winloss">
    <h3 class="section-title">
        <Swords size={20} class="title-icon" />
        Competitor Win/Loss
    </h3>

    {#if !data}
        <div class="empty">
            <p>Run a scan to see which competitors win your buyer prompts and why.</p>
        </div>
    {:else if data.competitors.length === 0}
        <div class="empty positive">
            <p>
                No competitor took a prompt in your latest scan. You held every
                prompt across {data.totalQueries} buyer queries.
            </p>
        </div>
    {:else}
        <div class="competitor-list">
            {#each data.competitors as competitor}
                <article class="competitor">
                    <header class="competitor-header">
                        <h4>{competitor.name}</h4>
                        <div class="wins">
                            <span class="wins-count">{competitor.wins}</span>
                            <span class="wins-label">
                                {competitor.wins === 1 ? 'prompt won' : 'prompts won'} ·
                                {competitor.winRate}%
                            </span>
                        </div>
                    </header>

                    {#if competitor.reasons.length > 0}
                        <div class="block">
                            <h5><AlertTriangle size={13} /> Why they win</h5>
                            <ul class="reasons">
                                {#each competitor.reasons.slice(0, MAX_REASONS) as reason}
                                    <li>
                                        {#if onSelectEvidence}
                                            <button
                                                type="button"
                                                class="reason"
                                                onclick={() => onSelectEvidence?.(reason.queryIds[0])}
                                            >
                                                <span class="reason-text">{reason.reason}</span>
                                                {#if reason.count > 1}
                                                    <span class="reason-count">×{reason.count}</span>
                                                {/if}
                                                <span class="reason-link"
                                                    ><Search size={12} /> evidence</span
                                                >
                                            </button>
                                        {:else}
                                            <span class="reason static">
                                                <span class="reason-text">{reason.reason}</span>
                                                {#if reason.count > 1}
                                                    <span class="reason-count">×{reason.count}</span>
                                                {/if}
                                            </span>
                                        {/if}
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}

                    {#if competitor.prompts.length > 0}
                        <div class="block">
                            <h5><Trophy size={13} /> Prompts they win</h5>
                            <div class="prompts">
                                {#each competitor.prompts.slice(0, MAX_PROMPTS) as prompt}
                                    {#if onSelectEvidence}
                                        <button
                                            type="button"
                                            class="prompt"
                                            onclick={() => onSelectEvidence?.(prompt.queryId)}
                                        >
                                            {prompt.query}
                                        </button>
                                    {:else}
                                        <span class="prompt static">{prompt.query}</span>
                                    {/if}
                                {/each}
                                {#if competitor.prompts.length > MAX_PROMPTS}
                                    <span class="prompt-more"
                                        >+{competitor.prompts.length - MAX_PROMPTS} more</span
                                    >
                                {/if}
                            </div>
                        </div>
                    {/if}
                </article>
            {/each}
        </div>
    {/if}
</div>

<style>
    .winloss {
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

    .empty.positive {
        color: var(--color-primary);
    }

    .competitor-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-4);
    }

    .competitor {
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-sm);
        padding: var(--space-4);
        background: var(--bg-surface);
    }

    .competitor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
        padding-bottom: var(--space-3);
        border-bottom: 1px solid var(--border-soft);
    }

    .competitor-header h4 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--text-primary);
    }

    .wins {
        text-align: right;
        line-height: 1.2;
    }

    .wins-count {
        display: block;
        font-family: var(--font-mono, monospace);
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--color-signal-miss);
    }

    .wins-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
    }

    .block + .block {
        margin-top: var(--space-4);
    }

    .block h5 {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary);
        margin: 0 0 var(--space-2) 0;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .reasons {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .reason {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        width: 100%;
        text-align: left;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        background: transparent;
        border: none;
        padding: 4px 6px;
        border-radius: var(--radius-sm);
    }

    button.reason {
        cursor: pointer;
    }

    button.reason:hover {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .reason-text {
        flex: 1;
    }

    .reason-count {
        font-family: var(--font-mono, monospace);
        font-size: 11px;
        color: var(--text-muted);
    }

    .reason-link {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        color: var(--color-primary);
        opacity: 0;
        transition: opacity 0.12s ease;
    }

    button.reason:hover .reason-link,
    button.reason:focus-visible .reason-link {
        opacity: 1;
    }

    .prompts {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .prompt {
        font-size: 11px;
        background: var(--bg-secondary);
        padding: 3px 8px;
        border-radius: 4px;
        color: var(--text-secondary);
        border: 1px solid transparent;
    }

    button.prompt {
        cursor: pointer;
    }

    button.prompt:hover,
    button.prompt:focus-visible {
        border-color: var(--color-primary);
        color: var(--text-primary);
    }

    .prompt-more {
        font-size: 11px;
        color: var(--text-muted);
        align-self: center;
    }
</style>
