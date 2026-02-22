<script lang="ts">
    import { Cpu } from "lucide-svelte";

    let {
        comparisons = [],
    }: {
        comparisons: Array<{
            model: string;
            scanId: string;
            visibilityScore: number;
            totalQueries: number;
            primaryMentions: number;
            secondaryMentions: number;
            notMentioned: number;
            lastScanAt: number;
        }>;
    } = $props();

    function formatModelName(model: string) {
        if (model.includes("gpt-4")) return "OpenAI GPT-4o";
        if (model.includes("claude")) return "Anthropic Claude 3.5";
        return model;
    }
</script>

<div class="card model-comparison-card">
    <div class="card-header">
        <div class="icon-wrapper">
            <Cpu size={20} class="text-brand" />
        </div>
        <div>
            <h2>Model Comparison</h2>
            <p>How different AIs perceive your brand</p>
        </div>
    </div>

    <div class="card-content">
        {#if comparisons.length < 2}
            <div
                class="flex items-center justify-center p-8 text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-100"
            >
                Run scans with at least two different models to see a
                side-by-side comparison here.
            </div>
        {:else}
            <div class="models-grid">
                {#each comparisons as comp}
                    <div class="model-item">
                        <div class="model-header">
                            <span class="model-name"
                                >{formatModelName(comp.model)}</span
                            >
                            <span class="scan-date"
                                >{new Date(
                                    comp.lastScanAt,
                                ).toLocaleDateString()}</span
                            >
                        </div>
                        <div class="score-display">
                            <span
                                class="score-value"
                                class:good={comp.visibilityScore >= 70}
                                class:warning={comp.visibilityScore < 70 &&
                                    comp.visibilityScore >= 40}
                                class:poor={comp.visibilityScore < 40}
                                >{comp.visibilityScore}</span
                            >
                            <span class="score-label">Visibility Score</span>
                        </div>
                        <div class="metrics-row">
                            <div class="metric">
                                <span class="label">Primary</span>
                                <span class="value text-emerald-600"
                                    >{comp.primaryMentions}</span
                                >
                            </div>
                            <div class="metric">
                                <span class="label">Secondary</span>
                                <span class="value text-blue-600"
                                    >{comp.secondaryMentions}</span
                                >
                            </div>
                            <div class="metric">
                                <span class="label">Misses</span>
                                <span class="value text-rose-600"
                                    >{comp.notMentioned}</span
                                >
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .card {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        overflow: hidden;
    }

    .card-header {
        padding: 1.5rem;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }

    .icon-wrapper {
        background: #f8fafc;
        padding: 0.75rem;
        border-radius: 12px;
        color: #4f46e5;
    }

    .card-header h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #0f172a;
        margin: 0 0 0.25rem 0;
    }

    .card-header p {
        font-size: 0.875rem;
        color: #64748b;
        margin: 0;
    }

    .card-content {
        padding: 1.5rem;
    }

    .models-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .model-item {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .model-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 0.75rem;
    }

    .model-name {
        font-weight: 600;
        color: #0f172a;
        font-size: 0.95rem;
    }

    .scan-date {
        font-size: 0.75rem;
        color: #64748b;
    }

    .score-display {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
    }

    .score-value {
        font-size: 2.5rem;
        font-weight: 700;
        letter-spacing: -0.025em;
    }

    .score-value.good {
        color: #10b981;
    }
    .score-value.warning {
        color: #f59e0b;
    }
    .score-value.poor {
        color: #ef4444;
    }

    .score-label {
        font-size: 0.875rem;
        color: #64748b;
        font-weight: 500;
    }

    .metrics-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        background: white;
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .metric {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .metric .label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .metric .value {
        font-size: 1.125rem;
        font-weight: 700;
    }
</style>
