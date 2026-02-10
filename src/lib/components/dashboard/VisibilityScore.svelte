<script lang="ts">
type Props = {
	score: number; // 0-100
	confidence?: 'high' | 'medium' | 'low';
	queriesMatched: number;
	totalQueries: number;
};

const { score, confidence = 'medium', queriesMatched, totalQueries }: Props = $props();

// Calculate the stroke-dasharray for the progress ring
const circumference = 2 * Math.PI * 45; // r=45
$effect(() => {
	const progress = (score / 100) * circumference;
});
</script>

<div class="visibility-score">
    <div class="score-ring">
        <svg viewBox="0 0 100 100" class="ring-svg">
            <!-- Background ring -->
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke="var(--color-slate-200)"
                stroke-width="8"
                fill="none"
            />
            <!-- Progress ring -->
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke="var(--color-brand)"
                stroke-width="8"
                fill="none"
                stroke-linecap="round"
                stroke-dasharray="{(score / 100) *
                    circumference} {circumference}"
                transform="rotate(-90 50 50)"
                class="progress-ring"
            />
        </svg>
        <span class="score-value">{score}%</span>
    </div>

    <p class="score-label">
        Mentioned in <strong>{queriesMatched}</strong> of
        <strong>{totalQueries}</strong> AI answers
    </p>

    <span class="confidence-badge confidence--{confidence}">
        {confidence} confidence
    </span>
</div>

<style>
    .visibility-score {
        text-align: center;
        padding: var(--space-8);
    }

    .score-ring {
        position: relative;
        width: 180px;
        height: 180px;
        margin: 0 auto var(--space-4);
    }

    .ring-svg {
        width: 100%;
        height: 100%;
    }

    .progress-ring {
        transition: stroke-dasharray 0.5s ease;
    }

    .score-value {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-4xl);
        font-weight: 700;
        color: var(--color-brand);
        font-family: var(--font-mono);
    }

    .score-label {
        color: var(--text-secondary);
        margin-bottom: var(--space-4);
    }

    .score-label strong {
        color: var(--text-primary);
        font-weight: 600;
    }

    .confidence-badge {
        display: inline-block;
        padding: var(--space-1) var(--space-4);
        border-radius: var(--radius-pill);
        font-size: var(--text-sm);
        font-weight: 500;
    }

    .confidence--high {
        background: #dcfce7;
        color: #166534;
    }

    .confidence--medium {
        background: #fef3c7;
        color: #92400e;
    }

    .confidence--low {
        background: #fee2e2;
        color: #991b1b;
    }
</style>
