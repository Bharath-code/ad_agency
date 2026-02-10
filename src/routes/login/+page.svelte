<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { goto } from '$app/navigation';
import Spinner from '$lib/components/ui/spinner.svelte';
import { initAuth, isAuthenticated, isLoading, signIn, signUp } from '$lib/stores/auth';

let mounted = $state(false);
let unsubAuth: (() => void) | undefined;

onMount(() => {
	initAuth().then(() => {
		mounted = true;

		// If already authenticated, redirect to dashboard
		unsubAuth = isAuthenticated.subscribe((authenticated) => {
			if (!$isLoading && authenticated) {
				goto('/app/dashboard');
			}
		});
	});
});

onDestroy(() => {
	unsubAuth?.();
});
</script>

<div class="login-page">
    <div class="login-card">
        <header class="login-header">
            <span class="logo">📊</span>
            <h1>AI Visibility Intelligence</h1>
            <p>Track your brand's visibility in AI assistant responses</p>
        </header>

        {#if !mounted || $isLoading}
            <div class="loading">
                <Spinner />
            </div>
        {:else}
            <div class="auth-buttons">
                <button class="btn-saas btn-saas-primary" onclick={signIn}>
                    Sign In
                </button>
                <button class="btn-saas btn-saas-secondary" onclick={signUp}>
                    Create Account
                </button>
            </div>

            <p class="terms">
                By continuing, you agree to our Terms of Service and Privacy
                Policy.
            </p>
        {/if}
    </div>

    <a href="/" class="back-link">← Back to home</a>
</div>

<style>
    .login-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        background: var(--bg-secondary);
    }

    .login-card {
        background: var(--bg-primary);
        border: var(--border-base);
        border-radius: var(--radius-lg);
        padding: var(--space-10);
        width: 100%;
        max-width: 400px;
        text-align: center;
    }

    .login-header {
        margin-bottom: var(--space-8);
    }

    .logo {
        font-size: var(--text-4xl);
        display: block;
        margin-bottom: var(--space-4);
    }

    .login-header h1 {
        font-size: var(--text-xl);
        margin-bottom: var(--space-2);
    }

    .login-header p {
        color: var(--text-secondary);
        font-size: var(--text-sm);
    }

    .loading {
        padding: var(--space-8);
        display: flex;
        justify-content: center;
    }

    .auth-buttons {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .auth-buttons button {
        width: 100%;
    }

    .terms {
        margin-top: var(--space-6);
        font-size: var(--text-xs);
        color: var(--text-muted);
    }

    .back-link {
        margin-top: var(--space-6);
        color: var(--text-secondary);
        font-size: var(--text-sm);
        text-decoration: none;
    }

    .back-link:hover {
        color: var(--color-brand);
    }
</style>
