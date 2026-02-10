<script lang="ts">
import { CreditCard, Folder, Home, LogOut, Settings } from 'lucide-svelte';
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

async function handleLogout() {
	await signOut();
	window.location.href = '/login';
}
</script>

<aside class="sidebar">
    <div class="sidebar-logo">
        <a href="/app/dashboard" class="logo-link">
            <span class="logo-icon">📊</span>
            <span class="logo-text">AI Visibility</span>
        </a>
    </div>

    <nav class="sidebar-nav">
        {#each navItems as item}
            {@const Icon = item.icon}
            <a
                href={item.href}
                class="nav-item"
                class:active={isActive(item.href, $page.url.pathname)}
            >
                <Icon size={20} />
                <span>{item.label}</span>
            </a>
        {/each}
    </nav>

    <div class="sidebar-footer">
        {#if $convexUser}
            <div class="user-info">
                <span class="user-email">{$convexUser.email}</span>
            </div>
        {/if}
        <button onclick={handleLogout} class="nav-item logout">
            <LogOut size={20} />
            <span>Log Out</span>
        </button>
    </div>
</aside>

<style>
    .sidebar {
        width: 240px;
        height: 100vh;
        background: var(--bg-secondary);
        border-right: var(--border-base);
        display: flex;
        flex-direction: column;
        position: fixed;
        left: 0;
        top: 0;
        z-index: var(--z-sticky);
    }

    .sidebar-logo {
        padding: var(--space-6);
        border-bottom: var(--border-soft);
    }

    .logo-link {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        text-decoration: none;
        color: var(--text-primary);
    }

    .logo-icon {
        font-size: var(--text-2xl);
    }

    .logo-text {
        font-size: var(--text-lg);
        font-weight: 600;
    }

    .sidebar-nav {
        flex: 1;
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 500;
        font-size: var(--text-sm);
        transition: all 0.15s ease;
    }

    .nav-item:hover {
        background: var(--color-slate-100);
        color: var(--text-primary);
    }

    .nav-item.active {
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-brand);
    }

    .sidebar-footer {
        padding: var(--space-4);
        border-top: var(--border-soft);
    }

    .nav-item.logout {
        color: var(--text-muted);
    }

    .nav-item.logout:hover {
        background: #fee2e2;
        color: #991b1b;
    }
</style>
