<script lang="ts">
import { CreditCard, Eye, Folder, Home, LogOut, Settings } from 'lucide-svelte';
import { page } from '$app/stores';
import { convexUser, signOut } from '$lib/stores/auth';

type NavItem = {
	href: string;
	label: string;
	icon: typeof Home;
};

const navItems: NavItem[] = [
	{ href: '/app/dashboard', label: 'Dashboard', icon: Home },
	{ href: '/app/projects', label: 'Projects', icon: Folder },
	{ href: '/app/billing', label: 'Billing', icon: CreditCard },
	{ href: '/app/settings', label: 'Settings', icon: Settings },
];

function isActive(href: string, pathname: string): boolean {
	if (href === '/app/dashboard') {
		return pathname === '/app' || pathname === '/app/dashboard';
	}
	return pathname.startsWith(href);
}

function initials(email: string): string {
	return email.slice(0, 2).toUpperCase();
}

async function handleLogout() {
	await signOut();
	window.location.href = '/login';
}
</script>

<aside class="sidebar">
	<div class="sidebar-logo">
		<a href="/app/dashboard" class="logo-link">
			<span class="logo-icon"><Eye size={18} aria-hidden="true" /></span>
			<span class="logo-text">PromptLens</span>
		</a>
	</div>

	<nav class="sidebar-nav">
		<span class="nav-label">Workspace</span>
		{#each navItems as item}
			{@const Icon = item.icon}
			<a
				href={item.href}
				class="nav-item"
				class:active={isActive(item.href, $page.url.pathname)}
				aria-current={isActive(item.href, $page.url.pathname) ? 'page' : undefined}
			>
				<Icon size={18} aria-hidden="true" />
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>

	<div class="sidebar-footer">
		{#if $convexUser}
			<div class="user-info">
				<span class="user-avatar">{initials($convexUser.email)}</span>
				<span class="user-email">{$convexUser.email}</span>
			</div>
		{/if}
		<button onclick={handleLogout} class="nav-item logout">
			<LogOut size={18} aria-hidden="true" />
			<span>Log out</span>
		</button>
	</div>
</aside>

<style>
	.sidebar {
		width: 248px;
		height: 100vh;
		background: var(--color-surface);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		position: fixed;
		left: 0;
		top: 0;
		z-index: var(--z-sticky);
	}

	.sidebar-logo {
		padding: 1.4rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: var(--color-foreground);
	}

	.logo-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: var(--radius-md);
		background: var(--color-primary);
		color: var(--color-primary-foreground);
	}

	.logo-text {
		font-size: 1.05rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.sidebar-nav {
		flex: 1;
		padding: 1.25rem 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.nav-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--color-slate-400);
		padding: 0 0.65rem 0.6rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.6rem 0.65rem;
		border-radius: var(--radius-md);
		color: var(--color-slate-600);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.92rem;
		transition: background 0.12s ease, color 0.12s ease;
	}

	.nav-item:hover {
		background: var(--color-slate-50);
		color: var(--color-foreground);
	}

	.nav-item.active {
		background: var(--color-accent);
		color: var(--color-primary);
		font-weight: 600;
	}

	.sidebar-footer {
		padding: 0.85rem;
		border-top: 1px solid var(--color-border);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0.65rem 0.7rem;
	}

	.user-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		flex: none;
		border-radius: 50%;
		background: var(--color-slate-100);
		color: var(--color-slate-600);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 600;
	}

	.user-email {
		font-size: 0.8rem;
		color: var(--color-slate-500);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nav-item.logout {
		width: 100%;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-slate-500);
		font-family: var(--font-sans);
	}

	.nav-item.logout:hover {
		background: var(--color-slate-50);
		color: var(--color-destructive);
	}
</style>
