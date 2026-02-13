<script lang="ts">
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-svelte';
import { fly } from 'svelte/transition';
import { type Toast, type ToastType, toasts } from '$lib/stores/toast';

const icons: Record<ToastType, typeof CheckCircle> = {
	success: CheckCircle,
	error: AlertCircle,
	warning: AlertTriangle,
	info: Info,
};

const colors: Record<ToastType, string> = {
	success: 'bg-green-50 border-green-200 text-green-800',
	error: 'bg-red-50 border-red-200 text-red-800',
	warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
	info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors: Record<ToastType, string> = {
	success: 'text-green-500',
	error: 'text-red-500',
	warning: 'text-yellow-500',
	info: 'text-blue-500',
};
</script>

<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<div
			class="toast {colors[toast.type]}"
			transition:fly={{ y: 20, duration: 200 }}
		>
			<svelte:component this={icons[toast.type]} size={20} class={iconColors[toast.type]} />
			<span class="toast-message">{toast.message}</span>
			<button
				class="toast-close"
				onclick={() => toasts.remove(toast.id)}
				aria-label="Dismiss"
			>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 400px;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: 1px solid;
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.toast-message {
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.15s;
	}

	.toast-close:hover {
		opacity: 1;
	}
</style>
