<script lang="ts">
import { goto } from '$app/navigation';
import { convexUser, signOut } from '$lib/stores/auth';

let isSigningOut = $state(false);

async function handleSignOut() {
	try {
		isSigningOut = true;
		await signOut();
		goto('/login');
	} finally {
		isSigningOut = false;
	}
}
</script>

<div class="settings-page">
	<header class="page-header">
		<h1>Settings</h1>
		<p>Manage your account session.</p>
	</header>

	<section class="settings-card">
		<h2>Account</h2>
		{#if $convexUser}
			<div class="field">
				<span class="label">Email</span>
				<span class="value">{$convexUser.email}</span>
			</div>
			<div class="field">
				<span class="label">Plan</span>
				<span class="value plan">{$convexUser.plan}</span>
			</div>
		{:else}
			<p class="muted">No active user session found.</p>
		{/if}
	</section>

	<section class="settings-card">
		<h2>Session</h2>
		<p class="muted">Sign out from this browser session.</p>
		<button class="btn-saas btn-saas-secondary" onclick={handleSignOut} disabled={isSigningOut}>
			{isSigningOut ? 'Signing out...' : 'Sign out'}
		</button>
	</section>
</div>

<style>
	.settings-page {
		padding: var(--space-8);
		max-width: 900px;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.page-header h1 {
		font-size: var(--text-3xl);
		margin-bottom: var(--space-1);
	}

	.page-header p {
		color: var(--text-secondary);
	}

	.settings-card {
		background: var(--bg-primary);
		border: var(--border-base);
		border-radius: var(--radius-md);
		padding: var(--space-6);
	}

	.settings-card h2 {
		margin: 0 0 var(--space-4);
		font-size: var(--text-lg);
	}

	.field {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) 0;
		border-top: var(--border-soft);
	}

	.field:first-of-type {
		border-top: none;
	}

	.label {
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	.value {
		font-weight: 600;
	}

	.value.plan {
		text-transform: capitalize;
	}

	.muted {
		color: var(--text-secondary);
	}
</style>
