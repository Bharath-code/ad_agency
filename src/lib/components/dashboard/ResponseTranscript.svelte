<script lang="ts">
import { ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-svelte';
import { slide } from 'svelte/transition';

type ResultWithTranscript = {
	queryText: string;
	position: 'primary' | 'secondary' | 'not_mentioned';
	confidence: 'high' | 'medium' | 'low';
	rawResponse?: string;
	createdAt: number;
};

type Props = {
	data: ResultWithTranscript[];
};

const { data }: Props = $props();
let expandedId = $state<string | null>(null);

function toggleExpand(queryText: string) {
	if (expandedId === queryText) {
		expandedId = null;
	} else {
		expandedId = queryText;
	}
}

function formatJSON(jsonString?: string) {
	if (!jsonString) return 'No transcript available.';
	try {
		const obj = JSON.parse(jsonString);
		return JSON.stringify(obj, null, 2);
	} catch (e) {
		return jsonString;
	}
}
</script>

<div class="transcripts-card">
    <h3 class="section-title">
        <FileText size={20} class="title-icon" />
        Response Transcripts
        <span class="badge">Live Evidence</span>
    </h3>

    <div class="transcripts-list">
        {#each data as item}
            <div class="transcript-item {item.position}">
                <button
                    class="transcript-header"
                    onclick={() => toggleExpand(item.queryText)}
                    aria-expanded={expandedId === item.queryText}
                >
                    <div class="query-info">
                        <span class="status-dot {item.position}"></span>
                        <span class="query-text">{item.queryText}</span>
                    </div>

                    <div class="meta-info">
                        <span class="date"
                            >{new Date(
                                item.createdAt,
                            ).toLocaleDateString()}</span
                        >
                        {#if expandedId === item.queryText}
                            <ChevronUp size={16} />
                        {:else}
                            <ChevronDown size={16} />
                        {/if}
                    </div>
                </button>

                {#if expandedId === item.queryText}
                    <div class="transcript-content" transition:slide>
                        <div class="raw-code">
                            <pre>{formatJSON(item.rawResponse)}</pre>
                        </div>
                        <p class="verification-note">
                            <ExternalLink size={12} /> Verified output from OpenAI
                            GPT-4o-mini
                        </p>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .transcripts-card {
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

    .badge {
        font-size: 10px;
        background: #dbeafe;
        color: #1e40af;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: 700;
        margin-left: auto;
    }

    .transcripts-list {
        display: flex;
        flex-direction: column;
        gap: 1px;
        background: var(--border-soft);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-sm);
        overflow: hidden;
    }

    .transcript-item {
        background: var(--bg-primary);
    }

    .transcript-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-3) var(--space-4);
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: background 0.2s;
    }

    .transcript-header:hover {
        background: var(--bg-secondary);
    }

    .query-info {
        display: flex;
        align-items: center;
        gap: var(--space-3);
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .status-dot.primary {
        background: #22c55e;
    }
    .status-dot.secondary {
        background: #eab308;
    }
    .status-dot.not_mentioned {
        background: #ef4444;
    }

    .query-text {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--text-primary);
    }

    .meta-info {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        color: var(--text-muted);
    }

    .date {
        font-size: 11px;
    }

    .transcript-content {
        padding: 0 var(--space-4) var(--space-4) var(--space-4);
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-soft);
    }

    .raw-code {
        margin-top: var(--space-3);
        background: #1e293b;
        color: #e2e8f0;
        padding: var(--space-3);
        border-radius: var(--radius-sm);
        overflow-x: auto;
    }

    pre {
        font-family: "JetBrains Mono", monospace;
        font-size: 11px;
        line-height: 1.5;
        margin: 0;
    }

    .verification-note {
        margin-top: var(--space-2);
        font-size: 10px;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 4px;
        justify-content: flex-end;
    }
</style>
