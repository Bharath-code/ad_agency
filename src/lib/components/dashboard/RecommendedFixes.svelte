<script lang="ts">
import { Lightbulb } from 'lucide-svelte';

type Fix = {
	query: string;
	positioningFix?: string;
	contentSuggestion?: string;
	messagingFix?: string;
};

type Props = {
	fixes: Fix[];
};

const { fixes }: Props = $props();
</script>

<div class="recommended-fixes">
    <h3 class="section-title">
        <Lightbulb size={20} class="title-icon" />
        Recommended Fixes
    </h3>

    {#if fixes.length === 0}
        <p class="no-data">
            No fixes needed yet. Run a scan to get recommendations.
        </p>
    {:else}
        <ul class="fixes-list">
            {#each fixes as fix}
                <li class="fix-item">
                    <p class="fix-query">For: "{fix.query}"</p>
                    <div class="fix-suggestions">
                        {#if fix.positioningFix}
                            <div class="suggestion">
                                <span class="suggestion-label">Positioning</span
                                >
                                <p class="suggestion-text">
                                    {fix.positioningFix}
                                </p>
                            </div>
                        {/if}
                        {#if fix.contentSuggestion}
                            <div class="suggestion">
                                <span class="suggestion-label">Content</span>
                                <p class="suggestion-text">
                                    {fix.contentSuggestion}
                                </p>
                            </div>
                        {/if}
                        {#if fix.messagingFix}
                            <div class="suggestion">
                                <span class="suggestion-label">Messaging</span>
                                <p class="suggestion-text">
                                    {fix.messagingFix}
                                </p>
                            </div>
                        {/if}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .recommended-fixes {
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
        color: var(--color-brand);
    }

    :global(.title-icon) {
        color: var(--color-brand);
    }

    .no-data {
        color: var(--text-muted);
        font-size: var(--text-sm);
    }

    .fixes-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
    }

    .fix-item {
        padding: var(--space-4);
        background: #fff7ed;
        border-radius: var(--radius-sm);
        border-left: 3px solid var(--color-brand);
    }

    .fix-query {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: var(--space-4);
        font-style: italic;
    }

    .fix-suggestions {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .suggestion {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .suggestion-label {
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        color: var(--color-brand);
        letter-spacing: 0.05em;
    }

    .suggestion-text {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.5;
    }
</style>
