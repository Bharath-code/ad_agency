<script lang="ts">
import { AlertCircle, CheckCircle, Loader2, Play } from 'lucide-svelte';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

type Props = {
	status?: ScanStatus;
	lastScanAt?: number;
	disabled?: boolean;
	onscan: () => void | Promise<void>;
	class?: string;
};

const {
	status = 'idle',
	lastScanAt,
	disabled = false,
	onscan,
	class: className = '',
}: Props = $props();

function formatLastScan(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return 'Just now';
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
	}).format(new Date(timestamp));
}

const statusConfig = {
	idle: { icon: Play, label: 'Run Scan', variant: 'primary' as const },
	scanning: {
		icon: Loader2,
		label: 'Scanning...',
		variant: 'secondary' as const,
	},
	success: {
		icon: CheckCircle,
		label: 'Scan Complete',
		variant: 'success' as const,
	},
	error: {
		icon: AlertCircle,
		label: 'Scan Failed',
		variant: 'error' as const,
	},
};

const config = $derived(statusConfig[status]);
const isDisabled = $derived(disabled || status === 'scanning');
</script>

<div class="scan-button-container {className}">
    <button
        class="scan-button scan-button--{config.variant}"
        onclick={onscan}
        disabled={isDisabled}
    >
        {#if status === "scanning"}
            <Loader2 size={20} class="spin" />
        {:else}
            {@const Icon = config.icon}
            <Icon size={20} />
        {/if}
        <span>{config.label}</span>
    </button>

    {#if lastScanAt}
        <span class="last-scan">Last scan: {formatLastScan(lastScanAt)}</span>
    {:else if status === "idle"}
        <span class="last-scan">Never scanned</span>
    {/if}
</div>

<style>
    .scan-button-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-2);
    }

    .scan-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-8);
        font-size: var(--text-base);
        font-weight: 600;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 180px;
    }

    .scan-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .scan-button--primary {
        background: var(--color-brand);
        color: white;
    }

    .scan-button--primary:hover:not(:disabled) {
        background: var(--color-brand-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }

    .scan-button--secondary {
        background: var(--bg-secondary);
        color: var(--text-secondary);
        border: var(--border-base);
    }

    .scan-button--success {
        background: #dcfce7;
        color: #166534;
    }

    .scan-button--error {
        background: #fee2e2;
        color: #991b1b;
    }

    .last-scan {
        font-size: var(--text-sm);
        color: var(--text-muted);
    }

    :global(.spin) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
