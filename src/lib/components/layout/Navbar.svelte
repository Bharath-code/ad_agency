<script lang="ts">
import { Eye, Github, Menu, X } from 'lucide-svelte';
import * as Button from '$lib/components/ui/button/index.js';
import { convexUser, isAuthenticated } from '$lib/stores/auth';

let mobileMenuOpen = $state(false);
</script>

<header class="navbar">
    <div class="container navbar-flex">
        <a href="/" class="logo">
            <div class="logo-icon">
                <Eye size={20} aria-hidden="true" />
            </div>
            <span class="logo-text">AVI</span>
        </a>

        <nav class="nav-links">
            <a href="/#pricing" class="nav-link">Pricing</a>
            <a href="/#faq" class="nav-link">FAQ</a>
            <a href="https://docs.aivis.io" class="nav-link">Docs</a>
        </nav>

        <div class="nav-actions">
            <a
                href="https://github.com"
                class="github-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
            >
                <Github size={18} aria-hidden="true" />
            </a>
            {#if $isAuthenticated}
                <a href="/app/dashboard" class="nav-link login-link"
                    >Dashboard</a
                >
                <Button.Root
                    variant="brand"
                    class="nav-cta"
                    href="/app/projects/new">New Scan</Button.Root
                >
            {:else}
                <a href="/login" class="nav-link login-link">Log In</a>
                <Button.Root variant="brand" class="nav-cta" href="/login"
                    >Run Free Scan</Button.Root
                >
            {/if}
        </div>

        <button
            class="mobile-toggle"
            onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
        >
            {#if mobileMenuOpen}
                <X size={24} aria-hidden="true" />
            {:else}
                <Menu size={24} aria-hidden="true" />
            {/if}
        </button>
    </div>

    {#if mobileMenuOpen}
        <div class="mobile-menu" id="mobile-menu">
            <a
                href="/#pricing"
                class="mobile-link"
                onclick={() => (mobileMenuOpen = false)}>Pricing</a
            >
            <a
                href="/#faq"
                class="mobile-link"
                onclick={() => (mobileMenuOpen = false)}>FAQ</a
            >
            <a
                href="https://docs.aivis.io"
                class="mobile-link"
                onclick={() => (mobileMenuOpen = false)}>Docs</a
            >
            {#if $isAuthenticated}
                <a
                    href="/app/dashboard"
                    class="mobile-link"
                    onclick={() => (mobileMenuOpen = false)}>Dashboard</a
                >
                <Button.Root
                    variant="brand"
                    class="mobile-cta"
                    href="/app/projects/new">New Scan</Button.Root
                >
            {:else}
                <a
                    href="/login"
                    class="mobile-link"
                    onclick={() => (mobileMenuOpen = false)}>Log In</a
                >
                <Button.Root variant="brand" class="mobile-cta" href="/login"
                    >Run Free Scan</Button.Root
                >
            {/if}
        </div>
    {/if}
</header>

<style>
    .navbar {
        border-bottom: 1px solid var(--color-slate-100);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .navbar-flex {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 80px;
        max-width: var(--container-max-wide);
        margin: 0 auto;
        padding: 0 var(--container-px);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        text-decoration: none;
        color: var(--color-slate-900);
        font-weight: 700;
        font-size: 1.25rem;
    }

    .logo-icon {
        background: var(--color-brand);
        color: white;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
    }

    .nav-links {
        display: flex;
        align-items: center;
        gap: 2rem;
    }

    .nav-link {
        color: var(--color-slate-600);
        font-size: 0.95rem;
        font-weight: 500;
        text-decoration: none;
    }

    .nav-link:hover {
        color: var(--color-slate-900);
    }

    .nav-link:focus-visible {
        color: var(--color-slate-900);
        outline: 2px solid var(--color-brand);
        outline-offset: 4px;
        border-radius: 6px;
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: 1.25rem;
    }

    .github-link {
        color: var(--color-slate-500);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border-radius: 999px;
    }

    .github-link:hover {
        color: var(--color-slate-900);
    }

    .github-link:focus-visible {
        outline: 2px solid var(--color-brand);
        outline-offset: 4px;
        border-radius: 6px;
    }

    .login-link {
        color: var(--color-slate-600);
    }

    .mobile-toggle {
        display: none;
        background: transparent;
        border: none;
        color: var(--color-slate-700);
        cursor: pointer;
        padding: 0.5rem;
    }

    .mobile-toggle:focus-visible {
        outline: 2px solid var(--color-brand);
        outline-offset: 4px;
        border-radius: 8px;
    }

    .mobile-menu {
        display: none;
        flex-direction: column;
        padding: var(--space-6);
        border-top: 1px solid var(--color-slate-100);
        background: white;
    }

    .mobile-link:focus-visible {
        outline: 2px solid var(--color-brand);
        outline-offset: 4px;
        border-radius: 6px;
    }

    .mobile-link {
        display: block;
        padding: var(--space-4) 0;
        color: var(--color-slate-700);
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
        border-bottom: 1px solid var(--color-slate-100);
    }

    .mobile-menu :global(.mobile-cta) {
        margin-top: var(--space-4);
        width: 100%;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .nav-links,
        .nav-actions {
            display: none;
        }

        .mobile-toggle {
            display: flex;
        }

        .mobile-menu {
            display: flex;
        }
    }
</style>
