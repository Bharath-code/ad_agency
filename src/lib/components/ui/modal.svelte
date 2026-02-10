<script lang="ts">
import type { Snippet } from 'svelte';

type Props = {
	open: boolean;
	title: string;
	size?: 'sm' | 'md' | 'lg';
	onclose?: () => void;
	children: Snippet;
	footer?: Snippet;
};

let { open = $bindable(false), title, size = 'md', onclose, children, footer }: Props = $props();

function close() {
	open = false;
	onclose?.();
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') close();
}

function handleBackdropClick(e: MouseEvent) {
	if (e.target === e.currentTarget) close();
}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <div
        class="modal-backdrop"
        onclick={handleBackdropClick}
        role="presentation"
    >
        <div
            class="modal modal--{size}"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <header class="modal-header">
                <h2 id="modal-title">{title}</h2>
                <button onclick={close} class="modal-close" aria-label="Close">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </header>

            <div class="modal-body">
                {@render children()}
            </div>

            {#if footer}
                <footer class="modal-footer">
                    {@render footer()}
                </footer>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        animation: fadeIn 0.15s ease-out;
    }

    .modal {
        background: var(--bg-primary);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: slideUp 0.2s ease-out;
    }

    .modal--sm {
        width: 400px;
        max-width: 95vw;
    }
    .modal--md {
        width: 560px;
        max-width: 95vw;
    }
    .modal--lg {
        width: 720px;
        max-width: 95vw;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-6);
        border-bottom: var(--border-soft);
    }

    .modal-header h2 {
        font-size: var(--text-lg);
        font-weight: 600;
        margin: 0;
    }

    .modal-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background 0.15s ease;
    }

    .modal-close:hover {
        background: var(--color-slate-100);
        color: var(--text-primary);
    }

    .modal-body {
        padding: var(--space-6);
        overflow-y: auto;
    }

    .modal-footer {
        padding: var(--space-4) var(--space-6);
        border-top: var(--border-soft);
        display: flex;
        justify-content: flex-end;
        gap: var(--space-4);
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
