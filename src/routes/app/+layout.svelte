<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { goto } from '$app/navigation';
import Spinner from '$lib/components/ui/spinner.svelte';
import AppLayout from '$lib/layouts/AppLayout.svelte';
import { initAuth, isAuthenticated, isLoading } from '$lib/stores/auth';

const { children } = $props();
let unsubAuth: (() => void) | undefined;

onMount(() => {
	initAuth().then(() => {
		// Watch auth state changes
		unsubAuth = isAuthenticated.subscribe((authenticated) => {
			const loading = $isLoading;
			if (!loading && !authenticated) {
				goto('/login');
			}
		});
	});
});

onDestroy(() => {
	unsubAuth?.();
});
</script>

{#if $isLoading}
    <div class="loading-screen">
        <Spinner size="lg" />
        <p>Loading...</p>
    </div>
{:else if $isAuthenticated}
    <AppLayout>
        {@render children()}
    </AppLayout>
{:else}
    <div class="loading-screen">
        <p>Redirecting to login...</p>
    </div>
{/if}

<style>
    .loading-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: var(--space-4);
        color: var(--text-secondary);
    }
</style>
